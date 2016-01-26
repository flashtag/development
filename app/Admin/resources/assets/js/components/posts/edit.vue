<template>
    <ol class="breadcrumb">
        <li><a href="/">Home</a></li>
        <li><a href="/admin/posts">Posts</a></li>
        <li class="active">{{ post.title }}</li>
    </ol>

    <form class="Post EditForm">

        <section class="info row">
            <div class="col-md-6 clearfix">
                <a href="/admin/posts/{{ postId }}/revisions'" class="btn btn-link">
                    <i class="fa fa-history"></i> Revision history
                </a>
            </div>
            <div class="col-md-6 clearfix">
                <div class="action-buttons">
                    <button @click.prevent="save" class="btn btn-primary"><i class="fa fa-save"></i> Save</button>
                    <button @click.prevent="delete" class="btn btn-danger"><i class="fa fa-trash"></i> Delete</button>
                    <a href="/admin/posts" class="btn btn-default"><i class="fa fa-close"></i> Close</a>
                </div>
            </div>
        </section>

        <div class="panel panel-default" :class="{ 'border-green': post.is_showing, 'border-red': !post.is_showing }">
            <div class="panel-heading">
                PUBLISHING
                <label class="showing label" :class="{ 'label-success': post.is_showing, 'label-danger': !post.is_showing }">
                    {{ post.is_showing ? 'Will show on website' : 'Will not show on website' }}
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
                            <select name="category" id="category" class="form-control"
                                    v-select="post.category_id" v-model="post.category_id">
                                <option value="" disabled selected>Select a category...</option>
                                <option v-for="category in allCategories" :value="category.id">{{ category.name }}</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-group form-tags">
                            <label for="tags">Tags</label>
                            <select name="tags" id="tags" multiple class="form-control"
                                    v-select="post.tags" v-model="post.tags" :options="allTags">
                                <option v-for="tag in allTags" :value="tag.id">{{ tag.name }}</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label for="body">Body</label>
                    <textarea name="body" id="body" class="form-control rich-editor"
                              v-if="post.body" v-rich-editor="post.body" v-model="post.body">
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

        <div v-if="allFields && allFields.length > 0" class="panel panel-default">
            <div class="panel-heading">CUSTOM FIELDS</div>
            <div class="panel-body">
                <div  v-for="field in allFields" class="form-group">
                    <component v-if="fieldValues"
                               :is="field.template"
                               :field.sync="fieldValues[field.name]">
                    </component>
                </div>
            </div>
        </div>

        <div class="panel panel-default">
            <div class="panel-heading">Image</div>
            <div class="panel-body">
                <dropzone
                        path="/img/uploads/posts/"
                        :image="post.image"
                        :to="'/posts/'+postId+'/image'">
                </dropzone>
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
    import moment from 'moment';
    import swal from 'sweetalert';
    import Post from '../../models/post';
    import Category from '../../models/category';

    export default {

        props: ['post-id', 'current-user'],

        components: {
            string: require('../post-fields/templates/string.vue'),
            rich_text: require('../post-fields/templates/rich_text.vue'),
            dropzone: require('../partials/dropzone.vue')
        },

        data: function() {
            return {
                post: {
                    body: ' ',
                    category: {},
                    tags: [],
                    fields: [],
                    revisions: [],
                    meta: {},
                    media: { type: '' }
                },
                fieldValues: null,
                allCategories: [],
                allTags: [],
                allFields: [],
                allAuthors: [],
                deleted: false
            }
        },

        created: function() {
            this.fetch();
            this.fetchCategories();
            this.fetchTags();
            this.fetchFields();
            this.fetchAuthors();
        },

        ready: function() {
            this.$nextTick(function() {
                this.lock();
                this.initTooltips();
            }.bind(this));
        },

        methods: {

            fetch: function () {
                return this.$http.get('posts/'+ this.postId +'?include=category,tags,fields,meta,author,media')
                    .then(function (response) {
                        this.$set('post', new Post(response.data.data));
                    });
            },

            fetchCategories: function () {
                return this.$http.get('categories').then(function (response) {
                    this.$set('allCategories', response.data.data);
                });
            },

            fetchTags: function () {
                return this.$http.get('tags').then(function (response) {
                    this.$set('allTags', response.data.data.map(function (tag) {
                        tag.text = tag.name;
                        return tag;
                    }));
                });
            },

            fetchFields: function () {
                return this.$http.get('fields').then(function (response) {
                    this.$set('allFields', response.data.data);
                }).then(function(){
                    this.mapFieldValues();
                });
            },

            fetchAuthors: function () {
                return this.$http.get('authors').then(function (response) {
                    this.$set('allAuthors', response.data.data);
                });
            },

            /**
             * Save the post.
             */
            save: function() {
                var self = this;
                this.post.fields = this.fieldValues;
                return this.$http.put('posts/'+this.post.id, self.post).then(function (response) {
                    self.notify('success', 'Saved successfully.');
                });
            },

            delete: function() {
                var self = this;
                swal({
                    title: 'Are you sure?',
                    text: 'You will not be able to recover this post and all of its revision history!',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#DD6B55',
                    confirmButtonText: 'Yes, delete it!',
                    closeOnConfirm: false,
                    showLoaderOnConfirm: true
                }, function () {
                    self.$http.delete('posts/' + self.post.id).then(function () {
                        swal({
                            html: true,
                            title: 'Deleted!',
                            text: '<strong>' + self.post.title + '</strong> was deleted!',
                            type: 'success'
                        }, function () {
                            self.deleted = true;
                            window.location = '/admin/posts';
                        });
                    }, function () {
                        swal("Oops", "We couldn't connect to the server!", "error");
                    });
                });
            },

            lock: function() {
                if (! this.post.is_locked) {
                    var self = this;
                    return this.$http.patch('posts/' + self.postId + '/lock', {user_id: self.currentUser.id})
                        .then(function (response) {
                            self.post.is_locked = true;
                            window.onbeforeunload = function (e) {
                                self.unlock();
                            };
                        });
                }
            },

            unlock: function (done) {
                if (this.post.is_locked && !this.deleted) {
                    var self = this;
                    return this.$http.patch('posts/' + self.postId + '/unlock', {user_id: self.currentUser.id})
                        .then(function (response) {
                            self.post.is_locked = false;
                            done();
                        }, function (response) {
                            self.checkResponseStatus(response);
                        });
                } else {
                    done();
                }
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

            mapFieldValues: function () {
                var self = this;
                this.fieldValues = this.allFields.reduce(function (fields, field) {
                    fields[field.name] = {
                        id: field.id,
                        name: field.name,
                        label: field.label,
                        value: self.getFieldValue(field.name)
                    };
                    return fields;
                }, {});
            },

            getFieldValue: function (fieldName) {
                if (! fieldName.length > 0) {
                   return '';
                }
                var matchedField = this.post.fields.filter(function (field) {
                    return field.name == fieldName;
                })[0];

                return matchedField ? matchedField.value : '';
            },

            initTooltips: function () {
                this.$nextTick(function() {
                    $('[data-toggle="tooltip"]').tooltip();
                });
            }

        }

    }
</script>