<template>
    <ol class="breadcrumb">
        <li><a href="#">Home</a></li>
        <li><a v-link="'/post-fields'">Post Fields</a></li>
        <li class="active">{{ field.label }}</li>
    </ol>

    <div v-if="$loadingRouteData" class="content-loading"><i class="fa fa-spinner fa-spin"></i></div>
    <div v-if="!$loadingRouteData">

        <form class="PostField EditForm">

            <section class="info row">
                <div class="col-md-6 col-md-offset-6 clearfix">
                    <div class="action-buttons">
                        <button @click.prevent="save" class="btn btn-primary"><i class="fa fa-save"></i> Save</button>
                        <button @click.prevent="delete" class="btn btn-danger"><i class="fa fa-trash"></i> Delete</button>
                        <button v-link="'/post-fields'" class="btn btn-default"><i class="fa fa-close"></i> Close</button>
                    </div>
                </div>
            </section>

            <div class="panel panel-default">
                <div class="panel-heading">POST FIELD</div>
                <div class="panel-body">
                    <div class="form-group">
                        <label for="label">Label</label>
                        <input type="text" v-model="field.label" label="label" id="label" class="form-control">
                    </div>
                    <div class="form-group">
                        <label for="name">Name</label>
                        <input type="text" v-model="field.name" name="name" id="name" class="form-control">
                    </div>
                    <div class="form-group">
                        <label for="description">Description</label>
                        <input type="text" v-model="field.description" name="description" id="description" class="form-control">
                    </div>
                    <div class="form-group">
                        <label for="template">Template</label>
                        <select v-model="field.template" name="template" id="template" class="form-control">
                            <option value="" disabled selected>Select a template...</option>
                            <option v-for="template in templates" value="{{ template.id }}">{{ template.text }}</option>
                        </select>
                    </div>
                </div>
            </div>
        </form>
    </div>
</template>

<script>
    import swal from 'sweetalert';

    export default {

        props: ['current-user'],

        data: function() {
            return {
                field: {
                    id: '',
                    label: '',
                    name: '',
                    description: '',
                    template: ''
                },
                templates: [
                    { id: 'string', text: 'String' },
                    { id: 'rich_text', text: 'Rich Text' }
                ]
            }
        },

        methods: {

            fetch: function () {
                var self = this;
                return client({
                    path: '/fields/'+ this.$route.params.field_id
                }).then(function (response) {
                    self.field = response.entity.data;
                }, function (response) {
                    self.checkResponseStatus(response);
                });
            },

            /**
             * Save the post.
             */
            save: function() {
                var self = this;
                return client({
                    method: 'PUT',
                    path: '/fields/'+this.field.id,
                    entity: this.field
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
                    text: 'You will not be able to recover this post and all of its revision history!',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#DD6B55',
                    confirmButtonText: 'Yes, delete it!',
                    closeOnConfirm: false,
                    showLoaderOnConfirm: true
                }, function () {
                    client({
                        method: 'DELETE',
                        path: '/fields/' + self.field.id
                    }).then(function () {
                        swal({
                            html: true,
                            title: 'Deleted!',
                            text: '<strong>' + self.field.name + '</strong> was deleted!',
                            type: 'success'
                        }, function () {
                            self.$route.router.go('/post-fields');
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
                this.fetch().then(transition.next);
            }
        }

    }
</script>