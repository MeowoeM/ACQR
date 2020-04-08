var pMedian;
(function (pMedian) {
    class VNS {
        /**
         * Creates an instance of GA_pMeanSolver.
         * @param {Array<T>} demands
         * @param {Array<T>} facilities
         * @param {Number} _n - number of facilities to be placed
         * @param {(arg0: T, arg1: T) => Number} metric: a function to measure the distance from a demand to some facility
         * @memberof GA
         */
        constructor(demands, facilities, _n, metric, hash, unhash) {
            this._n = _n;
            this.hash = hash;
            this.unhash = unhash;
            this._demands = new Map();
            let demandsMap = new Map();
            demands.forEach(demand => {
                let demandKey = this.hash(demand);
                if (this._demands.has(demandKey)) {
                    this._demands.set(demandKey, this._demands.get(demandKey) + 1);
                }
                else {
                    this._demands.set(demandKey, 1);
                }
            });
            this._facilities = new Array(facilities.length);
            this._metricLookup = new Map();
            for (const [idx, facility] of facilities.entries()) {
                let facilityKey = this.hash(facility);
                this._facilities[idx] = facilityKey;
                for (const demandKey of this._demands.keys()) {
                    this._metricLookup.set(facilityKey + demandKey, this.metric(facilityKey, demandKey));
                }
            }
        }
        get demands() {
            let result = new Array(this._demands.size);
            let idx = 0;
            this._demands.forEach((degeneracy, demandKey) => {
                result[idx] = [this.unhash(demandKey), degeneracy];
                idx++;
            });
            return result;
        }
        get facilities() {
            let result = new Array();
            for (const [idx, facility] of this._facilities.entries()) {
                result[idx] = this.unhash(facility);
            }
            return result;
        }
        metric(facilityKey, demandKey) {
            return this._metricLookup.get(facilityKey + demandKey);
        }
        initialSolution() {
            // first facility to place: 1-median
            let candidates = this._facilities.slice(0);
            let minTotalCost = Number.MAX_VALUE;
            let firstFacility = candidates[0];
            let firstFacilityIdx = 0;
            let costs;
            this._demandNeighbors = new Map();
            for (const [i, facility] of candidates.entries()) {
                let totalCost = 0;
                let thisCosts = new Array(this._demands.size);
                let idx = 0;
                this._demands.forEach((degeneracy, demand) => {
                    let cost = degeneracy * this.metric(facility, demand);
                    totalCost += cost;
                    thisCosts[idx] = cost;
                    idx++;
                });
                if (totalCost < minTotalCost) {
                    minTotalCost = totalCost;
                    firstFacility = facility;
                    firstFacilityIdx = i;
                    costs = thisCosts;
                }
            }
            candidates.splice(firstFacilityIdx, 1);
            let neighbor = new Map();
            let idx = 0;
            for (const demand of this._demands.keys()) {
                neighbor.set(demand, costs[idx]);
                idx++;
            }
            this._demandNeighbors.set(firstFacility, neighbor);
            // greadily find the n - 1 left facilities to place
            for (let i = 1; i < this._n; i++) {
                let maxDecreasedCost = Number.MAX_VALUE;
                let facilityToPlace = candidates[0];
                let facilityToPlaceIdx = 0;
                let verticeToModify;
                for (const [i, facility] of candidates.entries()) {
                    let decreasedCost = 0;
                    let verticeToModifyCandidate = new Array();
                    for (const [openedFacility, vertice] of this._demandNeighbors.entries()) {
                        let demandsToReplace = new Array();
                        for (const [demand, cost] of vertice.entries()) {
                            let newCost = this._demands.get(demand) * this.metric(facility, demand);
                            if (newCost < cost) {
                                decreasedCost += cost - newCost;
                                demandsToReplace.push([demand, newCost]);
                            }
                        }
                        verticeToModifyCandidate.push([openedFacility, demandsToReplace]);
                    }
                    if (decreasedCost > maxDecreasedCost) {
                        facilityToPlace = facility;
                        facilityToPlaceIdx = i;
                        verticeToModify = verticeToModifyCandidate;
                    }
                }
                candidates.splice(facilityToPlaceIdx, 1);
                let newNeighbor = new Map();
                verticeToModify.forEach(tuple0 => {
                    let openedFacilityKey = tuple0[0];
                    let thisNeighbor = this._demandNeighbors.get(openedFacilityKey);
                    tuple0[1].forEach(tuple1 => {
                        let demandKey = tuple1[0];
                        let newCost = tuple1[1];
                        thisNeighbor.delete(demandKey);
                        newNeighbor.set(demandKey, newCost);
                    });
                    this._demandNeighbors.set(openedFacilityKey, thisNeighbor);
                });
                this._demandNeighbors.set(facilityToPlace, newNeighbor);
            }
            this._facilityNeighbors = new Map();
            for (const placedFacility of this._demandNeighbors.keys()) {
                this._facilityNeighbors.set(placedFacility, new Map());
            }
            candidates.forEach(facility => {
                let minDistance = Number.MAX_VALUE;
                let closestFacility = facility;
                for (const placedFacility of this._demandNeighbors.keys()) {
                    let distance = this.metric(placedFacility, facility);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestFacility = placedFacility;
                    }
                }
                this._facilityNeighbors.get(closestFacility).set(facility, minDistance);
            });
        }
        shake(k) {
            let kthNeighbor = this._facilityNeighbors.get(Array.from(this._facilityNeighbors.keys())[k]);
            let closedFacilities = Array.from(kthNeighbor.keys());
            return closedFacilities[Math.floor(Math.random() * closedFacilities.length)];
        }
        substitute(demandNeighbors, facilityNeighbors, openedFacility, closedFacilities) {
        }
        vns() {
            let k = 0;
            let placedFacilityKeys = new Array(this._n);
            while (k < this._n) {
            }
        }
    }
    pMedian.VNS = VNS;
    /**
     * P-median solver, an janky implementation of
     * https://link.springer.com/content/pdf/10.1023/A:1026130003508.pdf
     *
     * @export
     * @class GA_pMedianSolver
     * @template T
     */
    class GA {
        /**
         * Creates an instance of GA_pMeanSolver.
         * @param {Array<T>} demands
         * @param {Array<T>} facilities
         * @param {Number} n - number of facilities to be placed
         * @param {(arg0: T, arg1: T) => Number} metic: a function to measure the distance from a demand to some facility
         * @memberof GA
         */
        constructor(demands, facilities, n, metric, hash, unhash, maxIter = 256) {
            this.n = n;
            this.hash = hash;
            this.unhash = unhash;
            this._demands = new Map();
            demands.forEach(demand => {
                let demandKey = this.hash(demand);
                if (this._demands.has(demandKey)) {
                    this._demands.set(demandKey, this._demands.get(demandKey) + 1);
                }
                else {
                    this._demands.set(demandKey, 1);
                }
            });
            this._facilities = new Array(facilities.length);
            this._metricLookup = new Map();
            for (const [idx, facility] of facilities.entries()) {
                let facilityKey = this.hash(facility);
                this._facilities[idx] = facilityKey;
                for (const demandKey of this._demands.keys()) {
                    this._metricLookup.set(facilityKey + demandKey, metric(facility, this.unhash(demandKey)));
                }
            }
            this._density = Math.ceil(facilities.length / this.n);
            // this._maxIter = Math.ceil(this.demands.length * Math.sqrt(this.n));
            this._maxIter = maxIter;
            this._populationSize = this.calcPopulationSize();
        }
        get demands() {
            let result = new Array(this._demands.size);
            let idx = 0;
            for (const [demandKey, degeneracy] of this._demands.entries()) {
                result[idx] = [this.unhash(demandKey), degeneracy];
                idx++;
            }
            return result;
        }
        get facilities() {
            let result = new Array();
            for (const [idx, facility] of this._facilities.entries()) {
                result[idx] = this.unhash(facility);
            }
            return result;
        }
        get density() {
            return this._density;
        }
        get maxIter() {
            return this._maxIter;
        }
        get population() {
            return this._population;
        }
        get populationSize() {
            return this._populationSize;
        }
        metric(facilityKey, demandKey) {
            return this._metricLookup.get(facilityKey + demandKey);
        }
        calcPopulationSize() {
            let s = this.combination(this.n, this._facilities.length);
            return Math.max(4, Math.ceil(this.n * Math.log(s) / 100 / this._density)) * this._density;
        }
        generatePopulations(size) {
            let increment = Math.floor(size / this._density); // k
            this._population = new Array(size);
            console.log(size, this._density, increment);
            let idx = 0;
            for (let i = 0; i < Math.floor(this._facilities.length / this.n); i++) {
                let pop = new Array(this.n);
                for (let j = 0; j < this.n; j++) {
                    pop[j] = this._facilities[i * this.n + j];
                }
                this._population[idx] = pop;
                idx++;
            }
            // if n / p is not integer, fill the remaining slots with random facilities
            if (this._facilities.length % this.n > 0) {
                let pop = new Array(this.n);
                let j = 0;
                for (let i = Math.floor(this._facilities.length / this.n) * this.n; i < this._facilities.length; i++) {
                    pop[j] = this._facilities[i];
                    j++;
                }
                pop = this.fillPopulation(pop, j);
                this._population[idx] = pop;
                idx++;
            }
            let pointer = 0;
            let cycleIdx = 0;
            while (cycleIdx < increment) {
                let pop = new Array(this.n);
                for (let j = 0; j < this.n; j++) {
                    if (pointer >= this._facilities.length) {
                        cycleIdx++;
                        pointer = cycleIdx;
                    }
                    pop[j] = this._facilities[pointer];
                    pointer += increment;
                }
                this._population[idx] = pop;
                idx++;
            }
            while (idx < size) {
                let pop = new Array(this.n);
                this.fillPopulation(pop, 0);
                this._population[idx] = pop;
                idx++;
            }
        }
        isIdenticalPop(a, b) {
            a.sort();
            b.sort();
            let result = true;
            for (const [idx, entry] of a.entries()) {
                if (!(b[idx] === entry)) {
                    result = false;
                    break;
                }
            }
            return result;
        }
        fillPopulation(population, start) {
            let remainingFacilities = new Array();
            let excludes = new Set();
            population.slice(0, start).forEach(pop => {
                excludes.add(pop);
            });
            this._facilities.forEach(facility => {
                if (!excludes.has(facility)) {
                    remainingFacilities.push(facility);
                }
            });
            misc.shuffle(remainingFacilities);
            for (let i = start; i < population.length; i++) {
                population[i] = remainingFacilities[i];
            }
            return population;
        }
        selectParents() {
            let idxes = new Array(this._populationSize);
            for (let idx = 0; idx < this._populationSize; idx++) {
                idxes[idx] = idx;
            }
            let parentsIdx = misc.shuffle(idxes).slice(0, 2);
            return [this._population[parentsIdx[0]], this._population[parentsIdx[1]]];
        }
        generationOp(parents) {
            // let genes0 = new misc.ObjectSet(parents[0], this.isEqual, this.hash);
            // let genes1 = new misc.ObjectSet(parents[1], this.isEqual, this.hash);
            let genes0 = new Set();
            parents[0].forEach(gene => {
                genes0.add(gene);
            });
            let genes1 = new Set();
            parents[1].forEach(gene => {
                genes0.add(gene);
            });
            // Step 1. Take the union of the input members’ genes to obtain a draft member
            let draftMemberSet = misc.union(genes0, genes1);
            /* Step 2. Let the total number of genes in this draft member be m. Call the genes that are
            * present in both parents fixed genes and the rest free genes.
            */
            let fixedGenes = misc.intersection(genes0, genes1);
            let freeGeneSet = misc.difference(draftMemberSet, fixedGenes);
            let freeGenes = Array.from(freeGeneSet);
            // Step 3. Compute the fitness value of this draft member.
            let distances = new Map();
            freeGenes.forEach(gene => {
                distances.set(gene, new Map());
            });
            for (const demand of this._demands.keys()) {
                let minDistance = Number.MAX_VALUE;
                let closestFacility = freeGenes[0];
                freeGenes.forEach(facility => {
                    let distance = this.metric(facility, demand);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestFacility = facility;
                    }
                });
                let distance = distances.get(closestFacility);
                distance.set(demand, minDistance);
                distances.set(closestFacility, distance);
            }
            /* Step 4. Find the free gene that produces the minimum increase in the current fitness
            * value when deleted from the draft member, and delete it. Repeat this step until
            * freeGenes.length = n. Let this final solution be a candidate member.
            */
            while (freeGenes.length > this.n) {
                let minIncreasedFitness = Number.MAX_VALUE;
                let idxOfGeneToRemove = 0;
                let distancesUpdate = new Map();
                // try to delete one gene(facility), calculate how much the total fitness increases
                for (const [idx, gene] of freeGenes.entries()) {
                    let demandsToReallocate = distances.get(gene);
                    let increasedFitness = 0;
                    let update = new Map();
                    demandsToReallocate.forEach((_, demand) => {
                        let minDistance = Number.MAX_VALUE;
                        let closestFacility = gene;
                        for (const [idx1, gene1] of freeGenes.entries()) {
                            // skip the deleted gene
                            if (idx1 == idx) {
                                continue;
                            }
                            ;
                            let distance = this.metric(gene1, demand);
                            if (distance < minDistance) {
                                minDistance = distance;
                                closestFacility = gene1;
                            }
                            ;
                        }
                        ;
                        let degeneracy = this._demands.get(demand);
                        increasedFitness += degeneracy * (minDistance - distances.get(gene).get(demand));
                        if (!update.has(closestFacility)) {
                            update.set(closestFacility, new Map());
                        }
                        let distance = update.get(closestFacility);
                        distance.set(demand, minDistance);
                        update.set(closestFacility, distance);
                    });
                    if (increasedFitness < minIncreasedFitness) {
                        minIncreasedFitness = increasedFitness;
                        idxOfGeneToRemove = idx;
                        distancesUpdate = update;
                    }
                    ;
                }
                // the gene to remove is found, remove it
                distances.delete(freeGenes[idxOfGeneToRemove]);
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
            return [freeGenes, fitness];
        }
        fitness(genes) {
            let fitness = 0;
            this._demands.forEach((degeneracy, demand) => {
                let minDistance = Number.MAX_VALUE;
                genes.forEach(facility => {
                    let distance = this.metric(facility, demand);
                    if (distance < minDistance) {
                        minDistance = distance;
                    }
                });
                fitness += degeneracy * minDistance;
            });
            return fitness;
        }
        replacementOp(candidate, candidateFitness, fitnessEnum, comparator) {
            let idx = 0;
            let maxFitness = 0;
            [idx, maxFitness] = fitnessEnum[0];
            /**
             * Step 1. If fitness value of the input candidate member is higher than the maximum fitness
             * value in the population, then discard this candidate member and terminate this
             * operator
             */
            if (candidateFitness >= maxFitness) {
                return;
            }
            /**
             * Step 2. If the candidate member is identical to an existing member of the current popu-
             * lation, then discard this candidate member and terminate this operator.
             */
            for (const [_, pop] of this._population.entries()) {
                if (this.isIdenticalPop(candidate, pop)) {
                    return;
                }
            }
            // Step 3. Replace the worst member and update population
            // fitnessEnum.shift();
            fitnessEnum.splice(0, 1, [idx, candidateFitness]);
            fitnessEnum.sort(comparator);
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
        combination(n, k) {
            if (n > Math.floor(k / 2)) {
                n = k - n;
            }
            let result = 1;
            for (let i = 0; i < n; i++) {
                result *= (k - i) / (n - i);
            }
            return result;
        }
        pMedian(log) {
            this.generatePopulations(this._populationSize);
            let comparator = function (a, b) {
                if (a[1] > b[1]) {
                    return -1;
                }
                if (a[1] == b[1]) {
                    return 0;
                }
                return 1;
            };
            let fitnessEnum = new Array();
            for (const [idx, pop] of this._population.entries()) {
                let fitness = this.fitness(pop);
                fitnessEnum.push([idx, fitness]);
            }
            ;
            fitnessEnum.sort(comparator);
            let iter = 0;
            let best = this._population[fitnessEnum[fitnessEnum.length - 1][0]];
            while (iter < this._maxIter) {
                // Randomly select two members from the current population.
                let parents = this.selectParents();
                // Run the Generation Operator
                let candidate;
                let candidateFitness;
                [candidate, candidateFitness] = this.generationOp(parents);
                // Run the Replacement Operator
                this.replacementOp(candidate, candidateFitness, fitnessEnum, comparator);
                // console.log(fitnessEnum)
                // If the best solution found so far has not changed, then increment MaxIter
                let bestThisIter = this._population[fitnessEnum[fitnessEnum.length - 1][0]];
                // console.log('iter:', iter, '/', this.maxIter, fitnessEnum[fitnessEnum.length - 1][1], fitnessEnum[0][1], candidateFitness)
                log('iter: ' + ' ' + iter + ' ' + '/' + ' ' +
                    this.maxIter + ' ' + fitnessEnum[fitnessEnum.length - 1][1]
                    + ' ' + fitnessEnum[0][1] + ' ' + candidateFitness);
                if (this.isIdenticalPop(bestThisIter, best)) {
                    iter++;
                }
                else {
                    best = bestThisIter;
                }
            }
            return best.map(this.unhash);
        }
    }
    pMedian.GA = GA;
})(pMedian || (pMedian = {}));
//# sourceMappingURL=pMedian.js.map