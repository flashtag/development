class Collection {
    constructor(items) {
        this.items = items;
    }

    static buildFromPromise(promise) {
        return new Collection(promise.entity().then(function(entity) {
            return entity.data;
        }));
    }

    all() {
        return this.items;
    }

    [Symbol.iterator]() {
        var nextIndex = 0;
        var items = this.items;

        return {
            next: function() {
                if (nextIndex == items.length) {
                    return { done: true };
                }
                return {
                    value: items[nextIndex++],
                    done: false
                };
            }
        }
    }

    //next() {
    //    if (++this.index >= this.colors.length) {
    //        return { done: true };
    //    }
    //    return { value: this.items[this.index], done: false };
    //}
}

export default Collection;
