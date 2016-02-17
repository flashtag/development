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
                <a href="/admin/post-fields/create" class="btn btn-success"><i class="fa fa-plus"></i> Add new</a>
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
                <td><a href="/admin/post-fields/{{ field.id }}">{{ field.label }}</a></td>
                <td>{{ field.name }}</td>
                <td>{{ field.template }}</td>
            </tr>
        </tbody>
    </table>

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
                this.$http.get('fields?orderBy=updated_at|desc').then(function (response) {
                    this.$set('fields', response.data.data.map(function (field) {
                        return new Field(field);
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