<template>
    <ol class="breadcrumb">
        <li><a href="#">Home</a></li>
        <li class="active">Post Fields</li>
    </ol>

    <div class="filters">
        <div class="row">
            <div class="col-md-6">
                <input type="text" v-model="labelFilter" placeholder="Filter by label..." class="form-control">
            </div>
            <div class="create-button col-md-6">
                <button v-link="'/post-fields/create'" class="btn btn-success"><i class="fa fa-plus"></i> Add new</button>
            </div>
        </div>
    </div>

    <table class="Fields table table-striped table-hover">
        <thead>
            <tr>
                <th><a href="#" @click.prevent="sortBy('label')">Label <i :class="orderIcon('label')"></i></a></th>
                <th><a href="#" @click.prevent="sortBy('name')">Name <i :class="orderIcon('name')"></i></a></th>
                <th><a href="#" @click.prevent="sortBy('template')">Template <i :class="orderIcon('template')"></i></a></th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="field in fields | filterBy labelFilter in 'label' | orderBy sortKey sortDir"
                class="Field" :class="{ 'Field--unpublished': !field.is_published }">
                <td><a v-link="'/post-fields/'+field.id">{{ field.label }}</a></td>
                <td>{{ field.name }}</td>
                <td>{{ field.template }}</td>
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
                fields: [],
                pagination: { links: {} },
                labelFilter: null,
                sortKey: null,
                sortDir: -1
            }
        },

        methods: {

            fetch: function (successHandler) {
                var self = this;
                client({
                    path: '/fields'
                }).then(function (response) {
                    self.fields = response.entity.data;
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
                    transition.next({fields: data})
                });
            }
        }

    }
</script>