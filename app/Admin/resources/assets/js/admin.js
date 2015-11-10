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
                client({
                    path: '/auth/user/me'
                }).then(function (response) {
                    console.log("login");
                    self.setLogin(response.entity.user);
                    self.$broadcast('data-loaded');
                }, function (response) {
                    console.log('logout');
                    self.destroyLogin();
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
            if (this.$route.auth) {
                this.$route.router.go('/auth/login');
            }
        }

    }

});

router.start(Admin, '#Admin');
