<template>

    <h2>Post Fields <span class="badge">{{ fields | filterBy labelFilter | count }}</span></h2>
    <div class="card-pf list-card">
        <div class="row toolbar-pf">
            <div class="col-sm-12">
                <div class="toolbar-pf-actions">
                    <div class="form-group toolbar-pf-filter">
                        <label class="sr-only" for="label-filter">Label</label>
                        <input type="text" id="label-filter" v-model="labelFilter" placeholder="Filter by label..." class="form-control">
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
                        <a class="btn btn-success" href="/admin/post-fields/create">
                            <i class="fa fa-plus"></i> Add New
                        </a>
                    </div>
                </div>
            </div>
        </div>

        <div class="row list-view-pf">
            <div class="list-group">
                <div v-for="field in fields | filterBy labelFilter in 'label' | orderBy sortKey sortDir" class="list-group-item">
                    <div class="list-view-pf-actions">
                        <button class="btn btn-default" @click.prevent="destroy(field)" title="Delete" data-toggle="tooltip">
                            <span class="fa fa-trash"></span>
                        </button>
                    </div>
                    <div class="list-view-pf-main-info">
                        <div class="list-view-pf-body">
                            <div class="list-view-pf-description">
                                <div class="list-group-item-heading">
                                    <a href="/admin/post-fields/{{ field.id }}">{{ field.label }}</a>
                                </div>
                                <div class="list-group-item-text" title="Name" data-toggle="tooltip">
                                    {{ field.name }}
                                </div>
                            </div>
                            <div class="list-view-pf-additional-info">
                                <div class="list-view-pf-additional-info-item" title="Type" data-toggle="tooltip">
                                    {{ field.template }}
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
    import Field from '../../models/field';

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

        created: function () {
            this.fetch();
        },

        methods: {

            fetch: function () {
                this.$http.get('post-fields').then(function (response) {
                    this.$set('fields', response.data.map(function (field) {
                        return new Field(field);
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

            destroy: function (field) {
                var self = this;
                swal({
                    title: 'Are you sure?',
                    text: 'You will not be able to recover this field!',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#DD6B55',
                    confirmButtonText: 'Yes, delete it!',
                    closeOnConfirm: false,
                    showLoaderOnConfirm: true
                }, function () {
                    self.$http.delete('post-fields/'+field.id).then(function () {
                        self.fields = self.fields.filter(function (cat) {
                            return cat.id != field.id;
                        });
                        swal({
                            html: true,
                            title: 'Great success!',
                            text: '<strong>' + field.name + '</strong> was deleted!',
                            type: 'success'
                        });
                    });
                });
            }

        }

    }
</script>
