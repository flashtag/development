import Post from '../models/post';

export default {

    resource: resource('posts{/id}'),

    get() {
        var posts;

        this.resource.get(this.params())
            .then(function(response) {
                posts = response.data.data.map(function(p) {
                    return new Post(p);
                });
            });

        return posts;
    },

    getById(id) {
        var params = this.params();
        params.id = id;

        return this.resource.get(params)
            .then(function(response) {
                return new Post(response.data.data);
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
