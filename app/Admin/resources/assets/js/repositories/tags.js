export default {

    get() {
        return client({
            path: '/tags'
        }).entity();
    },

    getById(id) {
        return client({
            path: '/tags/' + id
        }).entity();
    }

}
