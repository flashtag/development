import User from '../models/user';

export default {

    get() {
        return client.get('/api/users', (this.includes || ''))
            .then(function(response) {
                return response.data.data.map(function(user) {
                    return new User(user);
                });
            });
    },

    getById(id) {
        return client.get('/api/users/' + id, (this.includes || ''))
                .then(function(response) {
                    return new User(response.data.data);
                });
    },

    with(...includes) {
        this.includes = includes ? '?include=' + includes.join() : '';

        return this;
    }
}
