import User from '../models/post';

export default {

    get() {
        return client({
            path: '/users' + (this.includes || '')
        }).entity().then(function(entity) {
            return entity.data.map(function(user) {
                return new User(user);
            });
        });
    },

    getById(id) {
        return client({
            path: '/users/' + id + (this.includes || '')
        }).entity().then(function(entity) {
            return new User(entity.data);
        });
    },

    with(...includes) {
        this.includes = includes ? '?include=' + includes.join() : '';

        return this;
    }
}
