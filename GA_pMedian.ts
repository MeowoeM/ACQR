const shuffle = require('knuth-shuffle');
const std = require("tstl");

namespace GA_pMedian {
    /**
     * P-median solver, an janky implementation of 
     * https://link.springer.com/content/pdf/10.1023/A:1026130003508.pdf
     *
     * @export
     * @class GA_pMedianSolver
     * @template T
     */
    export class GA_pMedianSolver<T> {
        public get demands(): Array<T> {
            return this._demands;
        }

        public get facilities(): Array<T> {
            return this._facilities;
        }

        private _density: number;
        public get density(): number {
            return this._density;
        }

        private _maxIter: number;
        public get maxIter(): number {
            return this._maxIter;
        }

        private _population: Array<Array<T>>;
        public get population(): Array<Array<T>> {
            return this._population;
        }

        private _populationSize: number;
        public get populationSize(): number {
            return this._populationSize;
        }
        
        /**
         * Creates an instance of GA_pMeanSolver.
         * @param {Array<T>} demands
         * @param {Array<T>} facilities
         * @param {Number} n - number of facilities to be placed
         * @param {(arg0: T, arg1: T) => Number} metic: a function to measure the distance from a demand to some facility
         * @memberof GA_pMeanSolver
         */
        constructor(
            private _demands: Array<T>,
            private _facilities: Array<T>,
            private n: number,
            private metric: (facility: T, demand: T) => number,
            private isEqual: (a: T, b: T) => boolean,
            private hash: (t: T) => string
        ) {
            this._density = Math.ceil(this.facilities.length / this.n);
            this._maxIter = Math.ceil(this.demands.length * Math.sqrt(this.n));
            this._populationSize = this.calcPopulationSize();
            console.log(this._populationSize);
        }

        private calcPopulationSize(): number {
            let s = this.combination(this.n, this._facilities.length);
            console.log(this.n, this._facilities.length, s);

            return Math.max(2, Math.ceil(this.n * Math.log(s) / 100 / this._density)) * this._density
        }

        public generatePopulations(size: number){
            let increment = Math.floor(size / this._density); // k
            this._population = new Array(size);

            let idx = 0;
            for (let i = 0; i < Math.floor(this.facilities.length / this.n); i++) {
                let pop: Array<T> = new Array(this.n);
                for (let j = 0; j < this.n; j++) {
                    pop[j] = this.facilities[i * this.n + j]
                }
                this._population[idx] = pop;
                idx++;
            }

            // if n / p is not integer, fill the remaining slots with random facilities
            if (this.facilities.length % this.n > 0) {
                let pop: Array<T> = new Array(this.n);
                let j = 0;
                for (let i = Math.floor(this.facilities.length / this.n) * this.n; i < this.facilities.length; i++) {
                    pop[j] = this.facilities[i];
                    j++;
                }
                pop = this.fillPopulation(pop, j);
                idx++;
            }

            let pointer = 0;
            let cycleIdx = 0;
            for (let i = 0; i < increment; i++) {
                let population: Array<T> = new Array(this.n);
                for (let j = 0; j < this.n; j++) {
                    if (pointer > this.facilities.length) {
                        cycleIdx++;
                        pointer = cycleIdx
                    }
                    population[j] = this.facilities[pointer];
                    pointer += increment;
                }
                this._population[idx] = population;
                idx++
            }
        }

        public isIdenticalPop(a: Array<T>, b: Array<T>): boolean {
            let hashA = a.map(this.hash);
            let hashB = b.map(this.hash);
            hashA.sort((char1, char2) => char2.localeCompare(char1))
            hashB.sort((char1, char2) => char2.localeCompare(char1))

            let result = true;
            for (const [idx, a] of hashA.entries()) {
                if (hashB[idx] != a) {result = false; break}
            }
            return result
        }

        private fillPopulation(population: Array<T>, start): Array<T> {
            let remainingFacilities = new Array<T>();
            let excludes = new ObjectSet.ObjectSet<T>(population.slice(0, start), this.isEqual, this.hash);
            this.facilities.forEach(facility => {
                if (!excludes.has(facility)) {
                    remainingFacilities.push(facility)
                }
            });

            shuffle.knuthShuffle(remainingFacilities)
            for (let i = start; i < population.length; i++) {
                population[i] = remainingFacilities[i];
            }
            return population
        }

        public selectParents(): [Array<T>, Array<T>] {
            let idxes = new Array<number>(this._populationSize);
            for (let idx = 0; idx < this._populationSize; idx++) {
                idxes[idx] = idx;
            }
            let parentsIdx = shuffle.knuthShuffle(idxes).slice(0, 2);
            return [this._population[parentsIdx[0]], this._population[parentsIdx[1]]]
        }

