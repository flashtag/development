<template>
    <ol class="breadcrumb">
        <li><a href="#">Home</a></li>
        <li><a v-link="'/posts'">Posts</a></li>
        <li class="active">Create</li>
    </ol>

    <form class="Post">

        <section class="info row" style="margin-bottom: 20px;">
            <div class="col-md-6 col-md-offset-6 clearfix">
                <div class="action-buttons">
                    <button v-link="'/posts'" @click="save" class="btn btn-primary"><i class="fa fa-save"></i> Save</button>
                    <button v-link="'/posts'" class="btn btn-default"><i class="fa fa-close"></i> Cancel</button>
                </div>
            </div>
        </section>

        <div class="panel panel-default" :class="{ 'border-green': isShowing, 'border-red': !isShowing }">
            <div class="panel-heading">
                POST
                <label class="showing label" :class="{ 'label-success': isShowing, 'label-danger': !isShowing }">
                    {{ isShowing ? 'Will show on website' : 'Will not show on website' }}
                </label>
            </div>
            <div class="panel-body">
                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="title">Title</label>
                            <input type="text" v-model="post.title" name="title" id="title" class="form-control">
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="subtitle">Subtitle</label>
                            <input type="text" v-model="post.subtitle" name="subtitle" id="subtitle" class="form-control">
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="category">Category</label>
                            <select v-model="post.category.id" name="category" id="category" class="form-control">
                                <option value="" disabled selected>Select a category...</option>
                                <option v-for="category in allCategories" :value="category.id">{{ category.name }}</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-group form-tags">
                            <label for="tags">Tags</label>
                            <select v-model="post.tags" name="tags" id="tags" multiple class="form-control"
                                    v-select="post.tags">
                                <option v-for="tag in allTags" :value="tag.id">{{ tag.name }}</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6">
                        <div class="row">
                            <div class="col-md-2">
                                <div class="form-group switch-wrapper">
                                    <div class="publish-switch">
                                        <label for="is_published">Published</label>
                                        <div class="switch">
                                            <input v-model="post.is_published" name="is_published" id="is_published" class="cmn-toggle cmn-toggle-round-md" type="checkbox">
                                            <label for="is_published"></label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-5">
                                <label for="start_showing_at">Start showing</label>
                                <input type="date" v-model="post.start_showing_at" name="start_showing_at" id="start_showing_at" class="form-control" placeholder="Date">
                            </div>
                            <div class="col-md-5">
                                <label for="stop_showing_at">Stop showing</label>
                                <input type="date" v-model="post.stop_showing_at" name="stop_showing_at" id="stop_showing_at" class="form-control" placeholder="Date">
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="order">Order in category</label>
                            <input type="number" v-model="post.order" name="order" id="order" class="form-control" number>
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label for="body">Body</label>
                    <textarea v-model="post.body" name="body" id="body" class="form-control rich-editor" rows="10"></textarea>
                </div>
            </div>
        </div>

        <div class="panel panel-default">
            <div class="panel-heading">CUSTOM FIELDS</div>
            <div class="panel-body">
                <div class="form-group" v-for="field in allFields">
                    <component :is="getTemplate(field)" :label="field.label" :name="field.name" :value="field.value"></component>
                </div>
            </div>
        </div>

        <div class="panel panel-default">
            <div class="panel-heading">META</div>
            <div class="panel-body">
                <div class="form-group">
                    <label for="description">Description</label>
                    <input type="text" v-model="post.meta.description" name="description" id="description" class="form-control">
                </div>
                <div class="form-group">
                    <label for="url">Canonical Link</label>
                    <input type="text" v-model="post.meta.url" name="url" id="url" class="form-control">
                </div>
            </div>
        </div>

    </form>
</template>

<script>
    var moment = require ('moment');

    export default {

        props: ['current-user'],

        components: {
            string: require('../post-fields/templates/string.vue'),
            rich_text: require('../post-fields/templates/rich_text.vue')
        },

        data: function() {
            return {
                post: {
                    category: {},
                    tags: [],
                    fields: [],
                    revisions: [],
                    meta: {}
                },
                allCategories: [],
                allTags: [],
                allFields: []
            }
        },

        computed: {

            isShowing: function () {
                if (!this.post.is_published) {
                    return false;
                }
                var start = this.post.start_showing_at ? moment(this.post.start_showing_at) : moment("1980-01-01", "YYYY-MM-DD");
                var end = this.post.stop_showing_at ? moment(this.post.stop_showing_at) : moment("2033-01-19", "YYYY-MM-DD");
                var now = moment();

                return (start <= now && now <= end);
            }

        },

        methods: {

            fetchCategories: function (successHandler) {
                var self = this;
                client({
                    path: '/categories'
                }).then(function (response) {
                    self.allCategories = response.entity.data;
                    successHandler(self.allCategories);
                }, function (response) {
                    self.checkResponseStatus(response);
                });
            },

            fetchTags: function () {
                var self = this;
                client({
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

            fetchFields: function () {
                var self = this;
                client({
                    path: '/fields'
                }).then(function (response) {
                    self.allFields = response.entity.data;
                }, function (response) {
                    self.checkResponseStatus(response);
                });
            },

            /**
             * Save the post.
             */
            save: function() {
                var self = this;
                client({
                    method: 'POST',
                    path: '/posts',
                    entity: self.post
                }).then(function (response) {
                    // success
                }, function (response) {
                    self.checkResponseStatus(response);
                });
            },

            getTemplate: function (field) {
                return field ? field.template : '';
            },

            checkResponseStatus: function (response) {
                if (response.status.code == 401 || response.status.code == 500) {
                    this.$dispatch('userHasLoggedOut')
                }
            }

        },

        route: {
            data: function (transition) {
//                CKEDITOR.replaceClass = 'rich-editor';
                this.fetchTags();
                this.fetchFields();
                this.fetchCategories(function (categories) {
                    transition.next({allCategories: categories});
                });
            }
        }

    }
</script>