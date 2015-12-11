import Category from '../models/Category';

export default {

    get() {
        return client({
            path: '/categories' + this.includes
        }).entity();
    },

    getById(id) {
        return Category.buildFromPromise(client({
            path: '/categories/' + id + this.includes
        }));
    },

    with(includes) {
        if (includes.constructor === Array) {
            this.includes = '?include=' + includes.join();
        } else {
            this.includes = includes ? '?include=' + includes : '';
        }

        return this;
    }

}
