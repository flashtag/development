<template>
    <ol class="breadcrumb">
        <li><a href="#">Home</a></li>
        <li><a v-link="'/tags'">Tags</a></li>
        <li class="active">Create</li>
    </ol>

    <form class="Tag">

        <section class="info row">
            <div class="col-md-6 col-md-offset-6 clearfix">
                <div class="action-buttons">
                    <button @click.prevent="save" class="btn btn-success"><i class="fa fa-save"></i> Save</button>
                    <button v-link="'/tags'" class="btn btn-default"><i class="fa fa-close"></i> Cancel</button>
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
    import Tag from '../../models/tag';

    export default {

        props: ['current-user'],

        data: function() {
            return {
                tag: {
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
                Tag.create(this.tag).then(function (response) {
                    self.$route.router.go('/tags');
                }, function (response) {
                    if (response.status.code == 401 || response.status.code == 500) {
                        self.$dispatch('userHasLoggedOut')
                    }
                });
            }

        }

    }
</script>