export default {

    get() {
        this.includes = this.includes || '';

        return client({
            path: '/tags' + this.includes
        }).entity();
    },

    getById(id) {
        this.includes = this.includes || '';

        return client({
            path: '/tags/' + id + this.includes
        }).entity();
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
