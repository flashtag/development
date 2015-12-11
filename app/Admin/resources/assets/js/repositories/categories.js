import Category from '../models/Category';
import Collection from '../support/Collection';

export default {

    get() {
        //var promise = client({
        //    path: '/categories' + this.includes
        //});

        return client({
            path: '/categories' + this.includes
        }).entity().then(function(entity) {
            return new Collection(entity.data.map(function(category) {
                return new Category(category);
            }));
        });
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
