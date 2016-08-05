<template>

    <h2>Post Lists <span class="badge">{{ postLists | filterBy nameFilter | count }}</span></h2>
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
                        <a class="btn btn-success" href="/admin/post-lists/create">
                            <i class="fa fa-plus"></i> Add New
                        </a>
                    </div>
                </div>
            </div>
        </div>

        <div class="row list-view-pf">
            <div class="list-group">
                <div v-for="postList in postLists | filterBy nameFilter | orderBy sortKey sortDir" class="list-group-item">
                    <div class="list-view-pf-actions">
                        <button class="btn btn-default" @click.prevent="destroy(postList)" title="Delete" data-toggle="tooltip">
                            <span class="fa fa-trash"></span>
                        </button>
                    </div>
                    <div class="list-view-pf-main-info">
                        <div class="list-view-pf-body">
                            <div class="list-view-pf-description">
                                <div class="list-group-item-text">
                                    <a href="/admin/post-lists/{{ postList.id }}">{{ postList.name }}</a>
                                </div>
                                <div class="list-group-item-heading">
                                    &nbsp;
                                </div>
                            </div>
                            <div class="list-view-pf-additional-info">
                                <div class="list-view-pf-additional-info-item">
                                    &nbsp;
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
    import PostList from '../../models/post-list';

    export default {

        props: ['current-user'],

        data: function () {
            return {
                "postLists": [],
                nameFilter: null,
                sortKey: 'updated_at',
                sortDir: -1,
                sortKeys: [
                    { value: 'created_at', text: 'Created at' },
                    { value: 'updated_at', text: 'Updated at' },
                    { value: 'name', text: 'Name' }
                ]
            }
        },

        created: function () {
            this.fetch();
        },

        methods: {

            fetch: function () {
                this.$http.get('post-lists').then(function (response) {
                    this.$set('postLists', response.data.map(function (postList) {
                        return new PostList(postList);
                    }));
                }).then(initTooltips);
            },

            destroy: function (postList) {
                var self = this;
                swal({
                    title: 'Are you sure?',
                    text: 'You will not be able to recover this post list!',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#DD6B55',
                    confirmButtonText: 'Yes, delete it!',
                    closeOnConfirm: false,
                    showLoaderOnConfirm: true
                }, function () {
                    self.$http.delete('post-lists/'+postList.id).then(function () {
                        self.postLists = self.postLists.filter(function (cat) {
                            return cat.id != postList.id;
                        });
                        swal({
                            html: true,
                            title: 'Great success!',
                            text: '<strong>' + postList.name + '</strong> was deleted!',
                            type: 'success'
                        });
                    });
                });
            }

        }

    }
</script>
