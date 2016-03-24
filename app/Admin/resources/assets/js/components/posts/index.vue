<style>
    .fa.fa-lock, .fa.fa-ban {
        color: #888888;
    }
</style>

<template>

    <div class="row row-cards-pf">
        <!-- Important:  if you need to nest additional .row within a .row.row-cards-pf, do *not* use .row-cards-pf on the nested .row  -->
        <div class="col-md-12">
            <div class="card-pf">
                <div class="card-pf-heading">
                    <div class="create-button" style="float:right;">
                        <a href="/admin/posts/create" class="btn btn-success"><i class="fa fa-pencil"></i> Write New</a>
                    </div>
                    <h2 class="card-pf-title">Posts</h2>
                </div>
                <div class="card-pf-body">
                    <div class="filters" style="margin-bottom:15px;">
                        <div class="row">
                            <div class="col-md-6">
                                <input type="text" v-model="titleFilter" @keyup="changeFilter" placeholder="Filter by title..." class="form-control">
                            </div>
                            <div class="col-md-6">
                                <select v-model="categoryFilter" @change="changeFilter" id="category" class="form-control">
                                    <option :value="null" selected>Filter by category...</option>
                                    <option v-for="category in categories" :value="category.name">
                                        {{ category.name }}
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="list-group list-view-pf">
                        <div v-for="post in posts | filterBy titleFilter in 'title' | filterBy categoryFilter in 'category.name' | orderBy sortKey sortDir" class="list-group-item">
                            <!--
                            <div class="list-view-pf-checkbox">
                                <input type="checkbox">
                            </div>
                            -->
                            <div class="list-view-pf-actions">
                                <button class="btn btn-default" @click.prevent="destroy(post)" title="Delete" data-toggle="tooltip">
                                    <span class="fa fa-trash"></span>
                                </button>
                            </div>
                            <div class="list-view-pf-main-info">
                                <div class="list-view-pf-left">
                                    <div class="switch" title="Publish status" data-toggle="tooltip">
                                        <input class="cmn-toggle cmn-toggle-round-sm"
                                               id="is_published_{{post.id}}"
                                               type="checkbox"
                                               name="is_published"
                                               v-model="post.is_published"
                                               @change="post.publish(post.is_published)">
                                        <label for="is_published_{{post.id}}"></label>
                                    </div>
                                </div>
                                <div class="list-view-pf-body">
                                    <div class="list-view-pf-description">
                                        <div class="list-group-item-text">
                                            <span class="post-list__title" style="font-size:15px;">
                                                <a href="/admin/posts/{{ post.id }}" @click.prevent="goToPost(post)" title="Title" data-toggle="tooltip">
                                                    {{ post.title }}
                                                </a>
                                                <span v-if="post.is_locked" data-toggle="tooltip" data-placement="top"
                                                      title="Locked by {{ userName(post.locked_by_id) }}"><i class="fa fa-lock"></i></span>
                                            </span>
                                        </div>
                                        <div class="list-group-item-heading" title="Category" data-toggle="tooltip">
                                            <span style="font-weight: normal;">{{ post.category.name }}</span>
                                        </div>
                                    </div>
                                    <div class="list-view-pf-additional-info">
                                        <div v-if="post.is_published" class="list-view-pf-additional-info-item" title="Showing" data-toggle="tooltip">
                                            <span class="pficon pficon-ok"></span>
                                        </div>
                                        <div v-else class="list-view-pf-additional-info-item" title="Not Showing" data-toggle="tooltip">
                                            <span class="fa fa-ban"></span>
                                        </div>
                                        <div class="list-view-pf-additional-info-item" title="Created at" data-toggle="tooltip">
                                            {{ formatTime(post.created_at) }}
                                        </div>
                                        <div class="list-view-pf-additional-info-item" title="Total Views" data-toggle="tooltip">
                                            {{ post.views }} Views
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

</template>

<script>
    import Post from '../../models/post';
    import Category from '../../models/category';
    import User from '../../models/user';

    export default {

        props: ['current-user'],

        data: function () {
            return {
                posts: [],
                categories: [],
                users: [],
                titleFilter: null,
                categoryFilter: null,
                sortKey: 'order',
                sortDir: 1
            }
        },

        created: function() {
            this.fetchPosts();
            this.fetchCategories();
            this.fetchUsers();
        },

        methods: {

            fetchPosts: function() {
                this.$http.get('posts').then(function (response) {
                    this.$set('posts', response.data.map(function (post) {
                        return new Post(post);
                    }));
                }).then(function() {
                    this.initTooltips();
                });
            },

            fetchCategories: function () {
                this.$http.get('categories').then(function (response) {
                    this.$set('categories', response.data.map(function (category) {
                        return new Category(category);
                    }));
                });
            },

            fetchUsers: function () {
                this.$http.get('users').then(function (response) {
                    this.$set('users', response.data.map(function (user) {
                        return new User(user);
                    }));
                });
            },

            getClass: function (post) {
                return post.is_published
                    ? "fa fa-eye fa list-view-pf-icon-md list-view-pf-icon-success"
                    : "fa fa-eye-slash fa list-view-pf-icon-md list-view-pf-icon-default";
            },

            goToPost: function (post) {
                if (! post.is_locked) {
                    window.location = '/admin/posts/'+post.id;
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
                        window.location = '/admin/posts/'+post.id;
                    }.bind(this));
                }
            },

            userName: function (userId) {
                if (!userId || !this.users || !this.users.length) {
                    return '';
                }

                var user = this.users.filter(function (user) {
                    return user.id == userId;
                })[0];

                return user.name;
            },

            formatTime: function (time) {
                return moment(time, "YYYY-MM-DD").format('MMM D, YYYY');
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

            destroy: function (post) {
                var self = this;
                swal({
                    title: 'Are you sure?',
                    text: 'You will not be able to recover this post and all of its revision history!',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#DD6B55',
                    confirmButtonText: 'Yes, delete it!',
                    closeOnConfirm: false,
                    showLoaderOnConfirm: true
                }, function () {
                    self.$http.delete('posts/'+post.id).then(function (response) {
                        self.posts = self.posts.filter(function (p) {
                            return p.id != post.id;
                        });
                        swal({
                            html: true,
                            title: 'Great success!',
                            text: '<strong>' + post.title + '</strong> was deleted!',
                            type: 'success'
                        });
                    });
                });
            },

            initTooltips: function () {
                setTimeout(function() {
                    $('[data-toggle="tooltip"]').tooltip();
                }, 0);
            },

            changeFilter: function () {
                this.initTooltips();
            }

        }

    }
</script>
