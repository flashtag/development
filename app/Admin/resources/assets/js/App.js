export default {
    el: '#Admin',

    components: {
        // Resources
        'posts-index': require('./components/posts/index.vue'),
        'posts-edit': require('./components/posts/edit.vue'),
        // Partials
        'paginator': require('./components/partials/paginator.vue')
    },

    ready: function() {
        this.getInitialToken();
        this.registerEventListeners();
    },

    data: {
        authenticated: false,
        token: '',
        user: {}
    },

    methods: {
        getInitialToken: function () {
            this.token = localStorage.getItem('jwt-token');
            if (this.token === null || this.token === 'undefined') {
                this.token = document.getElementById('jwt').getAttribute('content');
                localStorage.setItem('jwt-token', 'Bearer ' + this.token);
            }
        },

        registerEventListeners: function () {
            this.$on('userHasLoggedOut', function () {
                this.destroyLogin()
            });
            this.$on('userHasLoggedIn', function (user) {
                this.setLogin(user)
            });
        },

        setLogin: function (user) {
            this.user = user;
            this.authenticated = true;
            this.token = localStorage.getItem('jwt-token');
        },

        destroyLogin: function () {
            this.user = null;
            this.token = null;
            this.authenticated = false;
            localStorage.removeItem('jwt-token');
        }

    }

}
