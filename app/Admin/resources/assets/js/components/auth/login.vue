<template>
    <div class="panel-heading">
        Sign in to your account
    </div>
    <div class="panel-body">
        <form class="form-horizontal" role="form" action="/admin/auth/login" method="POST">
            <input type="hidden" name="_token" value="{{ csrf }}">
            <div id="alerts" v-if="messages.length > 0">
                <div v-for="message in messages" class="alert alert-{{ message.type }} alert-dismissible" role="alert">
                    {{ message.message }}
                </div>
            </div>

            <div class="form-group">
                <label class="col-md-4 control-label">E-Mail Address</label>
                <div class="col-md-6">
                    <input type="email" class="form-control" v-model="user.email">
                </div>
            </div>

            <div class="form-group">
                <label class="col-md-4 control-label">Password</label>
                <div class="col-md-6">
                    <input type="password" class="form-control" v-model="user.password">
                </div>
            </div>

            <div class="form-group">
                <div class="col-md-6 col-md-offset-4">
                    <button type="submit" class="btn btn-primary" @click="attempt">
                        <i class="fa fa-btn fa-sign-in"></i>Login
                    </button>

                    <a class="btn btn-link" v-link="{ path: '/admin/auth/forgot' }">Forgot Your Password?</a>
                </div>
            </div>
        </form>
    </div>
</template>

<script>
    export default {

        props: ['csrf'],

        data: function () {
            return {
                user: {
                    email: null,
                    password: null
                },
                remember: false,
                messages: []
            }
        },

        methods: {
            attempt: function (e) {
                e.preventDefault();
                var self = this;
                client({
                    path: 'auth',
                    entity: this.user
                }).then(function (response) {
                    self.$dispatch('userHasFetchedToken', response.token);
                    self.getUserData();
                }, function (response) {
                    self.messages = [];
                    if (response.status && response.status.code === 401) {
                        self.messages.push({type: 'danger', message: 'Sorry, you provided invalid credentials'});
                    }
                });
            },

            getUserData: function () {
                var self = this;
                client({ path: '/auth/user/me' }).then(function (response) {
                    self.$dispatch('userHasLoggedIn', response.entity.user);
                    self.$route.router.go('/');
                }, function (response) {
                    console.log(response);
                });
            }
        }
    }
</script>
