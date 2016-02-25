<template>
    <ol class="breadcrumb">
        <li><a href="#">Home</a></li>
        <li class="active">Post Lists</li>
    </ol>

    <div class="filters">
        <div class="row">
            <div class="col-md-6">
                <input type="text" v-model="nameFilter" placeholder="Filter by name..." class="form-control">
            </div>
            <div class="create-button col-md-6">
                <a href="/admin/post-lists/create" class="btn btn-success"><i class="fa fa-plus"></i> Add new</a>
            </div>
        </div>
    </div>

    <table class="PostLists table table-striped table-hover">
        <thead>
            <tr>
                <th><a href="#" @click.prevent="sortBy('name')">Name <i :class="orderIcon('name')"></i></a></th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="postList in postLists | filterBy nameFilter | orderBy sortKey sortDir"
                class="PostList">
                <td><a href="/admin/post-lists/{{ postList.id }}">{{ postList.name }}</a></td>
            </tr>
        </tbody>
    </table>

</template>

<script>
    import PostList from '../../models/post-list';

    export default {

        props: ['current-user'],

        data: function () {
            return {
                "postLists": [],
                nameFilter: null,
                sortKey: null,
                sortDir: -1
            }
        },

        created: function () {
            this.fetch();
        },

        methods: {

            fetch: function () {
                this.$http.get('post-lists?orderBy=updated_at|desc').then(function (response) {
                    this.$set('postLists', response.data.data.map(function (postList) {
                        return new PostList(postList);
                    }));
                });
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
            }

        }

    }
</script>