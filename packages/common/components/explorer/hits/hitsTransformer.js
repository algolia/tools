export default function (excluded) {
    this.excluded = excluded || [];

    this.recursivelyGetValues = function (obj) {
        if (obj && obj._v_ !== undefined) return this.recursivelyGetValues(obj._v_);

        if (Array.isArray(obj)) {
            return obj.slice(0, 1000).map((o) => this.recursivelyGetValues(o));
        }
        if (this.isObject(obj)) {
            return Object.keys(obj).reduce((acc, key) => ({
                ...acc,
                [key]: this.recursivelyGetValues(obj[key]),
            }), {});
        }

        return obj;
    };

    this.getNewItemObject = function (item, highlightItem, snippetItem) {
        const newObject = {};
        let hasMatchGlobal = false;

        let key;
        for (key in item) {
            if (this.excluded.indexOf(key) !== -1 || item[key] === undefined) continue;

            const obj = this.getNewItem(
                item[key],
                highlightItem !== undefined ? highlightItem[key] : undefined,
                snippetItem !== undefined ? snippetItem[key] : undefined
            );
            newObject[key] = obj;
            hasMatchGlobal = hasMatchGlobal || obj._b_;
        }

        return {_v_: newObject, _s_: JSON.stringify(this.recursivelyGetValues(newObject)), _b_: hasMatchGlobal};
    };

    this.getNewItemArray = function (array, highlightItem, snippetItem) {
        let hasMatchGlobal = false;

        const newArray = [];

        array.slice(0, 1000).forEach((item, index) => {
            const obj = this.getNewItem(
                item,
                highlightItem !== undefined ? highlightItem[index] : undefined,
                snippetItem !== undefined ? snippetItem[index] : undefined
            );
            hasMatchGlobal = hasMatchGlobal || obj._b_;
            newArray.push(obj);
        });

        return {_v_: newArray, _s_: JSON.stringify(this.recursivelyGetValues(newArray)), _b_: hasMatchGlobal};
    };

    this.getNewItem = function (item, highlightItem, snippetItem) {
        if (this.isObject(item)) {
            return this.getNewItemObject(item, highlightItem, snippetItem);
        }
        if (Array.isArray(item)) {
            return this.getNewItemArray(item, highlightItem, snippetItem);
        }

        const hasMatch = snippetItem !== undefined && snippetItem.matchLevel && snippetItem.matchLevel !== 'none';
        const hasMatch2 = highlightItem !== undefined && highlightItem.matchLevel && highlightItem.matchLevel !== 'none';
        const value = hasMatch ? snippetItem.value : item;
        const rawValue = hasMatch2 ? highlightItem.value : item;

        return {
            _b_: hasMatch,
            _v_: value,
            _rv_: rawValue,
        };
    };

    this.isObject = function(item) {
        return item && typeof item === 'object' && item.constructor === Object;
    };

    this.transformObj = function (item) {
        return this.getNewItemObject(item, item._highlightResult, item._snippetResult);
    };

    this.getNewItemArraySimple = function (array, highlightItem) {
        return array.map((item, index) => {
            return this.getNewItemSimple(
                item,
                highlightItem !== undefined ? highlightItem[index] : undefined,
            );
        });
    };

    this.getNewItemSimple = function (item, highlightItem) {
        if (this.isObject(item)) {
            return this.getNewItemObjectSimple(item, highlightItem);
        }
        if (Array.isArray(item)) {
            return this.getNewItemArraySimple(item, highlightItem);
        }
        const hasMatch = highlightItem !== undefined && highlightItem.matchLevel !== undefined;
        return hasMatch ? highlightItem.value : item;
    };

    this.getNewItemObjectSimple = function (item, highlightItem, snippetItem) {
        const newObject = {};
        for (let key in item) {
            if (this.excluded.indexOf(key) !== -1 || item[key] === undefined) continue;
            const obj = this.getNewItemSimple(
                item[key],
                highlightItem !== undefined ? highlightItem[key] : undefined,
                snippetItem !== undefined ? snippetItem[key] : undefined
            );
            newObject[key] = obj;
        }

        return newObject;
    };

    this.transformObjSimple = function (item) {
        return this.getNewItemObjectSimple(item, item._highlightResult);
    };
}
