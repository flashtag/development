<template>
    <ol class="breadcrumb">
        <li><a v-link="'/home'">Home</a></li>
        <li><a v-link="'/posts'">Posts</a></li>
        <li><a v-link="'/posts/'+post.id">{{ post.title }}</a></li>
        <li><a v-link="'/posts/'+post.id+'/revisions'">Revisions</a></li>
        <li class="active">{{ revision.id }}</li>
    </ol>

    <div v-if="$loadingRouteData" class="content-loading"><i class="fa fa-spinner fa-spin"></i></div>
    <div v-if="!$loadingRouteData">

        <div class="Revision panel panel-default">
            <div class="panel-heading">
                <div class="row">
                <div class="col-md-6">
                    <strong>{{ who(revision.user_id) }}</strong> &mdash; <em>{{ when(revision.created_at) }}</em>
                </div>
                <div class="col-md-6 clearfix">
                    <div class="view-buttons">
                        <button class="btn btn-sm" :class="{ 'active': !viewDiff }" @click.prevent="viewDiff = false">Content</button>
                        <button class="btn btn-sm" :class="{ 'active': viewDiff }" @click.prevent="viewDiff = true">Changes</button>
                    </div>
                </div>
                </div>
            </div>
            <div class="panel-body">{{{ content }}}</div>
            <div class="panel-footer">
                <button class="btn btn-warning" :class="{ 'disabled': !canRestore() }" @click.prevent="restore">
                    <i class="fa fa-repeat"></i> Restore this revision
                </button>
            </div>
        </div>
    </div>
</template>

<script>
    import DiffMatchPatch from 'diff-match-patch';
    import he from 'he';
    import moment from 'moment';
    import swal from 'sweetalert';

    export default {

        props: ['current-user'],

        data: function () {
            return {
                revision: {},
                post: {},
                viewDiff: false,
                users: []
            }
        },

        computed: {

            content: function () {
                return this.viewDiff ? this.diff : this.revision.new_value;
            },

            diff: function () {
                if (! this.revision) {
                    return '';
                }
                var differ = new DiffMatchPatch();
                var diffs = differ.diff_main(
                        this.revision.old_value || '',
                        this.revision.new_value || ''
                );
                differ.diff_cleanupSemantic(diffs);
                var diff = he.decode(differ.diff_prettyHtml(diffs));

                return this.replaceAll(diff, ['<br>', '¶'], '');
            }

        },

        methods: {

            fetch: function () {
                var self = this;
                return client({
                    path: '/revisions/'+ this.$route.params.revision_id
                }).then(function (response) {
                    self.revision = response.entity.data;
                }, function (response) {
                    self.checkResponseStatus(response);
                });
            },

            fetchPost: function () {
                var self = this;
                return client({
                    path: '/posts/'+ this.$route.params.post_id
                }).then(function (response) {
                    self.post = response.entity.data;
                }, function (response) {
                    self.checkResponseStatus(response);
                });
            },

            fetchUsers: function () {
                var self = this;
                return client({
                    path: '/users'
                }).then(function (response) {
                    self.users = response.entity.data;
                }, function (response) {
                    if (response.status.code == 401 || response.status.code == 500) {
                        self.$dispatch('userHasLoggedOut')
                    }
                });
            },

            restore: function () {
                if (this.canRestore()) {
                    var self = this;
                    swal({
                        title: 'For reals?',
                        text: 'This will restore the content to this state.',
                        type: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#DD6B55',
                        confirmButtonText: 'Yes, restore!',
                        closeOnConfirm: false,
                        showLoaderOnConfirm: true
                    }, function () {
                        var entity = {};
                        entity[self.revision.key] = self.revision.new_value;
                        client({
                            method: 'PATCH',
                            path: '/posts/' + self.$route.params.post_id + '/property',
                            entity: entity
                        }).then(function (response) {
                            swal({
                                html: true,
                                title: 'Great success!',
                                text: '<strong>' + self.post.title + '</strong> was restored to this state!',
                                type: 'success'
                            }, function () {
                                self.$route.router.go('/posts/' + self.post.id);
                            });
                        }, function (response) {
                            swal("Oops", "We couldn't connect to the server!", "error");
                            self.checkResponseStatus(response);
                        });
                    });
                } else {
                    swal("Well, actually...", "There is no difference between this revision and the current state.", "info");
                }
            },

            who: function (userId) {
                if (! userId || ! this.users || !this.users.length) {
                    return 'a script';
                }

                var user = this.users.filter(function (user) {
                    return user.id == userId;
                })[0];

                return user.name;
            },

            when: function (timestamp) {
                return moment.utc(timestamp, 'X').format('h:mm a on MMM D, YYYY');
            },

            canRestore: function () {
                return this.post[this.revision.key] != this.revision.new_value;
            },

            replaceAll: function (str, find, replace) {
                if (! find instanceof Array) {
                    find = [find];
                }

                return find.reduce(function (s, search) {
                    return s.replace(new RegExp(search, 'g'), replace);
                }, str);
            },

            checkResponseStatus: function (response) {
                if (response.status.code == 401 || response.status.code == 500) {
                    this.$dispatch('userHasLoggedOut')
                }
            }

        },

        route: {
            data: function (transition) {
                this.fetch()
                    .then(this.fetchPost)
                    .then(this.fetchUsers)
                    .then(transition.next);
            }
        }

    }
</script>