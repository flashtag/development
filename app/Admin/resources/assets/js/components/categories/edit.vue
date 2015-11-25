<template>
    <ol class="breadcrumb">
        <li><a href="#">Home</a></li>
        <li><a v-link="'/categories'">Categories</a></li>
        <li class="active">{{ category.name }}</li>
    </ol>

    <div v-if="$loadingRouteData" class="content-loading"><i class="fa fa-spinner fa-spin"></i></div>
    <div v-if="!$loadingRouteData">

        <form class="Category EditForm">

            <section class="info row">
                <div class="col-md-6">
                    <!--<a v-link="'/categories/'+category.id+'/posts'" class="btn btn-link"><i class="fa fa-reorder"></i> Re-order Posts</a>-->
                </div>
                <div class="col-md-6 clearfix">
                    <div class="action-buttons">
                        <button @click.prevent="save" class="btn btn-primary"><i class="fa fa-save"></i> Save</button>
                        <button @click.prevent="delete" class="btn btn-danger"><i class="fa fa-trash"></i> Delete</button>
                        <button v-link="'/categories'" class="btn btn-default"><i class="fa fa-close"></i> Close</button>
                    </div>
                </div>
            </section>

            <div class="panel panel-default">
                <div class="panel-heading">Category</div>
                <div class="panel-body">
                    <div class="form-group">
                        <label for="name">Name</label>
                        <input type="text" v-model="category.name" name="name" id="name" class="form-control">
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="category">Parent category</label>
                                <select v-model="category.parent_id" name="category" id="category" class="form-control">
                                    <option :value="null" selected>None</option>
                                    <option v-if="allCategories" v-for="category in allCategories" :value="category.id">{{ category.name }}</option>
                                </select>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group form-tags">
                                <label for="tags">Tags</label>
                                <select v-if="category.tags" v-model="category.tags" name="tags" id="tags" multiple class="form-control"
                                        v-select="category.tags">
                                    <option v-for="tag in allTags" :value="tag.id">{{ tag.name }}</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="description">Description</label>
                        <textarea v-if="category.description" v-rich-editor="category.description" name="description" id="description" class="form-control"></textarea>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="order_by">Order posts in category by</label>
                                <select v-model="category.order_by" name="order_by" id="order_by" class="form-control">
                                    <option v-for="option in orderOptions" value="{{ option.id }}">{{ option.text }}</option>
                                </select>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="order_dir">Order posts in category direction</label>
                                <select v-model="category.order_dir" name="order_dir" id="order_dir" class="form-control">
                                    <option v-for="direction in orderDirections" value="{{ direction.id }}">{{ direction.text }}</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>

        <category-posts v-if="showCategoryPosts" :category-id="$route.params.category_id" :posts="category.posts.data"></category-posts>
    </div>
</template>

<script>
    import swal from 'sweetalert';

    export default {

        props: ['current-user'],

        components: {
            'category-posts': require('./category-posts.vue')
        },

        data: function() {
            return {
                category: {
                    id: '',
                    name: '',
                    description: '',
                    order_by: 'order',
                    order_dir: 'asc'
                },
                allTags: [],
                allCategories: [],
                orderOptions: [
                    { id: 'order', text: 'Order (manual)' },
                    { id: 'created_at', text: 'Created' },
                    { id: 'updated_at', text: 'Updated' }
                ],
                orderDirections: [
                    { id: 'asc', text: 'Ascending' },
                    { id: 'desc', text: 'Descending' }
                ]
            }
        },

        computed: {

            showCategoryPosts: function () {
                return this.category.order_by == 'order';
            }

        },

        methods: {

            fetch: function () {
                var self = this;
                return client({
                    path: '/categories/'+ this.$route.params.category_id + '?include=posts,tags'
                }).then(function (response) {
                    self.category = response.entity.data;
                    self.category.tags = self.category.tags.data.reduce(function (ids, tag) {
                        ids.push(tag.id);
                        return ids;
                    }, []);
                }, function (response) {
                    self.checkResponseStatus(response);
                });
            },

            fetchCategories: function () {
                var self = this;
                return client({
                    path: '/categories'
                }).then(function (response) {
                    self.allCategories = response.entity.data;
                }, function (response) {
                    self.checkResponseStatus(response);
                });
            },

            fetchTags: function () {
                var self = this;
                return client({
                    path: '/tags'
                }).then(function (response) {
                    self.allTags = response.entity.data.map(function (tag) {
                        tag.text = tag.name;
                        return tag;
                    });
                }, function (response) {
                    self.checkResponseStatus(response);
                });
            },

            /**
             * Save the post.
             */
            save: function() {
                var self = this;
                return client({
                    method: 'PUT',
                    path: '/categories/'+this.category.id,
                    entity: this.category
                }).then(function (response) {
                    self.notify('success', 'Saved successfully.');
                }, function (response) {
                    self.checkResponseStatus(response);
                });
            },

            delete: function() {
                var self = this;
                swal({
                    title: 'Are you sure?',
                    text: 'You will not be able to recover this category!',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#DD6B55',
                    confirmButtonText: 'Yes, delete it!',
                    closeOnConfirm: false,
                    showLoaderOnConfirm: true
                }, function () {
                    client({
                        method: 'DELETE',
                        path: '/categories/' + self.category.id
                    }).then(function () {
                        swal({
                            html: true,
                            title: 'Deleted!',
                            text: '<strong>' + self.category.name + '</strong> was deleted!',
                            type: 'success'
                        }, function () {
                            self.$route.router.go('/categories');
                        });
                    }, function () {
                        swal("Oops", "We couldn't connect to the server!", "error");
                    });
                });
            },

            notify: function (type, message) {
                if (type == 'success') {
                    var icon = "fa fa-thumbs-o-up";
                } else if (type == 'warning') {
                    var icon = "fa fa-warning";
                }
                $.notify({
                    icon: icon,
                    message: message
                }, {
                    type: type,
                    delay: 3000,
                    offset: { x: 20, y: 70 }
                });
            },

            checkResponseStatus: function (response) {
                if (response.status.code == 401 || response.status.code == 500) {
                    this.$dispatch('userHasLoggedOut')
                }
            }

        },

        route: {
            data: function (transition) {
                this.fetch()
                    .then(this.fetchCategories)
                    .then(this.fetchTags)
                    .then(transition.next);
            }
        }

    }
</script>