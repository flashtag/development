import Tag from '../models/tag';

export default {

    get() {
        return client({
            path: '/tags' + (this.includes || '')
        }).entity().then(function(entity) {
            return entity.data.map(function(tag) {
                return new Tag(tag);
            });
        });
    },

    getById(id) {
        return client({
            path: '/tags/' + id + (this.includes || '')
        }).entity().then(function(entity) {
            return new Tag(entity.data);
        });
    },

    with(...includes) {
        this.includes = includes ? '?include=' + includes.join : '';

        return this;
    }
}
