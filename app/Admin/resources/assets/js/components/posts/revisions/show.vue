<template>
    <ol class="breadcrumb">
        <li><a v-link="'/home'">Home</a></li>
        <li><a v-link="'/posts'">Posts</a></li>
        <li><a v-link="'/posts/'+post.id">{{ post.title }}</a></li>
        <li><a v-link="'/posts/'+post.id+'/revisions'">Revisions</a></li>
        <li class="active">{{ revision.id }}</li>
    </ol>

    <div class="Revision panel panel-default">
        <div class="panel-heading">Revision</div>
        <div class="panel-body">{{{ diff }}}</div>
        <div class="panel-footer">
            <button class="btn btn-warning" @click.prevent><i class="fa fa-repeat"></i> Restore this revision</button>
        </div>
    </div>
</template>

<script>
    var DiffMatchPatch = require('diff-match-patch');
    var he = require('he');

    export default {

        props: ['current-user'],

        data: function () {
            return {
                revision: {},
                post: {}
            }
        },

        computed: {

            diff: function () {
                if (! this.revision) {
                    return '';
                }
                var dmp = new DiffMatchPatch();
                var diffs = dmp.diff_main(
                        this.revision.old_value || '',
                        this.revision.new_value || ''
                );
                dmp.diff_cleanupSemantic(diffs);

                return he.decode(dmp.diff_prettyHtml(diffs));
            }

        },

        methods: {

            fetch: function (successHandler) {
                var self = this;
                client({
                    path: '/revisions/'+ this.$route.params.revision_id
                }).then(function (response) {
                    self.revision = response.entity.data;
                    successHandler(self.revision);
                }, function (response) {
                    self.checkResponseStatus(response);
                });
            },

            fetchPost: function () {
                var self = this;
                client({
                    path: '/posts/'+ this.$route.params.post_id
                }).then(function (response) {
                    self.post = response.entity.data;
                }, function (response) {
                    self.checkResponseStatus(response);
                });
            },

            restore: function () {
                var self = this;
                var entity = {};
                entity[this.revision.key] = this.revision.new_value;
                client({
                    method: 'PATCH',
                    path: '/posts/'+ this.$route.params.post_id,
                    entity: entity
                }).then(function (response) {
                    // success
                }, function (response) {
                    self.checkResponseStatus(response);
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
                this.fetchPost();
                this.fetch(function (data) {
                    transition.next({revision: data})
                });
            }
        }

    }
</script>