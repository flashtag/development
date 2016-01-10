<template>
    <section class="Main">
        <top-nav :current-user="user"></top-nav>
        <div class="Main__menu">
            <side-nav></side-nav>
        </div>
        <div class="Main__container">
            <div class="Main__content">
                <router-view
                        :current-user="user"
                ></router-view>
            </div>
        </div>
    </section>
</template>

<script>
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
            var token = localStorage.getItem('jwt-token');
            if (token !== null && token !== 'undefined') {
                var self = this;
                client.get('/api/auth/user/me')
                    .then(function (response) {
                        self.setLogin(response.data.user);
                        self.$broadcast('data-loaded');
                    }, function (response) {
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
        },

        getInitialToken: function () {
            this.token = localStorage.getItem('jwt-token');
            if (this.token === null || this.token === 'undefined') {
                this.token = document.getElementById('jwt').getAttribute('content');
            }
            localStorage.setItem('jwt-token', 'Bearer ' + this.token);
        }

    }

}
</script>
