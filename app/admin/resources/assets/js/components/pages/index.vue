<template>

    <h2>Pages <span class="badge">{{ pages | filterBy titleFilter | count }}</span></h2>
    <div class="card-pf list-card">
        <div class="row toolbar-pf">
            <div class="col-sm-12">
                <div class="toolbar-pf-actions">
                    <div class="form-group toolbar-pf-filter">
                        <label class="sr-only" for="title-filter">Title</label>
                        <input type="text" id="title-filter" v-model="titleFilter" @keyup="changeFilter" placeholder="Filter by title..." class="form-control">
                    </div>
                    <div class="form-group">
                        <list-sort :sort-key.sync="sortKey" :sort-dir.sync="sortDir" :sort-keys="sortKeys"></list-sort>
                    </div>
                    <div class="form-group">
                        <a href="/admin/pages/create" class="btn btn-success">
                            <i class="fa fa-plus"></i> Add
                        </a>
                    </div>
                </div>
            </div>
        </div>

        <div class="row list-view-pf">
            <div class="list-group">
                <div v-for="page in pages | filterBy titleFilter in 'title' | orderBy sortKey sortDir" class="list-group-item"
                     :class="{ 'page-list--not-showing': !page.is_showing }">
                    <div class="list-view-pf-actions">
                        <div class="switch">
                            <input class="cmn-toggle cmn-toggle-round-sm"
                                   id="is_published_{{page.id}}"
                                   type="checkbox"
                                   name="is_published"
                                   v-model="page.is_published"
                                   @change="page.publish(page.is_published)">
                            <label for="is_published_{{page.id}}"></label>
                        </div>
                    </div>
                    <div class="list-view-pf-main-info">
                        <div class="list-view-pf-body">
                            <div class="list-view-pf-description">
                                <div class="list-group-item-text">
                                    <span class="page-list__title" style="font-size:15px;">
                                        <a href="/admin/pages/{{ page.id }}" @click.prevent="goToPage(page)">
                                            {{ page.title }}
                                        </a>
                                        <span v-if="page.is_locked" data-toggle="tooltip" data-placement="top"
                                              title="Locked by {{ userName(page.locked_by_id) }}"><i class="fa fa-lock"></i></span>
                                    </span>
                                </div>
                                <div class="list-group-item-heading" title="URL component" data-toggle="tooltip">
                                    <span style="font-weight: normal;">/{{ page.slug }}</span>
                                </div>
                            </div>
                            <div class="list-view-pf-additional-info">
                                <div v-if="page.is_showing" class="list-view-pf-additional-info-item" title="Showing" data-toggle="tooltip">
                                    <span class="pficon pficon-ok"></span>
                                </div>
                                <div v-else class="list-view-pf-additional-info-item" title="Not Showing" data-toggle="tooltip">
                                    <span class="fa fa-ban"></span>
                                </div>
                                <div class="list-view-pf-additional-info-item" title="Created at" data-toggle="tooltip">
                                    {{ formatTime(page.created_at) }}
                                </div>
                                <div class="list-view-pf-additional-info-item" title="Total Views" data-toggle="tooltip">
                                    {{ page.views || 0 }} Views
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
    import Page from '../../models/page';
    import Category from '../../models/category';
    import User from '../../models/user';

    export default {

        props: ['current-user'],

        data: function () {
            return {
                pages: [],
                categories: [],
                users: [],
                titleFilter: null,
                categoryFilter: null,
                sortKey: 'updated_at',
                sortKeys: [
                    { value: 'created_at', text: 'Created at' },
                    { value: 'updated_at', text: 'Updated at' },
                    { value: 'title', text: 'Title' },
                    { value: 'views', text: 'Views' },
                    { value: 'is_published', text: 'Published' }
                ],
                sortDir: -1
            }
        },

        created: function() {
            this.fetchPages();
            this.fetchCategories();
            this.fetchUsers();
        },

        ready: function () {
            this.$nextTick(function() {
                this.initTooltips();
            }.bind(this));
        },

        methods: {

            fetchPages: function() {
                this.$http.get('pages').then(function (response) {
                    this.$set('pages', response.data.map(function (page) {
                        return new Page(page);
                    }));
                }).then(initTooltips);
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

            goToPage: function (page) {
                if (! page.is_locked) {
                    window.location = '/admin/pages/'+page.id;
                } else {
                    swal({
                        html: true,
                        title: "Are you sure?",
                        text: "The page is currently opened by <strong>"+this.userName(page.locked_by_id)+"</strong>. "+
                            "If you proceed and they are still editing the page, you may overwrite each other's work.",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Yes, unlock it!",
                        cancelButtonText: "Nevermind"
                    }, function () {
                        window.location = '/admin/pages/'+page.id;
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

            initTooltips: function () {
                this.$nextTick(function() {
                    $('[data-toggle="tooltip"]').tooltip();
                });
            },

            changeFilter: function () {
                this.initTooltips();
            }

        }

    }
</script>