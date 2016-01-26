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
        this.setLoginStatus();
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

        setLoginStatus: function () {
            if (this.token !== null && this.token !== 'undefined') {
                this.$http.get('auth/user/me')
                    .then(function (response) {
                        this.setLogin(response.data.user);
                        this.$broadcast('data-loaded');
                    }, function (response) {
                        this.destroyLogin();
                    });
            }
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
