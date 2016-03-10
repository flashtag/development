<template>
    <ol class="breadcrumb">
        <li><a href="#">Home</a></li>
        <li class="active">Tags</li>
    </ol>

    <div class="filters">
        <div class="row">
            <div class="col-md-6">
                <input type="text" v-model="nameFilter" placeholder="Filter by name..." class="form-control">
            </div>
            <div class="create-button col-md-6">
                <a href="/admin/tags/create" class="btn btn-success"><i class="fa fa-plus"></i> Add new</a>
            </div>
        </div>
    </div>

    <table class="Tags table table-striped table-hover">
        <thead>
            <tr>
                <th><a href="#" @click.prevent="sortBy('name')">Name <i :class="orderIcon('name')"></i></a></th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="tag in tags | filterBy nameFilter | orderBy sortKey sortDir"
                class="Tag">
                <td><a href="/admin/tags/{{ tag.id }}">{{ tag.name }}</a></td>
            </tr>
        </tbody>
    </table>

</template>

<script>
    import Tag from '../models/tag';

    export default {

        props: ['current-user'],

        data: function () {
            return {
                tags: [],
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
                this.$http.get('tags').then(function (response) {
                    this.$set('tags', response.data.map(function (tag) {
                        return new Tag(tag);
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