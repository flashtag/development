<template>
    <section class="Main">
            <div class="Main__menu">
                <side-nav></side-nav>
            </div>
            <div class="Main__container">
                <top-nav :current-user="user"></top-nav>
                <div class="Main__content">
                    <router-view
                            :current-user="user"
                    ></router-view>
                </div>
            </div>
    </section>
</template>

<script>
import Cookies from 'js-cookie';

export default {

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

}
</script>
