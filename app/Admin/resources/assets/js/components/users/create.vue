<template>
    <ol class="breadcrumb">
        <li><a href="#">Home</a></li>
        <li><a v-link="'/users'">Users</a></li>
        <li class="active">Create</li>
    </ol>

    <form class="User">

        <section class="info row">
            <div class="col-md-6 col-md-offset-6 clearfix">
                <div class="action-buttons">
                    <button v-link="'/users'" @click="save" class="btn btn-success"><i class="fa fa-save"></i> Save</button>
                    <button v-link="'/users'" class="btn btn-default"><i class="fa fa-close"></i> Cancel</button>
                </div>
            </div>
        </section>

        <div class="panel panel-default">
            <div class="panel-heading">User</div>
            <div class="panel-body">
                <div class="form-group">
                    <label for="name">Name</label>
                    <input type="text" v-model="user.name" name="name" id="name" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="text" v-model="user.email" name="email" id="email" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" v-model="user.password" name="password" id="password" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="password_confirmation">Confirm password</label>
                    <input type="password" v-model="user.password_confirmation" name="password_confirmation" id="password_confirmation" class="form-control" required>
                </div>
            </div>
        </div>
    </form>
</template>

<script>
    var moment = require ('moment');

    export default {

        props: ['current-user'],

        data: function() {
            return {
                user: {
                    name: '',
                    email: '',
                    password: '',
                    password_confirmation: ''
                }
            }
        },

        methods: {

            /**
             * Save the post.
             */
            save: function() {
                var self = this;
                console.log(this.user);
                client({
                    method: 'POST',
                    path: '/users',
                    entity: this.user
                }).then(function (response) {
                    // success
                }, function (response) {
                    if (response.status.code == 401 || response.status.code == 500) {
                        self.$dispatch('userHasLoggedOut')
                    }
                });
            }

        }

    }
</script>