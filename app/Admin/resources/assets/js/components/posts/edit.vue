<template>
    <ol class="breadcrumb">
        <li><a href="#">Home</a></li>
        <li><a v-link="'/posts'">Posts</a></li>
        <li class="active">{{ post.title }}</li>
    </ol>

    <div v-if="$loadingRouteData" class="content-loading"><i class="fa fa-spinner fa-spin"></i></div>
    <div v-if="!$loadingRouteData">
        <form class="Post EditForm">

            <section class="info row">
                <div class="col-md-6 clearfix">
                    <a v-link="'/posts/'+$route.params.post_id+'/revisions'" class="btn btn-link">
                        <i class="fa fa-history"></i> Revision history
                    </a>
                </div>
                <div class="col-md-6 clearfix">
                    <div class="action-buttons">
                        <button @click.prevent="save" class="btn btn-primary"><i class="fa fa-save"></i> Save</button>
                        <button @click.prevent="delete" class="btn btn-danger"><i class="fa fa-trash"></i> Delete</button>
                        <button v-link="'/posts'" class="btn btn-default"><i class="fa fa-close"></i> Close</button>
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
                            :to="'/posts/'+$route.params.post_id+'/image'">
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
    </div>
</template>

<script>
    import moment from 'moment';
    import swal from 'sweetalert';

    export default {

        props: ['current-user'],

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

            fetch: function () {
                var self = this;
                return client({
                    path: '/posts/'+ this.$route.params.post_id +'?include=category,tags,fields,meta,author,media'
                }).then(function (response) {
                    self.post = response.entity.data;
                    self.post.category = self.post.category.data;
                    self.post.fields = self.post.fields.data;
                    self.post.meta = self.post.meta ? self.post.meta.data : {};
                    self.post.author = self.post.author ? self.post.author.data : {};
                    self.post.media = self.post.media ? self.post.media.data : {};
                    self.post.tags = self.post.tags.data.reduce(function (ids, tag) {
                        ids.push(tag.id);
                        return ids;
                    }, []);
                    if  (self.post.start_showing_at) {
                        self.post.start_showing_at = moment.utc(self.post.start_showing_at, 'X').format('YYYY-MM-DD');
                    }
                    if  (self.post.stop_showing_at) {
                        self.post.stop_showing_at = moment.utc(self.post.stop_showing_at, 'X').format('YYYY-MM-DD');
                    }
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

            fetchFields: function () {
                var self = this;
                return client({
                    path: '/fields'
                }).then(function (response) {
                    self.allFields = response.entity.data;
                }, function (response) {
                    self.checkResponseStatus(response);
                });
            },

            fetchAuthors: function () {
                var self = this;
                return client({
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
                this.post.fields = this.fieldValues;
                return client({
                    method: 'PUT',
                    path: '/posts/'+this.post.id,
                    entity: self.post
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
                    text: 'You will not be able to recover this post and all of its revision history!',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#DD6B55',
                    confirmButtonText: 'Yes, delete it!',
                    closeOnConfirm: false,
                    showLoaderOnConfirm: true
                }, function () {
                    client({
                        method: 'DELETE',
                        path: '/posts/' + self.post.id
                    }).then(function () {
                        swal({
                            html: true,
                            title: 'Deleted!',
                            text: '<strong>' + self.post.title + '</strong> was deleted!',
                            type: 'success'
                        }, function () {
                            self.deleted = true;
                            self.$route.router.go('/posts');
                        });
                    }, function () {
                        swal("Oops", "We couldn't connect to the server!", "error");
                    });
                });
            },

            lock: function() {
                if (! this.post.is_locked) {
                    var self = this;
                    return client({
                        method: 'PATCH',
                        path: '/posts/' + self.post.id + '/lock',
                        entity: {user_id: self.currentUser.id}
                    }).then(function (response) {
                        self.post.is_locked = true;
                        window.onbeforeunload = function (e) {
                            self.unlock();
                        };
                    }, function (response) {
                        self.checkResponseStatus(response);
                    });
                }
            },

            unlock: function (done) {
                if (this.post.is_locked && !this.deleted) {
                    var self = this;
                    return client({
                        method: 'PATCH',
                        path: '/posts/' + self.post.id + '/unlock',
                        entity: {user_id: self.currentUser.id}
                    }).then(function (response) {
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

            checkResponseStatus: function (response) {
                if (response.status.code == 401 || response.status.code == 500) {
                    this.$dispatch('userHasLoggedOut')
                }
            },

            initTooltips: function () {
                this.$nextTick(function() {
                    $('[data-toggle="tooltip"]').tooltip();
                });
            }

        },

        route: {
            data: function (transition) {
                this.fetch()
                    .then(this.fetchFields)
                    .then(this.fetchTags)
                    .then(this.fetchCategories)
                    .then(this.fetchAuthors)
                    .then(this.mapFieldValues)
                    .then(transition.next)
                    .then(this.initTooltips)
                    .then(this.lock);
            },

            deactivate: function (transition) {
                this.unlock(function () {
                    transition.next();
                });
            }
        }

    }
</script>