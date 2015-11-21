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
                <button v-link="'/tags/create'" class="btn btn-success"><i class="fa fa-plus"></i> Add new</button>
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
                <td><a v-link="'/tags/'+tag.id">{{ tag.name }}</a></td>
            </tr>
        </tbody>
    </table>

    <paginator :pagination="pagination"></paginator>

</template>

<script>
    export default {

        props: ['current-user'],

        data: function () {
            return {
                tags: [],
                pagination: { links: {} },
                nameFilter: null,
                sortKey: null,
                sortDir: -1
            }
        },

        methods: {

            fetch: function (successHandler) {
                var self = this;
                client({
                    path: '/tags'
                }).then(function (response) {
                    self.tags = response.entity.data;
                    self.pagination = response.entity.meta.pagination;
                    successHandler(response.entity.data);
                }, function (response) {
                    if (response.status.code == 401 || response.status.code == 500) {
                        self.$dispatch('userHasLoggedOut')
                    }
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
                this.fetch(function (data) {
                    transition.next({tags: data})
                });
            }
        }

    }
</script>