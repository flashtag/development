import Post from '../models/post';

export default {

    get() {
        return client({
            path: '/posts',
            params: this.params()
        }).entity().then(function(entity) {
            return entity.data.map(function(post) {
                return new Post(post);
            });
        });
    },

    getById(id) {
        return client({
            path: '/posts/' + id,
            params: this.params()
        }).entity().then(function(entity) {
            return new Post(entity.data);
        });
    },

    params() {
        var params = {};
        if (this.includes) {
            params.include = this.includes;
        }
        if (this.orderBy) {
            params.orderBy = this.orderBy;
        }
        return params;
    },

    with(...includes) {
        this.includes = includes ? includes.join() : '';

        return this;
    },

    orderBy(key, dir) {
        dir = dir ? '|' + dir : '|asc';
        this.orderBy = key ? key  + dir : '';

        return this;
    }
}
