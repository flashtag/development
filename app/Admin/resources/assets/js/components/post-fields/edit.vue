<template>
    <ol class="breadcrumb">
        <li><a href="#">Home</a></li>
        <li><a v-link="'/post-fields'">Post Fields</a></li>
        <li class="active">{{ field.label }}</li>
    </ol>

    <form class="PostField">

        <section class="info row" style="margin-bottom: 20px;">
            <div class="col-md-6 col-md-offset-6 clearfix">
                <div class="action-buttons">
                    <button @click.prevent="save" class="btn btn-primary"><i class="fa fa-save"></i> Save</button>
                    <button v-link="'/post-fields'" @click="delete" class="btn btn-danger"><i class="fa fa-trash"></i> Delete</button>
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
                field: {
                    id: '',
                    label: '',
                    name: '',
                    description: '',
                    template: ''
                }
            }
        },

        methods: {

            fetch: function (successHandler) {
                var self = this;
                client({
                    path: '/fields/'+ this.$route.params.field_id
                }).then(function (response) {
                    self.field = response.entity.data;
                    successHandler(self.field);
                }, function (response) {
                    self.checkResponseStatus(response);
                });
            },

            /**
             * Save the post.
             */
            save: function() {
                var self = this;
                client({
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
                if (confirm("Are you sure you want to delete this? ")) {
                    client({
                        method: 'DELETE',
                        path: '/fields/' + this.field.id
                    });
                }
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
//                CKEDITOR.replaceClass = 'rich-editor';
                this.fetch(function (field) {
                    transition.next({field: field});
                }.bind(this));
            }
        }

    }
</script>