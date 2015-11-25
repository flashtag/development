<template>
    <ol class="breadcrumb">
        <li><a href="#">Home</a></li>
        <li><a v-link="'/authors'">Authors</a></li>
        <li class="active">{{ author.name }}</li>
    </ol>

    <form class="Author EditForm">

        <section class="info row">
            <div class="col-md-6 col-md-offset-6 clearfix">
                <div class="action-buttons">
                    <button @click.prevent="save" class="btn btn-primary"><i class="fa fa-save"></i> Save</button>
                    <button @click.prevent="delete" class="btn btn-danger"><i class="fa fa-trash"></i> Delete</button>
                    <button v-link="'/authors'" class="btn btn-default"><i class="fa fa-close"></i> Close</button>
                </div>
            </div>
        </section>

        <div class="panel panel-default">
            <div class="panel-heading">Author</div>
            <div class="panel-body">
                <div class="form-group">
                    <label for="name">Name</label>
                    <input type="text" v-model="author.name" name="name" id="name" class="form-control">
                </div>
                <div class="form-group">
                    <label for="bio">Bio</label>
                    <textarea name="bio" id="bio" class="form-control rich-editor" v-if="author.bio" v-rich-editor="author.bio"></textarea>
                </div>
            </div>
        </div>
    </form>
</template>

<script>
    import swal from 'sweetalert';

    export default {

        props: ['current-user'],

        data: function() {
            return {
                author: {
                    id: '',
                    name: '',
                    bio: ''
                }
            }
        },

        methods: {

            fetch: function (successHandler) {
                var self = this;
                client({
                    path: '/authors/'+ this.$route.params.author_id
                }).then(function (response) {
                    self.author = response.entity.data;
                    successHandler(self.author);
                }, function (response) {
                    self.checkResponseStatus(response);
                });
            },

            /**
             * Save the post.
             */
            save: function() {
                var self = this;
                console.log(this.author);
                client({
                    method: 'PUT',
                    path: '/authors/'+this.author.id,
                    entity: this.author
                }).then(function (response) {
                    self.notify('success', 'Saved successfully.');
                }, function (response) {
                    self.checkResponseStatus(response);
                });
            },

            delete: function() {
                var self = this;
                swal({
                    title: 'Are you sure?',
                    text: 'You will not be able to recover this author!',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#DD6B55',
                    confirmButtonText: 'Yes, say good-bye!',
                    closeOnConfirm: false,
                    showLoaderOnConfirm: true
                }, function () {
                    client({
                        method: 'DELETE',
                        path: '/authors/' + self.author.id
                    }).then(function () {
                        swal({
                            html: true,
                            title: 'Deleted!',
                            text: '<strong>' + self.author.name + '</strong> was deleted!',
                            type: 'success'
                        }, function () {
                            self.deleted = true;
                            self.$route.router.go('/authors');
                        });
                    }, function () {
                        swal("Oops", "We couldn't connect to the server!", "error");
                    });
                });
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
                this.fetch(function (author) {
                    transition.next({author: author});
                }.bind(this));
            }
        }

    }
</script>