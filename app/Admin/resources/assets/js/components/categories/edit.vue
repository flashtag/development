<template>
    <ol class="breadcrumb">
        <li><a href="#">Home</a></li>
        <li><a v-link="'/categories'">Categories</a></li>
        <li class="active">{{ category.name }}</li>
    </ol>

    <form class="Category EditForm">

        <section class="info row">
            <div class="col-md-6 col-md-offset-6 clearfix">
                <div class="action-buttons">
                    <button @click.prevent="save" class="btn btn-primary"><i class="fa fa-save"></i> Save</button>
                    <button v-link="'/categories'" @click="delete" class="btn btn-danger"><i class="fa fa-trash"></i> Delete</button>
                    <button v-link="'/categories'" class="btn btn-default"><i class="fa fa-close"></i> Close</button>
                </div>
            </div>
        </section>

        <div class="panel panel-default">
            <div class="panel-heading">Category</div>
            <div class="panel-body">
                <div class="form-group">
                    <label for="name">Name</label>
                    <input type="text" v-model="category.name" name="name" id="name" class="form-control">
                </div>
                <div class="form-group">
                    <label for="description">Description</label>
                    <input type="text" v-model="category.description" name="description" id="description" class="form-control">
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
                category: {
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
                    path: '/categories/'+ this.$route.params.category_id
                }).then(function (response) {
                    self.category = response.entity.data;
                    successHandler(self.category);
                }, function (response) {
                    self.checkResponseStatus(response);
                });
            },

            /**
             * Save the post.
             */
            save: function() {
                var self = this;
                console.log(this.category);
                client({
                    method: 'PUT',
                    path: '/categories/'+this.category.id,
                    entity: this.category
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
                        path: '/categories/' + this.category.id
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
                this.fetch(function (category) {
                    transition.next({category: category});
                }.bind(this));
            }
        }

    }
</script>