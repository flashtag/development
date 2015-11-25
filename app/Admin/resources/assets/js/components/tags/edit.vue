<template>
    <ol class="breadcrumb">
        <li><a href="#">Home</a></li>
        <li><a v-link="'/tags'">Tags</a></li>
        <li class="active">{{ tag.name }}</li>
    </ol>

    <form class="Tag EditForm">

        <section class="info row">
            <div class="col-md-6 col-md-offset-6 clearfix">
                <div class="action-buttons">
                    <button @click.prevent="save" class="btn btn-primary"><i class="fa fa-save"></i> Save</button>
                    <button @click.prevent="delete" class="btn btn-danger"><i class="fa fa-trash"></i> Delete</button>
                    <button v-link="'/tags'" class="btn btn-default"><i class="fa fa-close"></i> Close</button>
                </div>
            </div>
        </section>

        <div class="panel panel-default">
            <div class="panel-heading">Tag</div>
            <div class="panel-body">
                <div class="form-group">
                    <label for="name">Name</label>
                    <input type="text" v-model="tag.name" name="name" id="name" class="form-control">
                </div>
                <div class="form-group">
                    <label for="description">Description</label>
                    <input type="text" v-model="tag.description" name="description" id="description" class="form-control">
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
                tag: {
                    id: '',
                    name: '',
                    description: ''
                }
            }
        },

        methods: {

            fetch: function (successHandler) {
                var self = this;
                client({
                    path: '/tags/'+ this.$route.params.tag_id
                }).then(function (response) {
                    self.tag = response.entity.data;
                    successHandler(self.tag);
                }, function (response) {
                    self.checkResponseStatus(response);
                });
            },

            /**
             * Save the post.
             */
            save: function() {
                var self = this;
                console.log(this.tag);
                client({
                    method: 'PUT',
                    path: '/tags/'+this.tag.id,
                    entity: this.tag
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
                    text: 'You will not be able to recover this tag!',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#DD6B55',
                    confirmButtonText: 'Yes, delete it!',
                    closeOnConfirm: false,
                    showLoaderOnConfirm: true
                }, function () {
                    client({
                        method: 'DELETE',
                        path: '/tags/' + self.tag.id
                    }).then(function () {
                        swal({
                            html: true,
                            title: 'Deleted!',
                            text: '<strong>' + self.tag.name + '</strong> was deleted!',
                            type: 'success'
                        }, function () {
                            self.deleted = true;
                            self.$route.router.go('/tags');
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
                this.fetch(function (tag) {
                    transition.next({tag: tag});
                }.bind(this));
            }
        }

    }
</script>