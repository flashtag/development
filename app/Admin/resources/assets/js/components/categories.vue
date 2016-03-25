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
                                    <span v-if="category.parent.length">Subcategory of <strong>{{ category.parent.name }}</strong></span>
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
                sortKey: null,
                sortDir: -1
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

            getNames: function (items) {
                return items.map(function (item) {
                    return item.name;
                });
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
