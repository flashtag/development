<template>
    <ol class="breadcrumb">
        <li><a href="#">Home</a></li>
        <li class="active">Categories</li>
    </ol>

    <div class="filters">
        <div class="row">
            <div class="col-md-6">
                <input type="text" v-model="nameFilter" placeholder="Filter by name..." class="form-control">
            </div>
            <div class="create-button col-md-6">
                <button v-link="'/categories/create'" class="btn btn-success"><i class="fa fa-plus"></i> Add new</button>
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
            <tr v-for="category in categories.data | filterBy nameFilter | orderBy sortKey sortDir"
                class="Category">
                <td><a v-link="'/categories/'+category.id">{{ category.name }}</a></td>
                <td>{{ getParent(category) }}</td>
                <td><span v-for="tag in category.tags.data" class="tag label label-default">{{ tag.name }}</span></td>
            </tr>
        </tbody>
    </table>

    <paginator :pagination="pagination"></paginator>

</template>

<script>
    import categories from '../../repositories/categories';

    export default {

        props: ['current-user'],

        data: function () {
            return {
                categories: [],
                pagination: { links: {} },
                nameFilter: null,
                sortKey: null,
                sortDir: -1
            }
        },

        methods: {

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

            getParent: function (category) {
                if (category.parent) {
                    return category.parent.data.name;
                }

                return '';
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