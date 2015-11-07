var Vue = require('vue');

var rest = require('rest');
var pathPrefix = require('rest/interceptor/pathPrefix');
var mime = require('rest/interceptor/mime');
var defaultRequest = require('rest/interceptor/defaultRequest');
var errorCode = require('rest/interceptor/errorCode');
var interceptor = require('rest/interceptor');
var jwtAuth = require('./interceptors/jwtAuth');
var client = rest.wrap(pathPrefix, { prefix: config.api.base_url })
                 .wrap(mime)
                 .wrap(defaultRequest, config.api.defaultRequest)
                 .wrap(errorCode, { code: 400 })
                 .wrap(jwtAuth);

var admin = new Vue({

    el: '#admin',

    data: {
        user: null,
        token: null,
        authenticated: false
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
                client({ path: '/users/me' }).then(
                    function (response) {
                        // User has successfully logged in using the token from storage.
                        self.setLogin(response.entity.user);
                        // broadcast an event telling our children that the data
                        // is ready and views can be rendered.
                        self.$broadcast('data-loaded');
                    },
                    function (response) {
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

        destroyLogin: function (user) {
            // Cleanup when token was invalid our user has logged out.
            this.user = null;
            this.token = null;
            this.authenticated = false;
            localStorage.removeItem('jwt-token');
            if (this.$route.auth) this.$route.router.go('/auth/login');
        }

    }

});
