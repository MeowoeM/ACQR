namespace misc {
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

    export function binaryInsert<T>(
        entry: T, 
        sortedArray: Array<T>,
        comparator: (a: T, b: T) => number
        ): void {
        let left = 0;
        let right = sortedArray.length - 1;
        let middle = left + Math.floor((right - left) / 2);
        while (left < right) {
            if (comparator(entry, sortedArray[middle]) < 0) {
                right = middle - 1;
            }
            else if (comparator(entry, sortedArray[middle]) > 0) {
                left = middle + 1;
            }
            else {
                left = middle;
                right = middle;
            }
            middle = left + Math.floor((right - left) / 2);
        }
        if (comparator(entry, sortedArray[left]) < 0){
            sortedArray.splice(left, 0, entry);
        }
        else {
            sortedArray.splice(left + 1, 0, entry);
        }
    }

    export function shuffle<T>(array: T[]): T[] {
        if (array.length <= 1) return array;
      
        for (let i = 0; i < array.length; i++) {
          const randomChoiceIndex = Math.floor(Math.random() * array.length);
      
          [array[i], array[randomChoiceIndex]] = [array[randomChoiceIndex], array[i]];
        }
      
        return array;
    }
}
