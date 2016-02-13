<template>
    <ol class="breadcrumb">
        <li><a href="#">Home</a></li>
        <li><a v-link="'/post-fields'">Post Fields</a></li>
        <li class="active">Create</li>
    </ol>

    <div v-if="$loadingRouteData" class="content-loading"><i class="fa fa-spinner fa-spin"></i></div>
    <div v-if="!$loadingRouteData">

        <form class="Category">

            <section class="info row">
                <div class="col-md-6 col-md-offset-6 clearfix">
                    <div class="action-buttons">
                        <button @click.prevent="save" class="btn btn-success"><i class="fa fa-save"></i> Save</button>
                        <button v-link="'/post-fields'" class="btn btn-default"><i class="fa fa-close"></i> Cancel</button>
                    </div>
                </div>
            </section>

            <div class="panel panel-default">
                <div class="panel-heading">POST FIELD</div>
                <div class="panel-body">
                    <div class="form-group">
                        <label for="label">Label</label>
                        <input type="text" v-model="field.label" label="label" id="label" class="form-control">
                    </div>
                    <div class="form-group">
                        <label for="name">Name</label>
                        <input type="text" v-model="field.name" name="name" id="name" class="form-control">
                    </div>
                    <div class="form-group">
                        <label for="description">Description</label>
                        <input type="text" v-model="field.description" name="description" id="description" class="form-control">
                    </div>
                    <div class="form-group">
                        <label for="template">Template</label>
                        <select v-model="field.template" name="template" id="template" class="form-control">
                            <option value="" disabled selected>Select a template...</option>
                            <option v-for="template in templates" value="{{ template.id }}">{{ template.text }}</option>
                        </select>
                    </div>
                </div>
            </div>
        </form>
    </div>
</template>

<script>
    export default {

        props: ['current-user'],

        data: function() {
            return {
                field: {
                    label: '',
                    name: '',
                    description: '',
                    template: ''
                },
                templates: [
                    { id: 'string', text: 'String' },
                    { id: 'rich_text', text: 'Rich Text' }
                ]
            }
        },

        methods: {

            /**
             * Save the post.
             */
            save: function() {
                var self = this;
                return client({
                    method: 'POST',
                    path: '/fields',
                    entity: this.field
                }).then(function (response) {
                    self.$route.router.go('/post-fields');
                }, function (response) {
                    if (response.status.code == 401 || response.status.code == 500) {
                        self.$dispatch('userHasLoggedOut')
                    }
                });
            }

        }

    }
</script>