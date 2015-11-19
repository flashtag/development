<template>
    <ol class="breadcrumb">
        <li><a href="#">Home</a></li>
        <li><a v-link="'/categories'">Categories</a></li>
        <li class="active">Create</li>
    </ol>

    <form class="Category">

        <section class="info row">
            <div class="col-md-6 col-md-offset-6 clearfix">
                <div class="action-buttons">
                    <button @click.prevent="save" class="btn btn-success"><i class="fa fa-save"></i> Save</button>
                    <button v-link="'/categories'" class="btn btn-default"><i class="fa fa-close"></i> Cancel</button>
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
                    name: '',
                    description: ''
                }
            }
        },

        methods: {

            /**
             * Save the post.
             */
            save: function() {
                var self = this;
                client({
                    method: 'POST',
                    path: '/categories',
                    entity: this.category
                }).then(function (response) {
                    self.$route.router.go('/categories');
                }, function (response) {
                    if (response.status.code == 401 || response.status.code == 500) {
                        self.$dispatch('userHasLoggedOut')
                    }
                });
            }

        }

    }
</script>