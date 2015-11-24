<template>
    <ol class="breadcrumb">
        <li><a href="#">Home</a></li>
        <li class="active">Posts</li>
    </ol>

    <div class="create-button">
        <button v-link="'/posts/create'" class="btn btn-success"><i class="fa fa-pencil"></i> Write New</button>
    </div>

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
                <th v-if="categoryFilter"><a href="#" @click.prevent="sortBy('order')">Order <i :class="orderIcon('order')"></i></a></th>
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

                <td v-if="categoryFilter" class="order">
                    <input class="post__order"
                           type="number"
                           value="{{ post.order }}"
                           @keyup.enter="blur"
                           @focusout="reorder(post, $event)"
                           number>
                </td>

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
    import moment from 'moment';
    import swal from 'sweetalert';

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
                sortKey: 'order',
                sortDir: 1
            }
        },

        methods: {

            fetch: function (successHandler) {
                var self = this;
                client({
                    path: '/posts?include=category&orderBy=updated_at|desc'
                }).then(function (response) {
                    self.pagination = response.entity.meta.pagination;
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
                    method: 'PATCH',
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
                if (! post.is_locked) {
                    this.$route.router.go({ path: '/posts/'+post.id });
                } else {
                    swal({
                        html: true,
                        title: "Are you sure?",
                        text: "The post is currently opened by <strong>"+this.userName(post.locked_by_id)+"</strong>. "+
                            "If you proceed and they are still editing the post, you may overwrite each other's work.",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Yes, unlock it!",
                        cancelButtonText: "Nevermind"
                    }, function () {
                        this.$route.router.go({ path: '/posts/'+post.id });
                    }.bind(this));
                }
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

            /**
             * Reorder the posts' list_positions
             * @param post
             * @param e
             */
            reorder: function(post, e) {
                var self = this;

                var new_position = parseInt(e.target.value);
                // If the position is not a number, we are done here.
                if (isNaN(new_position)) {
                    e.target.value = post.order;
                    return;
                }

                var affectedPosts = self.posts.filter(function (p) {
                    return p.category.data.id == post.category.data.id;
                });

                var max = affectedPosts.reduce(function(max, post) {
                    return (post.order > max) ? post.order : max;
                }, 0);

                new_position = (new_position > 0) ? new_position : 1;
                new_position = (new_position > max) ? max : new_position;

                // If the position is not different, we are done here.
                if (new_position === post.order) {
                    e.target.value = post.order;
                    return;
                }

                // Shift all the posts' between the new list position and old list position up or down by one.
                // If we are moving the list position to a lower number, the other numbers should shift up by one,
                // but if we are moving the list position to a higher number the others should shift down by one.
                var increment = (new_position < post.order) ? +1 : -1;
                var between = (new_position < post.order) ? [new_position, post.order] : [post.order, new_position];

                this.posts = affectedPosts.map(function (post) {
                    var p = post.order;
                    if (p >= between[0] && p <= between[1]) {
                        post.order += increment;
                    }
                    return post;
                });

                // Save the new position on the current post.
                post.order = new_position;

                // Persist the new order
                this.saveOrder(post);

                this.sortKey = 'order';

                setTimeout(function() {
                    this.scrollTo($(e.target).closest('tr'));
                }.bind(this), 0);
            },

            /**
             * Save the post's position to the database.
             * @param post
             */
            saveOrder: function (post) {
                client({
                    method: "PATCH",
                    path: '/posts/' + post.id + '/reorder',
                    entity: { order: post.order }
                });
            },

            scrollTo: function(target) {
                $('html,body').animate({
                    scrollTop: target.offset().top - 280
                }, 700);

                target.addClass("pulse").delay(4000).queue(function () {
                    $(this).removeClass("pulse").dequeue();
                });

                return false;
            },

            blur: function(e) {
                e.target.blur();
            }

        },

        computed: {

            currentUserName: function () {
                return this.currentUser ? this.currentUser.name : '';
            }

        },

        route: {
            data: function (transition) {
                var self = this;
                this.fetchUsers();
                this.fetchCategories();
                this.fetch(function (data) {
                    transition.next({posts: data});
                    self.initTooltips();
                });
            }
        }

    }
</script>