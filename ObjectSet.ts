namespace ObjectSet {
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
}
