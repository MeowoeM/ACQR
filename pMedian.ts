namespace pMedian {
    export class VNS<T> {
        private _density: number;
        private _maxIter: number;
        private _neighbors: Map<string, Map<string, number>>;

        /**
         * Creates an instance of GA_pMeanSolver.
         * @param {Array<T>} demands
         * @param {Array<T>} facilities
         * @param {Number} n - number of facilities to be placed
         * @param {(arg0: T, arg1: T) => Number} metic: a function to measure the distance from a demand to some facility
         * @memberof VNS
         */
        constructor(
            private _demands: Array<T>,
            private _facilities: Array<T>,
            private _n: number,
            private metric: (facility: T, demand: T) => number,
            private isEqual: (a: T, b: T) => boolean,
            private hash: (t: T) => string,
            private unhash: (hash: string) => T
        ) {
            this._density = Math.ceil(this._facilities.length / this.n);
            // this._maxIter = Math.ceil(this.demands.length * Math.sqrt(this.n));
            this._maxIter = 256;
        }

        public initialSolution(): void {
            // first facility to place: 1-median
            let candidates = this._facilities.slice(0);
            let minTotalCost = Number.MAX_VALUE;
            let firstFacility = candidates[0];
            let firstFacilityIdx = 0;
            let costs: Array<number>
            for (const [i, facility] of candidates.entries()) {
                let totalCost = 0;
                let thisCosts = new Array<number>(this._demands.length);
                for (const [j, demand] of this._demands.entries()) {
                    let cost = this.metric(facility, demand);
                    totalCost += cost;
                    thisCosts[j] = cost;
                }
                if (totalCost < minTotalCost) {
                    minTotalCost = totalCost;
                    firstFacility = facility;
                    firstFacilityIdx = i;
                    costs = thisCosts;
                }
            }
            candidates.splice(firstFacilityIdx, 1);
            let neighbor = new Map<string, number>();
            for (const [idx, demand] of this._demands.entries()) {
                neighbor.set(this.hash(demand), costs[idx]);
            }
            this._neighbors.set(this.hash(firstFacility), neighbor);

            // greadily find the n - 1 left facilities to place
            for (let i = 1; i < this._n; i++) {
                let maxDecreasedCost = Number.MAX_VALUE;
                let facilityToPlace = candidates[0];
                let facilityToPlaceIdx = 0;
                let verticeToModify: Array<[string, Array<[string, number]>]>;
                for (const [i, facility] of candidates.entries()) {
                    let decreasedCost = 0;
                    let verticeToModifyCandidate = new Array<[string, Array<[string, number]>]>();
                    for (const [placedFacilityKey, vertice] of this._neighbors.entries()) {
                        let demandsToReplace = new Array<[string, number]>();
                        for (const [demandKey, cost] of vertice.entries()) {
                            let newCost = this.metric(facility, this.unhash(demandKey));
                            if (newCost < cost) {
                                decreasedCost += cost - newCost;
                                demandsToReplace.push([demandKey, newCost]);
                            }
                        }
                        verticeToModifyCandidate.push([placedFacilityKey, demandsToReplace]);
                    }
                    if (decreasedCost > maxDecreasedCost) {
                        facilityToPlace = facility;
                        facilityToPlaceIdx = i;
                        verticeToModify = verticeToModifyCandidate;
                    }
                }
                candidates.splice(facilityToPlaceIdx, 1);
                let newNeighbor = new Map<string, number>();
                verticeToModify.forEach(tuple0 => {
                    let placedFacilityKey = tuple0[0];
                    let thisNeighbor = this._neighbors.get(placedFacilityKey);
                    tuple0[1].forEach(tuple1 => {
                        let demandKey = tuple1[0];
                        let newCost = tuple1[1];
                        thisNeighbor.delete(demandKey);
                        newNeighbor.set(demandKey, newCost);
                    });
                    this._neighbors.set(placedFacilityKey, thisNeighbor);
                });
                this._neighbors.set(this.hash(facilityToPlace), newNeighbor);
            }
        }

        public vns(): void {
            let k = 0;
            let placedFacilityKeys = new Array<string>(this._n)
            while (k < this._n) {

            }
        }
    }
    
    /**
     * P-median solver, an janky implementation of 
     * https://link.springer.com/content/pdf/10.1023/A:1026130003508.pdf
     *
     * @export
     * @class GA_pMedianSolver
     * @template T
     */
    export class GA<T> {
        private _demands: Map<string, number>
        public get demands(): Array<[T, number]> {
            let result = new Array<[T, number]>(this._demands.size);
            let idx = 0;
            for (const [demandKey, degeneracy] of this._demands.entries()) {
                result[idx] = [this.unhash(demandKey), degeneracy];
                idx++;
            }
            return result;
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
         * @memberof GA
         */
        constructor(
            demands: Array<T>,
            private _facilities: Array<T>,
            private n: number,
            private metric: (facility: T, demand: T) => number,
            private isEqual: (a: T, b: T) => boolean,
            private hash: (t: T) => string,
            private unhash: (hash: string) => T
        ) {
            this._density = Math.ceil(this._facilities.length / this.n);
            // this._maxIter = Math.ceil(this.demands.length * Math.sqrt(this.n));
            this._maxIter = 1024;
            this._populationSize = this.calcPopulationSize();
            this._demands = new Map<string, number>();
            demands.forEach(demand => {
                let demandKey = this.hash(demand);
                if (this._demands.has(demandKey)) {
                    this._demands.set(demandKey, this._demands.get(demandKey) + 1);
                } 
                else {
                    this._demands.set(demandKey, 1);
                }
            });
        }

        private calcPopulationSize(): number {
            let s = this.combination(this.n, this._facilities.length);

            return Math.max(4, Math.ceil(this.n * Math.log(s) / 100 / this._density)) * this._density
        }

        public generatePopulations(size: number){
            let increment = Math.floor(size / this._density); // k
            this._population = new Array(size);
            console.log(size, this._density, increment)

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
                this._population[idx] = pop;
                idx++;
            }

            let pointer = 0;
            let cycleIdx = 0;
            while (cycleIdx < increment) {
                let pop: Array<T> = new Array(this.n);
                for (let j = 0; j < this.n; j++) {
                    if (pointer >= this.facilities.length) {
                        cycleIdx++;
                        pointer = cycleIdx
                    }
                    pop[j] = this.facilities[pointer];
                    pointer += increment;
                }
                this._population[idx] = pop;
                idx++
            }

            while (idx < size) {
                let pop: Array<T> = new Array(this.n);
                this.fillPopulation(pop, 0)
                this._population[idx] = pop;
                idx++;
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

        private fillPopulation(population: Array<T>, start: number): Array<T> {
            let remainingFacilities = new Array<T>();
            let excludes = new misc.ObjectSet<T>(population.slice(0, start), this.isEqual, this.hash);
            this.facilities.forEach(facility => {
                if (!excludes.has(facility)) {
                    remainingFacilities.push(facility)
                }
            });

            misc.shuffle(remainingFacilities)
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
            let parentsIdx = misc.shuffle(idxes).slice(0, 2);
            return [this._population[parentsIdx[0]], this._population[parentsIdx[1]]]
        }

        public generationOp(parents: [Array<T>, Array<T>]): [Array<T>, number] {
            let genes0 = new misc.ObjectSet(parents[0], this.isEqual, this.hash);
            let genes1 = new misc.ObjectSet(parents[1], this.isEqual, this.hash);

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

            for (const demandKey of this._demands.keys()) {
                let demand = this.unhash(demandKey);
                let minDistance = Number.MAX_VALUE;
                let closestFacility = freeGenes[0];
                freeGenes.forEach(facility => {
                    let distance = this.metric(facility, demand);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestFacility = facility;
                    }
                });
                let distance = distances.get(this.hash(closestFacility));
                distance.set(this.hash(demand), minDistance);
                distances.set(this.hash(closestFacility), distance);
            }
            
            
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
                    let demandsToReallocate = distances.get(this.hash(gene));
                    let increasedFitness = 0;
                    let update = new Map();
                    
                    demandsToReallocate.forEach((_, demand) => {
                        let minDistance = Number.MAX_VALUE;
                        let closestFacility = gene;
                        for (const [idx1, gene1] of freeGenes.entries()) {
                            // skip the deleted gene
                            if (idx1 == idx) {continue};
                            let distance = this.metric(gene1, this.unhash(demand));
                            if (distance < minDistance) {
                                minDistance = distance;
                                closestFacility = gene1;
                            };
                        };

                        let degeneracy = this._demands.get(demand);
                        increasedFitness += degeneracy * (minDistance - distances.get(this.hash(gene)).get(demand));
                        let key = this.hash(closestFacility);
                        if (!update.has(key)) {update.set(key, new Map());}
                        let distance = update.get(key);
                        distance.set(demand, minDistance);
                        update.set(key, distance);
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
                    let facility = distances.get(gene);
                    map.forEach((distance, demand) => {
                        facility.set(demand, distance);
                    });
                    distances.set(gene, facility);
                });
                freeGenes.splice(idxOfGeneToRemove, 1);
            }

            let fitness = 0;
            distances.forEach((facility, _) => {
                facility.forEach((distance, demandKey) => {
                    let degeneracy = this._demands.get(demandKey);
                    fitness += distance * degeneracy;
                });
            });

            return [freeGenes, fitness]
        }

        public fitness(genes: Array<T>): number {
            let fitness = 0;
            this._demands.forEach((degeneracy, demandKey) => {
                let demand = this.unhash(demandKey);
                let minDistance = Number.MAX_VALUE;
                genes.forEach(facility => {
                    let distance = this.metric(facility, demand);
                    if (distance < minDistance) {minDistance = distance;}
                });
                fitness += degeneracy * minDistance;
            });
            return fitness
        }

    public replacementOp(
        candidate: Array<T>, 
        candidateFitness: number, 
        fitnessEnum: Array<[number, number]>,
        comparator: (a: [number, number], b: [number, number]) => number
        ) {
        let idx = 0;
        let maxFitness = 0;
        [idx, maxFitness] = fitnessEnum[0];

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
        // fitnessEnum.shift();
        fitnessEnum.splice(0, 1, [idx, candidateFitness])
        fitnessEnum.sort(comparator)
        this._population.splice(idx, 1, candidate);
        // misc.binaryInsert([idx, candidateFitness], fitnessEnum, comparator);
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
            console.log(this._population)

            let comparator = function (a: [number, number], b: [number, number]): number {
                if (a[1] > b[1]) {return -1}
                if (a[1] == b[1]) {return 0}
                return 1
            };
            
            let fitnessEnum = new Array<[number, number]>();
            for (const [idx, pop] of this._population.entries()) {
                let fitness = this.fitness(pop);
                fitnessEnum.push([idx, fitness])
            };
            fitnessEnum.sort(comparator);

            let iter = 0;
            let best = this._population[fitnessEnum[fitnessEnum.length - 1][0]];
            while (iter < this._maxIter) {
                // Randomly select two members from the current population.
                let parents = this.selectParents();

                // Run the Generation Operator
                let candidate: Array<T>;
                let candidateFitness: number;
                [candidate, candidateFitness] = this.generationOp(parents);

                // Run the Replacement Operator
                this.replacementOp(candidate, candidateFitness, fitnessEnum, comparator);
                // console.log(fitnessEnum)

                // If the best solution found so far has not changed, then increment MaxIter
                let bestThisIter = this._population[fitnessEnum[fitnessEnum.length - 1][0]];
                console.log('iter:', iter, '/', this.maxIter, fitnessEnum[fitnessEnum.length - 1][1], fitnessEnum[0][1], candidateFitness)
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
