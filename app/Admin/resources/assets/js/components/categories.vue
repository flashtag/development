<template>
    <ol class="breadcrumb">
        <li><a href="/admin/">Home</a></li>
        <li class="active">Categories</li>
    </ol>

        <div class="filters">
            <div class="row">
                <div class="col-md-6">
                    <input type="text" v-model="nameFilter" placeholder="Filter by name..." class="form-control">
                </div>
                <div class="create-button col-md-6">
                    <a href="/admin/categories/create" class="btn btn-success"><i class="fa fa-plus"></i> Add new</a>
                </div>
            </div>
        </div>

        <table class="Categories table table-striped table-hover">
            <thead>
                <tr>
                    <th><a href="#" @click.prevent="sortBy('name')">Name <i :class="orderIcon('name')"></i></a></th>
                    <th><a>Parent</a></th>
                    <th><a>Tags</a></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="category in categories | filterBy nameFilter | orderBy sortKey sortDir"
                    class="Category">
                    <td><a href="/admin/categories/{{ category.id }}/edit">{{ category.name }}</a></td>
                    <td>{{ category.parent.name }}</td>
                    <td><span v-for="tag in category.tags" class="tag label label-default">{{ tag.name }}</span></td>
                </tr>
            </tbody>
        </table>
</template>

<script>
    import Category from '../models/category';

    export default {

        props: ['current-user'],

        data: function () {
            return {
                categories: [],
                nameFilter: null,
                sortKey: null,
                sortDir: -1
            }
        },

        created: function(){
            this.fetchCategories();
        },

        methods: {

            fetchCategories: function () {
                this.$http.get('categories?include=tags,parent&orderBy=updated_at|desc').then(function (response) {
                    this.$set('categories', response.data.data.map(function (category) {
                        return new Category(category);
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

        },

        route: {
            data: function (transition) {
                return {
                    categories: categories.with('tags').get()
                };
            }
        }

    }
</script>
