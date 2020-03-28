import DeltaE = require('rgb-lab');
import shuffle = require('knuth-shuffle');

export default abstract class GA_pMeanSolver<T> {
    private density: number;
    
    /**
     * Creates an instance of GA_pMeanSolver.
     * @param {Array<T>} demands
     * @param {Array<T>} facilities
     * @param {Number} n - number of facilities to be placed
     * @param {(arg0: T, arg1: T) => Number} metic: a function to measure the distance from a demand to some facility
     * @memberof GA_pMeanSolver
     */
    constructor(
        private demands: Array<T>,
        private facilities: Array<T>,
        private n: number,
        private metric: (facility: T, demand: T) => number
    ) {
        this.density = Math.ceil(this.facilities.length / this.n);
    }

    public populationSize(): number {
        let s = this.combination(this.n, this.facilities.length);

        return Math.max(2, Math.ceil(this.n * Math.log(s) / 100 / this.density)) * this.density
    }

    public generatePopulations(size: number): Array<Array<T>> {
        let increment = Math.floor(size / this.density); // k
        let populations: Array<Array<T>> = new Array(size);

        let idx = 0;
        for (let i = 0; i < Math.floor(this.facilities.length / this.n); i++) {
            let population: Array<T> = new Array(this.n);
            for (let j = 0; j < this.n; j++) {
                population[j] = this.facilities[i * this.n + j]
            }
            populations[idx] = population;
            idx++;
        }

        // if n / p is not integer, fill the remaining slots with random facilities
        if (this.facilities.length % this.n > 0) {
            let population: Array<T> = new Array(this.n);
            let j = 0;
            for (let i = Math.floor(this.facilities.length / this.n) * this.n; i < this.facilities.length; i++) {
                population[j] = this.facilities[i];
                j++;
            }
            population = this.fillPopulation(population, j);
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
            populations[idx] = population;
            idx++
        }

        return populations
    }

    abstract isEqual(a: T, b: T): boolean;

    abstract hash(t: T): string;

    private fillPopulation(population: Array<T>, start): Array<T> {
        let remainingFacilities = new Array<T>();
        let excludes = new ObjectSet<T>(population.slice(0, start), this.isEqual, this.hash);
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

    public getRandomElement(array: Array<T>): T {
        return array[Math.floor(Math.random() * array.length)]
    }

    public selectParents(populations: Array<Array<T>>): Array<T>[2] {
        return shuffle.knuthShuffle(populations.slice(0)).slice(0, 2)
    }

    public intersect(array1: Array<T>, array2: Array<T>): Array<T> {
        let intersection = new Array<T>();

        array1.forEach(element1 => {
            for (let i = 0; i < array2.length; i++) {
                if (element1 = array2[i]) {
                    intersection.push(element1);
                    break
                }
            }
        });

        return intersection
    }

    public generationOp(parents: Array<T>[2]): Array<T> {
        let genes0 = new ObjectSet(parents[0], this.isEqual, this.hash);
        let genes1 = new ObjectSet(parents[1], this.isEqual, this.hash);

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
                        if (idx1 == idx) {continue}
                        let distance = this.metric(gene1, demand);
                        if (distance < minDistance) {
                            minDistance = distance;
                            closestFacility = gene1;
                        }
                    }

                    increasedFitness += minDistance - distances[this.hash(gene)][this.hash(demand)];
                    let key = this.hash(closestFacility);
                    if (!update.has(key)) {update.set(key, new Map());}
                    update[key].set(this.hash(demand), minDistance);
                });

                if (increasedFitness < minIncreasedFitness) {
                    minIncreasedFitness = increasedFitness;
                    idxOfGeneToRemove = idx;
                    distancesUpdate = update;
                }
            }

            // the gene to remove is found, remove it
            distances.delete(this.hash(freeGenes[idxOfGeneToRemove]));
            distancesUpdate.forEach((map, gene) => {
                map.forEach((demand, distance) => {
                    distances[gene].set(demand, distance);
                });
            })
            freeGenes.splice(idxOfGeneToRemove, 1);
        }

        return freeGenes
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
            result *= (n - i) / (k - i)
        }

        return result
    }
}

export class ObjectSet<T> {
    map: Map<string, T[]>;

    constructor(
        list: T[], 
        public isEq: (t1: T, t2: T) => boolean, 
        public hash: (t: T) => string) {
      this.map = new Map();
  
      for(let l of list) {
        this.add(l);
      }
    }
  
    add(t: T) {
      let lst = this.map.get(this.hash(t));
      if(lst) {
        if(lst.every(l => !this.isEq(l, t))) {
          lst.push(t);
        }
      } else {
        this.map.set(this.hash(t), [t]);
      }
    }
  
    has(t: T): boolean {
      let lst = this.map.get(this.hash(t));
      return !!lst && lst.some(l => this.isEq(l, t));
    }
  
    toList(): T[] {
      return Array.from(this.map.entries(), ([_, ts]) => ts).flat();
    }

    intersect(set: ObjectSet<T>): ObjectSet<T> {
        let res = new ObjectSet<T>(new Array<T>(), this.isEq, this.hash);
        this.map.forEach((ts, _) => {
            ts.forEach(element => {
                if (set.has(element)) {
                    res.add(element)
                }
            });
        });
        return res
    }

    union(set: ObjectSet<T>): ObjectSet<T> {
        let res = new ObjectSet<T>(new Array<T>(), this.isEq, this.hash);
        res.map = new Map(this.map);
        set.map.forEach((ts, _) => {
            ts.forEach(element => {
                res.add(element)
            });
        });
        return res
    }

    minus(set: ObjectSet<T>): ObjectSet<T> {
        let res = new ObjectSet<T>(new Array<T>(), this.isEq, this.hash);
        this.map.forEach((ts, _) => {
            ts.forEach(element => {
                if (!set.has(element)) {
                    res.add(element)
                }
            });
        });
        return res
    }
} 