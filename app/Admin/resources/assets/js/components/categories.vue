<template>

    <h2>Categories <span class="badge">{{ categories | filterBy nameFilter | count }}</span></h2>

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
                        <a class="btn btn-success" href="/admin/categories/create">
                            <i class="fa fa-plus"></i> Add New
                        </a>
                    </div>
                </div>
            </div>
        </div>

        <div class="row list-view-pf">
            <div class="list-group">
                <div v-for="category in categories | filterBy nameFilter | orderBy sortKey sortDir" class="list-group-item">
                    <div class="list-view-pf-actions">
                        <button class="btn btn-default" @click.prevent="destroy(category)" title="Delete" data-toggle="tooltip">
                            <span class="fa fa-trash"></span>
                        </button>
                    </div>
                    <div class="list-view-pf-main-info">
                        <div class="list-view-pf-body">
                            <div class="list-view-pf-description">
                                <div class="list-group-item-heading">
                                    <a href="/admin/categories/{{ category.id }}">{{ category.name }}</a>
                                </div>
                                <div class="list-group-item-text" title="Parent Category" data-toggle="tooltip">
                                    <span v-if="hasParent(category)">Subcategory of <strong>{{ category.parent.name }}</strong></span>
                                </div>
                            </div>
                            <div class="list-view-pf-additional-info">
                                <div class="list-view-pf-additional-info-item" title="Tags" data-toggle="tooltip">
                                    <span class="fa fa-tags"></span>
                                    {{ getNames(category.tags).join(", ") }}
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
    import Category from '../models/category';

    export default {

        props: ['current-user'],

        data: function () {
            return {
                categories: [],
                nameFilter: null,
                sortKey: 'updated_at',
                sortDir: -1,
                sortKeys: [
                    { value: 'created_at', text: 'Created at' },
                    { value: 'updated_at', text: 'Updated at' },
                    { value: 'name', text: 'Name' },
                    { value: 'parent.name', text: 'Parent' }
                ]
            }
        },

        created: function(){
            this.fetchCategories();
        },

        methods: {

            fetchCategories: function () {
                this.$http.get('categories').then(function (response) {
                    this.$set('categories', response.data.map(function (category) {
                        return new Category(category);
                    }));
                }).then(initTooltips);
            },

            getNames: function (items) {
                return items.map(function (item) {
                    return item.name;
                });
            },

            hasParent: function(category) {
                return category.parent.name && category.parent.name.length > 0;
            },

            destroy: function (category) {
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
                    self.$http.delete('categories/'+category.id).then(function () {
                        self.categories = self.categories.filter(function (cat) {
                            return cat.id != category.id;
                        });
                        swal({
                            html: true,
                            title: 'Great success!',
                            text: '<strong>' + category.name + '</strong> was deleted!',
                            type: 'success'
                        });
                    });
                });
            }

        }

    }
</script>
