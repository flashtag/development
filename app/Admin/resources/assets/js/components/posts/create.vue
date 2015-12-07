<template>
    <ol class="breadcrumb">
        <li><a href="#">Home</a></li>
        <li><a v-link="'/posts'">Posts</a></li>
        <li class="active">Create</li>
    </ol>

    <div v-if="$loadingRouteData" class="content-loading"><i class="fa fa-spinner fa-spin"></i></div>
    <div v-if="!$loadingRouteData">

        <form class="Post">

            <section class="info row">
                <div class="col-md-6 col-md-offset-6 clearfix">
                    <div class="action-buttons">
                        <button @click.prevent="save" class="btn btn-primary"><i class="fa fa-save"></i> Save</button>
                        <button v-link="'/posts'" class="btn btn-default"><i class="fa fa-close"></i> Cancel</button>
                    </div>
                </div>
            </section>

            <div class="panel panel-default" :class="{ 'border-green': isShowing, 'border-red': !isShowing }">
                <div class="panel-heading">
                    PUBLISHING
                    <label class="showing label" :class="{ 'label-success': isShowing, 'label-danger': !isShowing }">
                        {{ isShowing ? 'Will show on website' : 'Will not show on website' }}
                    </label>
                </div>
                <div class="panel-body">
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
                            <label for="start_showing_at" data-toggle="tooltip" data-placement="top" title="If the post is published, it will not show until this date.">
                                Start showing
                            </label>
                            <input type="date" v-model="post.start_showing_at" name="start_showing_at" id="start_showing_at" class="form-control" placeholder="Date">
                        </div>
                        <div class="col-md-5">
                            <label for="stop_showing_at" data-toggle="tooltip" data-placement="top" title="If the post is published, it will not show after this date.">
                                Stop showing
                            </label>
                            <input type="date" v-model="post.stop_showing_at" name="stop_showing_at" id="stop_showing_at" class="form-control" placeholder="Date">
                        </div>
                    </div>
                </div>
            </div>

            <div class="panel panel-default" >
                <div class="panel-heading">POST</div>
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
                    <div class="form-group">
                        <label for="body">Body</label>
                        <textarea name="body" id="body" class="form-control rich-editor"
                                  v-if="post.body" v-rich-editor="post.body">
                        </textarea>
                    </div>
                    <div class="form-group">
                        <label for="author">Author</label>
                        <select v-select="post.author_id" id="author" name="author" :options="allAuthors">
                            <option value="" disabled selected>Select an author...</option>
                            <option v-for="author in allAuthors" value="{{ author.id }}">{{ author.name }}</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="show_author">Show author?</label>
                        <div class="switch">
                            <input id="show_author" class="cmn-toggle cmn-toggle-yes-no" type="checkbox" v-model="post.show_author">
                            <label for="show_author" data-on="Yes" data-off="No"></label>
                        </div>
                    </div>
                </div>
            </div>

            <div class="panel panel-default">
                <div class="panel-heading">CUSTOM FIELDS</div>
                <div class="panel-body">
                    <div class="form-group" v-for="field in allFields">
                        <component
                                :is="field.template"
                                :field.sync="field">
                        </component>
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
    </div>
</template>

<script>
    import moment from 'moment';

    export default {

        props: ['current-user'],

        components: {
            string: require('../post-fields/templates/string.vue'),
            rich_text: require('../post-fields/templates/rich_text.vue')
        },

        data: function() {
            return {
                post: {
                    body: ' ',
                    category: {},
                    tags: [],
                    fields: [],
                    revisions: [],
                    meta: {}
                },
                allCategories: [],
                allTags: [],
                allFields: [],
                allAuthors: []
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

            fetchAuthors: function () {
                var self = this;
                client({
                    path: '/authors'
                }).then(function (response) {
                    self.allAuthors = response.entity.data;
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
                    self.$route.router.go('/posts');
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
                this.fetchTags();
                this.fetchFields();
                this.fetchAuthors();
                this.fetchCategories(function (categories) {
                    transition.next({allCategories: categories});
                });
            }
        }

    }
</script>