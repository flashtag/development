<template>
    <ol class="breadcrumb">
        <li><a href="/admin">Home</a></li>
        <li class="active">Pages</li>
    </ol>

    <div class="create-button">
        <a href="/admin/pages/create" class="btn btn-success"><i class="fa fa-pencil"></i> Write New</a>
    </div>

    <div class="filters">
        <div class="row">
            <div class="col-md-6">
                <input type="text" v-model="titleFilter" @keyup="changeFilter" placeholder="Filter by title..." class="form-control">
            </div>
        </div>
    </div>

    <table class="Pages table table-striped table-hover">
        <thead>
            <tr>
                <th><a href="#" @click.prevent="sortBy('title')">Title <i :class="orderIcon('title')"></i></a></th>
                <th><a href="#" @click.prevent="sortBy('slug')">Url slug <i :class="orderIcon('slug')"></i></a></th>
                <th><a href="#" @click.prevent="sortBy('template')">Template <i :class="orderIcon('template')"></i></a></th>
                <th><a href="#" @click.prevent="sortBy('created_at')">Created <i :class="orderIcon('created_at')"></i></a></th>
                <th><a href="#" @click.prevent="sortBy('is_published')">Published <i :class="orderIcon('is_published')"></i></a></th>
                <th class="text-centered"><a>Showing</a></th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="page in pages | filterBy titleFilter in 'title' | orderBy sortKey sortDir"
                class="Page" :class="{ 'Page--unpublished': !page.is_published }">

                <td>
                    <a href="/admin/pages/{{ page.id }}" @click.prevent="goToPage(page)">{{ page.title }}</a>
                    <span v-if="page.is_locked" data-toggle="tooltip" data-placement="top"
                          title="Locked by {{ userName(page.locked_by_id) }}"><i class="fa fa-lock"></i></span>
                </td>

                <td>/{{ page.slug }}</td>

                <td>{{ page.template }}</td>

                <td>{{ formatTime(page.created_at) }}</td>

                <td class="published">
                    <div class="switch">
                        <input class="cmn-toggle cmn-toggle-round-sm"
                               id="is_published_{{page.id}}"
                               type="checkbox"
                               name="is_published"
                               v-model="page.is_published"
                               @change="page.publish(page.is_published)">
                        <label for="is_published_{{page.id}}"></label>
                    </div>
                </td>

                <td class="text-centered">
                    <span v-if="page.is_showing" class="showing"><i class="fa fa-check"></i></span>
                    <span v-else class="not-showing"><i class="fa fa-times"></i></span>
                </td>

            </tr>
        </tbody>
    </table>

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
                sortKey: 'order',
                sortDir: 1
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

            changeFilter: function () {
                this.initTooltips();
            }

        }

    }
</script>