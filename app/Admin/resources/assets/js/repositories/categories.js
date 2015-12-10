export default {

    get() {
        return client({
            path: '/categories'
        }).entity();
    },

    getById(id) {
        return client({
            path: '/categories/' + id
        }).entity();
    }

}
