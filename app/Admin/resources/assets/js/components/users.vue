<template>
    <ol class="breadcrumb">
        <li><a href="#">Home</a></li>
        <li class="active">Users</li>
    </ol>

    <div class="filters">
        <div class="row">
            <div class="col-md-6">
                <input type="text" v-model="nameFilter" placeholder="Filter by name..." class="form-control">
            </div>
            <div class="create-button col-md-6" style="text-align:right;">
                <a href="/admin/users/create" class="btn btn-success"><i class="fa fa-plus"></i> Add new</a>
            </div>
        </div>
    </div>

    <table class="Users table table-striped table-hover">
        <thead>
            <tr>
                <th><a href="#" @click.prevent="sortBy('name')">Name <i :class="orderIcon('name')"></i></a></th>
                <th><a href="#" @click.prevent="sortBy('email')">Email <i :class="orderIcon('email')"></i></a></th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="user in users | filterBy nameFilter | orderBy sortKey sortDir"
                class="User">
                <td>
                    <a href="/admin/users/{{ user.id }}">{{ user.name }}</a>
                </td>
                <td>{{ user.email }}</td>
            </tr>
        </tbody>
    </table>
</template>

<script>
    import User from '../models/user';

    export default {

        props: ['current-user'],

        data: function () {
            return {
                users: [],
                pagination: { links: {} },
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
                this.$http.get('users?orderBy=updated_at|desc').then(function (response) {
                    this.$set('users', response.data.data.map(function (user) {
                        return new User(user);
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