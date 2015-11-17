<template>
    <ol class="breadcrumb">
        <li><a href="#">Home</a></li>
        <li><a v-link="'/posts'">Posts</a></li>
        <li><a v-link="'/posts/'+post.id">{{ post.title }}</a></li>
        <li class="active">Revision History</li>
    </ol>

    <div class="panel panel-default">
        <div class="panel-heading">Revisions</div>
        <table class="Posts table table-hover">
            <tbody>
            <tr v-for="revision in post.revisions.data
                    | filterBy titleFilter in 'title'
                    | orderBy 'created_at' -1"
                class="Revision">
                <td><a v-link="'/posts/'+post.id+'/revisions/'+revision.id"><strong>{{ revision.key }}</strong> changed by <em>{{ userName(revision.user_id) }}</em></a></td>
                <td>{{ formatTimestamp(revision.created_at) }}</td>
            </tr>
            </tbody>
        </table>
    </div>

</template>

<script>
    var moment = require('moment');

    export default {

        props: ['current-user'],

        data: function () {
            return {
                post: { revisions: { data: [] } },
                pagination: { links: {} },
                users: [],
                titleFilter: null,
                categoryFilter: null,
                sortKey: null,
                sortDir: -1
            }
        },

        methods: {

            fetch: function (successHandler) {
                var self = this;
                client({
                    path: '/posts/' + this.$route.params.post_id + '?include=revisions'
                }).then(function (response) {
                    self.post = response.entity.data;
                    successHandler(response.entity.data);
                }, function (response) {
                    if (response.status.code == 401 || response.status.code == 500) {
                        self.$dispatch('userHasLoggedOut')
                    }
                });
            },

            fetchUsers: function (successHandler) {
                var self = this;
                client({
                    path: '/users'
                }).then(function (response) {
                    self.users = response.entity.data;
                    // successHandler(response.entity.data);
                }, function (response) {
                    if (response.status.code == 401 || response.status.code == 500) {
                        self.$dispatch('userHasLoggedOut')
                    }
                });
            },

            fetchCategories: function () {
                var self = this;
                client({
                    path: '/categories'
                }).then(function (response) {
                    self.categories = response.entity.data;
                }, function (response) {
                    if (response.status.code == 401 || response.status.code == 500) {
                        self.$dispatch('userHasLoggedOut')
                    }
                });
            },

            userName: function (userId) {
                if (! userId || ! this.users || !this.users.length) {
                    return 'a script';
                }

                var user = this.users.filter(function (user) {
                    return user.id == userId;
                })[0];

                return user.name;
            },

            formatTimestamp: function (timestamp) {
                return moment.unix(timestamp).format('h:mm a on MMM D, YYYY');
            },

            sortBy: function (key) {
                if (this.sortKey == key) {
                    this.sortDir = this.sortDir * -1;
                } else {
                    this.sortKey = key;
                    this.sortDir = 1;
                }
            },

            orderIcon: function (key) {
                if (key == this.sortKey) {
                    return this.sortDir > 0 ? 'fa fa-sort-asc' : 'fa fa-sort-desc'
                }

                return 'fa fa-unsorted';
            },

            initTooltips: function () {
                this.$nextTick(function() {
                    $('[data-toggle="tooltip"]').tooltip();
                });
            },

        },

        computed: {

            currentUserName: function () {
                return this.currentUser ? this.currentUser.name : '';
            }

        },

        route: {
            data: function (transition) {
                this.fetchUsers();
                this.fetch(function (data) {
                    transition.next({post: data})
                });
            }
        }

    }
</script>