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
                        <div class="dropdown btn-group">
                            <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Name <span class="caret"></span></button>
                            <ul class="dropdown-menu">
                                <li><a href="#">Action</a></li>
                                <li><a href="#">Another action</a></li>
                                <li><a href="#">Something else here</a></li>
                                <li role="separator" class="divider"></li>
                                <li><a href="#">Separated link</a></li>
                            </ul>
                        </div>
                        <button class="btn btn-link" type="button">
                            <span class="fa fa-sort-alpha-asc"></span>
                        </button>
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
                sortKey: null,
                sortDir: -1
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