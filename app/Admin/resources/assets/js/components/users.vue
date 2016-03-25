<template>

    <h2>Users <span class="badge">{{ users | filterBy nameFilter | count }}</span></h2>

    <div class="card-pf list-card">
        <div class="row toolbar-pf">
            <div class="col-sm-12">
                <div class="toolbar-pf-actions">
                    <div class="form-group toolbar-pf-filter">
                        <label class="sr-only" for="name-filter">Name</label>
                        <input type="text" id="name-filter" v-model="nameFilter" placeholder="Filter by name..." class="form-control">
                    </div>
                    <div class="form-group">
                        <list-sort :sort-key.sync="sortKey" :sort-dir.sync="sortDir" :sort-keys="sortKeys"></list-sort>
                    </div>
                    <div class="form-group">
                        <a class="btn btn-success" href="/admin/users/create">
                            <i class="fa fa-plus"></i> Add New
                        </a>
                    </div>
                </div>
            </div>
        </div>

        <div class="row list-view-pf">
            <div class="list-group">
                <div v-for="user in users | filterBy nameFilter | orderBy sortKey sortDir" class="list-group-item">
                    <div class="list-view-pf-actions">
                        <button class="btn btn-default" @click.prevent="destroy(user)" title="Delete" data-toggle="tooltip">
                            <span class="fa fa-trash"></span>
                        </button>
                    </div>
                    <div class="list-view-pf-main-info">
                        <div class="list-view-pf-body">
                            <div class="list-view-pf-description">
                                <div class="list-group-item-heading">
                                    <a href="/admin/users/{{ user.id }}">{{ user.name }}</a>
                                </div>
                                <div class="list-group-item-text" title="Email" data-toggle="tooltip">
                                    {{ user.email }}
                                </div>
                            </div>
                            <div class="list-view-pf-additional-info">
                                <div class="list-view-pf-additional-info-item" title="Role" data-toggle="tooltip">
                                    <span v-if="user.admin">Admin</span>
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
    import User from '../models/user';

    export default {

        props: ['current-user'],

        data: function () {
            return {
                users: [],
                pagination: { links: {} },
                nameFilter: null,
                sortKey: 'updated_at',
                sortDir: -1,
                sortKeys: [
                    { value: 'created_at', text: 'Created at' },
                    { value: 'updated_at', text: 'Updated at' },
                    { value: 'name', text: 'Name' },
                    { value: 'email', text: 'Email' },
                    { value: 'admin', text: 'Admin' }
                ]
            }
        },

        created: function () {
            this.fetch();
        },

        methods: {

            fetch: function () {
                this.$http.get('users').then(function (response) {
                    this.$set('users', response.data.map(function (user) {
                        return new User(user);
                    }));
                }).then(initTooltips);
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

            destroy: function (user) {
                var self = this;
                swal({
                    title: 'Are you sure?',
                    text: 'You will not be able to recover this user!',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#DD6B55',
                    confirmButtonText: 'Yes, delete it!',
                    closeOnConfirm: false,
                    showLoaderOnConfirm: true
                }, function () {
                    self.$http.delete('users/'+user.id).then(function () {
                        self.users = self.users.filter(function (cat) {
                            return cat.id != user.id;
                        });
                        swal({
                            html: true,
                            title: 'Great success!',
                            text: '<strong>' + user.name + '</strong> was deleted!',
                            type: 'success'
                        });
                    });
                });
            }

        }

    }
</script>