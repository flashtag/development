<template>
    <ol class="breadcrumb">
        <li><a href="#">Home</a></li>
        <li class="active">Posts</li>
    </ol>

    <div class="filters">
        <div class="row">
            <div class="col-md-6">
                <input type="text" v-model="titleFilter" placeholder="Filter by title..." class="form-control">
            </div>
            <div class="col-md-6">
                <select v-model="categoryFilter" id="category" class="form-control">
                    <option value="" selected>Filter by category...</option>
                    <option v-for="category in categories" :value="category.name">
                        {{ category.name }}
                    </option>
                </select>
            </div>
        </div>
    </div>

    <table class="Posts table table-striped table-hover">
        <thead>
            <tr>
                <th><a href="#" @click.prevent="sortBy('title')">Title <i :class="orderIcon('title')"></i></a></th>
                <th><a href="#" @click.prevent="sortBy('category.data.name')">Category <i :class="orderIcon('category.data.name')"></i></a></th>
                <th><a href="#" @click.prevent="sortBy('created_at')">Created <i :class="orderIcon('created_at')"></i></a></th>
                <th><a href="#" @click.prevent="sortBy('is_published')">Published <i :class="orderIcon('is_published')"></i></a></th>
                <th class="text-centered"><a>Showing</a></th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="post in posts
                    | filterBy titleFilter in 'title'
                    | filterBy categoryFilter in 'category.data.name'
                    | orderBy sortKey sortDir"
                class="Post" :class="{ 'Post--unpublished': !post.is_published }">

                <td>
                    <a href="#!/posts/{{ post.id }}" @click.prevent="goToPost(post)">{{ post.title }}</a>
                    <span v-if="post.is_locked" data-toggle="tooltip" data-placement="top"
                          title="Locked by {{ userName(post.locked_by_id) }}"><i class="fa fa-lock"></i></span>
                </td>

                <td>{{ post.category.data.name }}</td>

                <td>{{ formatTimestamp(post.created_at) }}</td>

                <td class="published">
                    <div class="switch">
                        <input class="cmn-toggle cmn-toggle-round-sm"
                               id="is_published_{{post.id}}"
                               type="checkbox"
                               name="is_published"
                               v-model="post.is_published"
                               @change="publish(post, $event)">
                        <label for="is_published_{{post.id}}"></label>
                    </div>
                </td>

                <td class="text-centered">
                    <span v-if="isShowing(post)" class="showing"><i class="fa fa-check"></i></span>
                    <span v-if="!isShowing(post)" class="not-showing"><i class="fa fa-times"></i></span>
                </td>

            </tr>
        </tbody>
    </table>

    <paginator :pagination="pagination"></paginator>

</template>

<script>
    var moment = require('moment');

    export default {

        props: ['current-user'],

        data: function () {
            return {
                posts: [],
                pagination: { links: {} },
                categories: [],
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
                    path: '/posts?include=category&orderBy=updated_at|desc'
                }).then(function (response) {
                    self.posts = response.entity.data;
                    self.pagination = response.entity.meta.pagination;
                    self.initTooltips();
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
                    // successHandler(response.entity.data);
                }, function (response) {
                    if (response.status.code == 401 || response.status.code == 500) {
                        self.$dispatch('userHasLoggedOut')
                    }
                });
            },

            publish: function (post) {
                client({
                    method: 'PUT',
                    path: '/posts/' + post.id + '/publish',
                    entity: {
                        is_published: post.is_published,
                        user_id: this.currentUser.id
                    }
                });
            },

            isShowing: function (post) {
                if (! post.is_published) {
                    return false;
                }

                var start = !!post.publish_start ? moment(post.publish_start, "YYYY-MM-DD HH:mm:ss") : moment("1980-01-01", "YYYY-MM-DD");
                var end   = !!post.publish_end   ? moment(post.publish_end, "YYYY-MM-DD HH:mm:ss")   : moment("2033-01-19", "YYYY-MM-DD");
                var now = moment();

                return (start <= now && now <= end);
            },

            goToPost: function (post) {
                if (this.checkLock(post)) {
                    this.$route.router.go({ path: '/posts/'+post.id });
                }
            },

            checkLock: function (post, e) {
                if (! post.is_locked) {
                    return true;
                }

                return confirm(
                    "The post is locked by "+this.userName(post.locked_by_id)+". " +
                    "Do you want to unlock it and proceed?" +
                    "\r\n\r\n" +
                    "If you proceed and they are still editing the post, you may overwrite each other's work."
                );
            },

            userName: function (userId) {
                if (! userId || ! this.users || !this.users.length) {
                    return '';
                }

                var user = this.users.filter(function (user) {
                    return user.id == userId;
                })[0];

                return user.name;
            },

            formatTimestamp: function (timestamp) {
                return moment.unix(timestamp).format('MMM D, YYYY');
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
                this.fetchCategories();
                this.fetch(function (data) {
                    transition.next({posts: data})
                });
            }
        }

    }
</script>