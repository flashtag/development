var Vue = require('vue');
var VueRouter = require('vue-router');
var rest = require('rest');
var client = require('./client');
Vue.use(VueRouter);
var router = new VueRouter();
import { mapRoutes } from './routes';
mapRoutes(router);
var Cookies = require('js-cookie');

window.client = client;

Vue.component('nav-component', require('./components/partials/nav.vue'));
Vue.component('footer-component', require('./components/partials/footer.vue'));
Vue.component('paginator', require('./components/partials/paginator.vue'));

var Admin = Vue.extend({

    data: function() {
        return {
            user: null,
            token: null,
            authenticated: false
        }
    },

    ready: function () {
        this.getInitialToken();
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
            var token = Cookies.get('jwt-token');
            if (token !== null && token !== 'undefined') {
                var self = this;
                client({
                    path: '/auth/user/me'
                }).then(function (response) {
                    self.setLogin(response.entity.user);
                    self.$broadcast('data-loaded');
                }, function (response) {
                    self.destroyLogin();
                });
            }
        },

        setLogin: function (user) {
            this.user = user;
            this.authenticated = true;
            this.token = Cookies.get('jwt-token');
        },

        destroyLogin: function () {
            this.user = null;
            this.token = null;
            this.authenticated = false;
            Cookies.remove('jwt-token');
        },

        getInitialToken: function () {
            if (! Cookies.get('jwt-token')) {
                this.token = document.getElementById('jwt').getAttribute('content');
                Cookies.set('jwt-token', 'Bearer ' + this.token, {expires: 7, path: ''});
            }
        }

    }

});

router.start(Admin, '#Admin');
