<template>
    <ol class="breadcrumb">
        <li><a href="#">Home</a></li>
        <li><a v-link="'/users'">Users</a></li>
        <li class="active">{{ user.name }}</li>
    </ol>

    <form class="User EditForm">

        <section class="info row">
            <div class="col-md-6 col-md-offset-6 clearfix">
                <div class="action-buttons">
                    <button @click.prevent="save" class="btn btn-primary"><i class="fa fa-save"></i> Save</button>
                    <button v-link="'/users'" @click="delete" class="btn btn-danger"><i class="fa fa-trash"></i> Delete</button>
                    <button v-link="'/users'" class="btn btn-default"><i class="fa fa-close"></i> Close</button>
                </div>
            </div>
        </section>

        <div class="panel panel-default">
            <div class="panel-heading">User</div>
            <div class="panel-body">
                <div class="form-group">
                    <label for="name">Name</label>
                    <input type="text" v-model="user.name" name="name" id="name" class="form-control">
                </div>
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="text" v-model="user.email" name="email" id="email" class="form-control">
                </div>
            </div>
            <div class="panel-footer">
                <a href="#" class="btn btn-default" @click.prevent="passwordReset"><i class="fa fa-envelope"></i> Send password reset</a>
            </div>
        </div>
    </form>
</template>

<script>
    var moment = require ('moment');
    var swal = require('sweetalert');

    export default {

        props: ['current-user'],

        data: function() {
            return {
                user: {
                    id: '',
                    name: '',
                    email: ''
                }
            }
        },

        methods: {

            fetch: function (successHandler) {
                var self = this;
                client({
                    path: '/users/'+ this.$route.params.user_id
                }).then(function (response) {
                    self.user = response.entity.data;
                    successHandler(self.user);
                }, function (response) {
                    self.checkResponseStatus(response);
                });
            },

            /**
             * Save the post.
             */
            save: function() {
                var self = this;
                console.log(this.user);
                client({
                    method: 'PUT',
                    path: '/users/'+this.user.id,
                    entity: this.user
                }).then(function (response) {
                    self.notify('success', 'Saved successfully.');
                }, function (response) {
                    self.checkResponseStatus(response);
                });
            },

            delete: function() {
                if (confirm("Are you sure you want to delete this? ")) {
                    client({
                        method: 'DELETE',
                        path: '/users/' + this.user.id
                    });
                }
            },

            passwordReset: function () {
                swal({
                    title: 'Heads up!',
                    text: 'This will email a unique password reset link to this user that will expire in <b>one hour</b>.',
                    type: 'info',
                    showCancelButton: true,
                    confirmButtonText: 'Send link',
                    closeOnConfirm: false,
                    showLoaderOnConfirm: true,
                    html: true
                }, function () {
                    var data = {
                        email: this.user.email,
                        _token: document.getElementById('csrf').getAttribute('content')
                    };
                    $.post('/admin/password/email', data, function(response) {
                        swal("Sent!", "The password reset link has been emailed!", "success");
                    });
                }.bind(this));
            },

            notify: function (type, message) {
                if (type == 'success') {
                    var icon = "fa fa-thumbs-o-up";
                } else if (type == 'warning') {
                    var icon = "fa fa-warning";
                }
                $.notify({
                    icon: icon,
                    message: message
                }, {
                    type: type,
                    delay: 3000,
                    offset: { x: 20, y: 70 }
                });
            },

            checkResponseStatus: function (response) {
                if (response.status.code == 401 || response.status.code == 500) {
                    this.$dispatch('userHasLoggedOut')
                }
            }

        },

        route: {
            data: function (transition) {
                this.fetch(function (user) {
                    transition.next({user: user});
                }.bind(this));
            }
        }

    }
</script>