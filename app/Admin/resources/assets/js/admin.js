var Vue = require('vue');
var VueRouter = require('vue-router');
var rest = require('rest');
var client = require('./client');
Vue.use(VueRouter);
var router = new VueRouter();
import { mapRoutes } from './routes';
mapRoutes(router);

window.client = client;

var Admin = Vue.extend({

    components: {
        'login': require('./components/auth/login.vue')
    },

    data: function() {
        return {
            user: null,
            token: null,
            authenticated: false
        }
    },

    ready: function () {
        this.registerEventListeners();
        this.setLoginStatus();
        console.log('Lock and load');
    },

    methods: {
        registerEventListeners: function () {
            this.$on('userHasLoggedOut', function () {
                this.destroyLogin()
            });
            this.$on('userHasLoggedIn', function (user) {
                this.setLogin(user)
            });
        },

        setLoginStatus: function () {
            var token = localStorage.getItem('jwt-token');
            if (token !== null && token !== 'undefined') {
                var self = this;
                client({ path: '/users/me' }).then(
                    function (response) {
                        console.log('hello... is it me youre looking for?');
                        // User has successfully logged in using the token from storage.
                        self.setLogin(response.entity.user);
                        // broadcast an event telling our children that the data
                        // is ready and views can be rendered.
                        self.$broadcast('data-loaded');
                    },
                    function (response) {
                        console.log('destroy all humans');
                        // Login with our token failed, do some cleanup and
                        // redirect if we're on an authenticated route.
                        self.destroyLogin();
                    }
                )
            }
        },

        setLogin: function (user) {
            // Save login info in our data and set header in case it's not set already.
            this.user = user;
            this.authenticated = true;
            this.token = localStorage.getItem('jwt-token');
        },

        destroyLogin: function () {
            // Cleanup when token was invalid our user has logged out.
            this.user = null;
            this.token = null;
            this.authenticated = false;
            localStorage.removeItem('jwt-token');
            if (this.$route.auth) this.$route.router.go('/auth/login');
        }

    }

});

router.start(Admin, '#Admin');
