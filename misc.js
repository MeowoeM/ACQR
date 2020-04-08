var misc;
(function (misc) {
    function union(setA, setB) {
        let _union = new Set(setA);
        for (let elem of setB) {
            _union.add(elem);
        }
        return _union;
    }
    misc.union = union;
    function intersection(setA, setB) {
        let _intersection = new Set();
        for (let elem of setB) {
            if (setA.has(elem)) {
                _intersection.add(elem);
            }
        }
        return _intersection;
    }
    misc.intersection = intersection;
    function difference(setA, setB) {
        let _difference = new Set(setA);
        for (let elem of setB) {
            _difference.delete(elem);
        }
        return _difference;
    }
    misc.difference = difference;
    class ObjectSet {
        constructor(list, isEq, hash) {
            this.isEq = isEq;
            this.hash = hash;
            this.map = new Map();
            for (let l of list) {
                this.add(l);
            }
        }
        add(t) {
            let lst = this.map.get(this.hash(t));
            if (lst) {
                if (lst.every(l => !this.isEq(l, t))) {
                    lst.push(t);
                }
            }
            else {
                this.map.set(this.hash(t), [t]);
            }
        }
        has(t) {
            let lst = this.map.get(this.hash(t));
            return !!lst && lst.some(l => this.isEq(l, t));
        }
        toList() {
            return Array.from(this.map.entries(), ([_, ts]) => ts).flat();
        }
        intersect(set) {
            let res = new ObjectSet(new Array(), this.isEq, this.hash);
            this.map.forEach((ts, _) => {
                ts.forEach(element => {
                    if (set.has(element)) {
                        res.add(element);
                    }
                });
            });
            return res;
        }
        union(set) {
            let res = new ObjectSet(new Array(), this.isEq, this.hash);
            res.map = new Map(this.map);
            set.map.forEach((ts, _) => {
                ts.forEach(element => {
                    res.add(element);
                });
            });
            return res;
        }
        minus(set) {
            let res = new ObjectSet(new Array(), this.isEq, this.hash);
            this.map.forEach((ts, _) => {
                ts.forEach(element => {
                    if (!set.has(element)) {
                        res.add(element);
                    }
                });
            });
            return res;
        }
    }
    misc.ObjectSet = ObjectSet;
    function binaryInsert(entry, sortedArray, comparator) {
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
        if (comparator(entry, sortedArray[left]) < 0) {
            sortedArray.splice(left, 0, entry);
        }
        else {
            sortedArray.splice(left + 1, 0, entry);
        }
    }
    misc.binaryInsert = binaryInsert;
    function shuffle(array) {
        if (array.length <= 1)
            return array;
        for (let i = 0; i < array.length; i++) {
            const randomChoiceIndex = Math.floor(Math.random() * array.length);
            [array[i], array[randomChoiceIndex]] = [array[randomChoiceIndex], array[i]];
        }
        return array;
    }
    misc.shuffle = shuffle;
})(misc || (misc = {}));
//# sourceMappingURL=misc.js.map