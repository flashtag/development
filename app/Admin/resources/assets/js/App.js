import User from './models/user';

export default {
    el: '#Admin',

    components: {
        'posts': require('./components/posts/index.vue'),
        'fields': require('./components/fields/index.vue'),
        'categories': require('./components/categories.vue'),
        'tags': require('./components/tags.vue'),
        'authors': require('./components/authors.vue'),
        'media-input': require('./components/partials/media-input.vue'),
        'dropzone': require('./components/partials/dropzone.vue')
    },

    ready: function() {
        this.getInitialToken();
        this.setLoginStatus();
    },

    data: {
        authenticated: false,
        user: {},
        token: ''
    },

    methods: {
        getInitialToken: function () {
            this.token = localStorage.getItem('jwt-token');
            if (this.token === null || this.token === 'undefined') {
                this.token = document.getElementById('jwt').getAttribute('content');
                localStorage.setItem('jwt-token', 'Bearer ' + this.token);
            }
        },

        setLoginStatus: function () {
            this.$http.get('auth/user/me')
                .then(function (response) {
                    this.setLogin(response.data.user);
                    this.$broadcast('user:loaded');
                }, function (response) {
                    this.destroyLogin();
                });
        },

        setLogin: function (user) {
            this.user = new User(user);
            this.authenticated = true;
            this.token = localStorage.getItem('jwt-token');
        },

        destroyLogin: function () {
            this.user = {};
            this.token = null;
            this.authenticated = false;
            localStorage.removeItem('jwt-token');
        }

    }

}
