<template>
    <ol class="breadcrumb">
        <li><a href="#">Home</a></li>
        <li><a href="/admin/posts">Posts</a></li>
        <li><a href="/admin/posts/{{ postId }}">{{ post.title }}</a></li>
        <li class="active">Revisions</li>
    </ol>

    <div class="filters">
        <div class="row">
            <div class="col-md-6">
                <select v-model="fieldFilter" id="field" class="form-control">
                    <option value="" selected>Filter by field...</option>
                    <option v-for="field in keys" :value="$key">
                        {{ field }}
                    </option>
                </select>
            </div>
        </div>
    </div>

    <div class="panel panel-default">
        <div class="panel-heading">Revision History</div>
        <div class="panel-body" v-if="!post.revisions.length > 0"><h6>No revisions</h6></div>
        <table v-else class="Revisions table table-hover">
            <tbody>
            <tr v-for="revision in post.revisions
                    | filterBy fieldFilter in 'key'
                    | orderBy 'created_at' -1"
                class="Revision">
                <td>{{{ what(revision) }}}</td>
                <td>at {{ when(revision.created_at) }}</td>
                <td>by <em>{{ who(revision.user_id) }}</em></td>
                <td class="action-button"><a v-if="shouldDiff(revision.key)"
                       href="/admin/posts/{{post.id}}/revisions/{{revision.id}}"
                       class="btn btn-primary btn-sm">View</a></td>
            </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
    export default {

        props: ['post-id'],

        data: function () {
            return {
                post: { revisions: { data: [] } },
                keys : {
                    title: 'Title',
                    subtitle: 'Subtitle',
                    body: 'Body',
                    category_id: 'Category',
                    author_id: 'Author',
                    show_author: 'Show author',
                    start_showing_at: 'Start showing',
                    stop_showing_at: 'Stop showing',
                    image: 'Image',
                    order: 'Order'
                },
                diffKeys: ['body'],
                pagination: { links: {} },
                users: [],
                categories: [],
                authors: [],
                fieldFilter: null
            }
        },

        created: function() {
            this.fetch();
            this.fetchUsers();
            this.fetchCategories();
            this.fetchAuthors();
        },

        methods: {

            fetch: function () {
                return this.$http.get('posts/'+this.postId+'/revisions').then(function (response) {
                    this.$set('post', response.data);
                });
            },

            fetchUsers: function (successHandler) {
                return this.$http.get('users').then(function (response) {
                    this.$set('users', response.data);
                });
            },

            fetchCategories: function () {
                return this.$http.get('categories').then(function (response) {
                    this.$set('categories', response.data);
                });
            },

            fetchAuthors: function () {
                return this.$http.get('authors').then(function (response) {
                    this.$set('authors', response.data);
                });
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
                return moment(timestamp, "YYYY-MM-DD").format('h:mm a on MMM D, YYYY');
            },

            shouldDiff: function (key) {
                return !!~this.diffKeys.indexOf(key);
            },

            what: function (revision) {
                var what = this.keys[revision.key];

                if (revision.key == 'is_published') {
                    return '<strong>'+(revision.new_value > 0 ? 'Published' : 'Unpublished')+'</strong>';
                }
                if (!!~this.diffKeys.indexOf(revision.key)) {
                    return '<strong>'+what+'</strong> was edited';
                }
                if (revision.key == 'category_id') {
                    return '<strong>'+what+'</strong> changed to <strong>' + this.categoryName(revision.new_value) + '</strong>';
                }
                if (revision.key == 'author_id') {
                    return '<strong>'+what+'</strong> changed to <strong>' + this.authorName(revision.new_value) + '</strong>';
                }
                if (revision.key == 'show_author') {
                    return '<strong>'+what+'</strong> changed to <strong>' + (revision.new_value > 0 ? 'Yes' : 'No') + '</strong>';
                }

                return '<strong>'+what+'</strong> changed to <strong>' + revision.new_value + '</strong>';
            },

            categoryName: function (id) {
                return this.categories.filter(function (category) {
                    return id == category.id;
                })[0].name;
            },

            authorName: function (id) {
                return this.authors.filter(function (author) {
                    return id == author.id;
                })[0].name;
            }

        },

        computed: {

            currentUserName: function () {
                return this.currentUser ? this.currentUser.name : '';
            }

        }

    }
</script>