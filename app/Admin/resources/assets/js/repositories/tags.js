import Tag from '../models/tag';

export default {

    get() {
        return client.get('/api/tags', (this.includes || ''))
            .then(function(response) {
                return response.data.data.map(function(tag) {
                    return new Tag(tag);
                });
            });
    },

    getById(id) {
        return client.get('/api/tags/' + id, (this.includes || ''))
            .then(function(response) {
                return new Tag(response.data.data);
            });
    },

    with(...includes) {
        this.includes = includes ? '?include=' + includes.join : '';

        return this;
    }
}
