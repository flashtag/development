import Category from '../models/category';

export default {

    get() {
        return client({
            path: '/categories' + (this.includes || '')
        }).entity().then(function(entity) {
            return entity.data.map(function(category) {
                return new Category(category);
            });
        });
    },

    getById(id) {
        return client({
            path: '/categories/' + id + (this.includes || '')
        }).entity().then(function(entity) {
            return new Category(entity.data);
        });
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
