import Category from '../models/category';

export default {

    get() {
        return client.get('/api/categories', (this.includes || ''))
            .then(function(response) {
                return response.data.data.map(function(category) {
                    return new Category(category);
                });
            });
    },

    getById(id) {
        return client.get('/api/categories/' + id, (this.includes || ''))
            .then(function(response) {
                return new Category(response.data.data);
            });
    },

    with(...includes) {
        this.includes = includes ? '?include=' + includes.join() : '';

        return this;
    }
}