        public generationOp(parents: [Array<T>, Array<T>]): [Array<T>, number] {
            let genes0 = new ObjectSet.ObjectSet(parents[0], this.isEqual, this.hash);
            let genes1 = new ObjectSet.ObjectSet(parents[1], this.isEqual, this.hash);

            // Step 1. Take the union of the input members’ genes to obtain a draft member
            let draftMemberSet = genes0.union(genes1);
            let draftMember = draftMemberSet.toList();

            /* Step 2. Let the total number of genes in this draft member be m. Call the genes that are 
            * present in both parents fixed genes and the rest free genes.
            */
            let fixedGenes = genes0.intersect(genes1);
            let freeGeneSet = draftMemberSet.minus(fixedGenes);
            let freeGenes = freeGeneSet.toList();

            // Step 3. Compute the fitness value of this draft member.
            let distances = new Map<string, Map<string, number>>();
            freeGenes.forEach(gene => {
                distances.set(this.hash(gene), new Map());
            });

            this.demands.forEach(demand => {
                let minDistance = Number.MAX_VALUE;
                let closestFacility = freeGenes[0];
                freeGenes.forEach(facility => {
                    let distance = this.metric(facility, demand);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestFacility = facility;
                    }
                });
                distances[this.hash(closestFacility)].set(
                    this.hash(demand), minDistance
                );
            });
            
            
            /* Step 4. Find the free gene that produces the minimum increase in the current fitness
            * value when deleted from the draft member, and delete it. Repeat this step until
            * freeGenes.length = n. Let this final solution be a candidate member.
            */
            while (freeGenes.length > this.n) {
                let minIncreasedFitness = Number.MAX_VALUE;
                let idxOfGeneToRemove = 0;
                let distancesUpdate = new Map<string, Map<string, number>>();

                // try to delete one gene(facility), calculate how much the total fitness increases
                for (const [idx, gene] of freeGenes.entries()) {
                    let demandsToReallocate = distances[this.hash(gene)].keys()
                    let increasedFitness = 0;
                    let update = new Map();
                    
                    demandsToReallocate.forEach(demand => {
                        let minDistance = Number.MAX_VALUE;
                        let closestFacility = gene;
                        for (const [idx1, gene1] of freeGenes.entries()) {
                            // skip the deleted gene
                            if (idx1 == idx) {continue};
                            let distance = this.metric(gene1, demand);
                            if (distance < minDistance) {
                                minDistance = distance;
                                closestFacility = gene1;
                            };
                        };

                        increasedFitness += minDistance - distances[this.hash(gene)][this.hash(demand)];
                        let key = this.hash(closestFacility);
                        if (!update.has(key)) {update.set(key, new Map());}
                        update[key].set(this.hash(demand), minDistance);
                    });

                    if (increasedFitness < minIncreasedFitness) {
                        minIncreasedFitness = increasedFitness;
                        idxOfGeneToRemove = idx;
                        distancesUpdate = update;
                    };
                }

                // the gene to remove is found, remove it
                distances.delete(this.hash(freeGenes[idxOfGeneToRemove]));
                distancesUpdate.forEach((map, gene) => {
                    map.forEach((demand, distance) => {
                        distances[gene].set(demand, distance);
                    });
                });
                freeGenes.splice(idxOfGeneToRemove, 1);
            }

            let fitness = 0;
            distances.forEach((facility, _) => {
                facility.forEach((distance, _) => {
                    fitness += distance;
                });
            });

            return [freeGenes, fitness]
        }

        public fitness(genes: Array<T>): number {
            let fitness = 0;
            this.demands.forEach(demand => {
                let minDistance = Number.MIN_VALUE;
                genes.forEach(facility => {
                    let distance = this.metric(facility, demand);
                    if (distance < minDistance) {minDistance = distance;}
                });
                fitness += minDistance;
            });
            return fitness
        }

    public replacementOp(candidate: Array<T>, candidateFitness: number, fitnessQue: std.PriorityQueue<[number, number]>) {
        let idx = 0;
        let maxFitness = 0;
        [idx, maxFitness] = fitnessQue.top();

        /**
         * Step 1. If fitness value of the input candidate member is higher than the maximum fitness
         * value in the population, then discard this candidate member and terminate this
         * operator
         */
        if (candidateFitness >= maxFitness) {return}

        /**
         * Step 2. If the candidate member is identical to an existing member of the current popu
         * lation, then discard this candidate member and terminate this operator.
         */
        for (const [_, pop] of this._population.entries()) {
            if (this.isIdenticalPop(candidate, pop)) {return}
        }

        // Step 3. Replace the worst member and update population
        fitnessQue.pop();
        this._population.splice(idx, 1, candidate);
        fitnessQue.push([idx, candidateFitness]);
    }

        /**
         * Combination (n, k)
         * @private
         * @param {number} n
         * @param {number} k
         * @returns {number}
         * @memberof GA_pMeanSolver
         */
        private combination(n: number, k: number): number{
            if (n > Math.floor(k / 2)) {
                n = k - n;
            }

            let result: number = 1;
            for (let i = 0; i < n; i++) {
                result *= (k - i) / (n - i)
            }

            return result
        }

        public pMedian(): Array<T> {
            this.generatePopulations(this._populationSize);


            let compare = function (a: [number, number], b: [number, number]): boolean {
                return a[1] > b[1]
            }
            
            let fitnessQ = new std.PriorityQueue<[number, number]>(compare);
            for (const [idx, pop] of this._population.entries()) {
                let fitness = this.fitness(pop);
                fitnessQ.push([idx, fitness]);
            }

            let iter = 0;
            let best = this._population[fitnessQ.top()[0]];
            while (iter < this._maxIter) {
                // Randomly select two members from the current population.
                let parents = this.selectParents();

                // Run the Generation Operator
                let candidate: Array<T>;
                let candidateFitness: number;
                [candidate, candidateFitness] = this.generationOp(parents);

                // Run the Replacement Operator
                this.replacementOp(candidate, candidateFitness, fitnessQ);

                // If the best solution found so far has not changed, then increment MaxIter
                let bestThisIter = this._population[fitnessQ.top()[0]];
                if (this.isIdenticalPop(bestThisIter, best)) {
                    iter++;
                }
                else {
                    best = bestThisIter;
                }
            }
            return best
        }
    }
}
