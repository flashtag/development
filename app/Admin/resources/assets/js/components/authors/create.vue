<template>
    <ol class="breadcrumb">
        <li><a href="#">Home</a></li>
        <li><a v-link="'/authors'">Authors</a></li>
        <li class="active">Create</li>
    </ol>

    <form class="Author">

        <section class="info row">
            <div class="col-md-6 col-md-offset-6 clearfix">
                <div class="action-buttons">
                    <button @click.prevent="save" class="btn btn-success"><i class="fa fa-save"></i> Save</button>
                    <button v-link="'/authors'" class="btn btn-default"><i class="fa fa-close"></i> Cancel</button>
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
                    <textarea name="bio" id="bio" class="form-control rich-editor" v-rich-editor="author.bio"></textarea>
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
                author: {
                    name: '',
                    bio: ''
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
                    path: '/authors',
                    entity: this.author
                }).then(function (response) {
                    self.$route.router.go('/authors');
                }, function (response) {
                    if (response.status.code == 401 || response.status.code == 500) {
                        self.$dispatch('userHasLoggedOut')
                    }
                });
            }

        }

    }
</script>