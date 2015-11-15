<template>
    <ol class="breadcrumb">
        <li><a href="#">Home</a></li>
        <li><a v-link="'/posts'">Posts</a></li>
        <li class="active">{{ post.title }}</li>
    </ol>

    <form class="Post">

        <section class="info row" style="margin-bottom: 20px;">
            <div class="col-md-6 clearfix">
                <a href="/admin/posts/{{ $route.params.post_id }}/history" @click.prevent>
                    <i class="fa fa-history"></i> Revision history
                </a>
            </div>
            <div class="col-md-6 clearfix">
                <div class="action-buttons">
                    <button class="btn btn-primary" @click="save"><i class="fa fa-save"></i> Save</button>
                    <button class="btn btn-danger"  @click="delete"><i class="fa fa-trash"></i> Delete</button>
                    <button v-link="'/posts'" class="btn btn-default"><i class="fa fa-close"></i> Close</button>
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
                            <select v-model="post.tags" name="tags" id="tags" multiple="multiple" class="form-control">
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
                    <textarea v-model="post.body" name="body" id="body" class="form-control wysiwyg" rows="10">{{ body }}</textarea>
                </div>
            </div>
        </div>

        <div class="panel panel-default">
            <div class="panel-heading">CUSTOM FIELDS</div>
            <div class="panel-body">
                <div class="form-group" v-for="field in post.fields">
                    <label for="i">{{ field.name }}</label>
                    <input type="text" v-model="field[i]" name="i" id="i" class="form-control">
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

    <!--<div class="modal fade" id="revisions" tabindex="-1" role="dialog">-->
        <!--<div class="modal-dialog modal-lg">-->
            <!--<div class="modal-content">-->
                <!--<div class="modal-header">-->
                    <!--<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>-->
                    <!--<h4 class="modal-title"><i class="fa fa-history"></i> History</h4>-->
                <!--</div>-->
                <!--<div class="modal-body">-->
                    <!--<revisions wait-for="clicked-history" post="{{ $data }}"></revisions>-->
                <!--</div>-->
                <!--<div class="modal-footer">-->
                    <!--<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>-->
                <!--</div>-->
            <!--</div>-->
        <!--</div>-->
    <!--</div>-->
</template>

<script>
    var moment = require ('moment');

    export default {

        props: ['current-user'],

        data: function() {
            return {
                post: {
                    category: {},
                    tags: [],
                    fields: [],
                    meta: {}
                },
                allCategories: [],
                allTags: [],
                revisions: [],
                fields: []
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

            fetch: function (successHandler) {
                var self = this;
                client({
                    path: '/posts/'+ this.$route.params.post_id +'?include=category,tags,fields,meta'
                }).then(function (response) {
                    self.post = response.entity.data;
                    self.post.category = self.post.category.data;
                    self.post.fields = self.post.fields.data;
                    self.post.meta = self.post.meta.data;
                    self.post.tags = self.post.tags.data.reduce(function (ids, tag) {
                        ids.push(tag.id);
                        return ids;
                    }, []);
                    if  (self.post.start_showing_at) {
                        self.post.start_showing_at = moment.unix(self.post.start_showing_at).format('YYYY-MM-DD');
                    }
                    if  (self.post.stop_showing_at) {
                        self.post.stop_showing_at = moment.unix(self.post.stop_showing_at).format('YYYY-MM-DD');
                    }
                    self.lock();
                    self.initSelect2();
                    successHandler(self.post);
                }, function (response) {
                    if (response.status.code == 401 || response.status.code == 500) {
                        self.$dispatch('userHasLoggedOut')
                    }
                });
            },

            fetchCategories: function () {
                var self = this;
                client({
                    path: '/categories'
                }).then(function (response) {
                    self.allCategories = response.entity.data;
                    // successHandler(response.entity.data);
                }, function (response) {
                    if (response.status.code == 401 || response.status.code == 500) {
                        self.$dispatch('userHasLoggedOut')
                    }
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
                    // successHandler(response.entity.data);
                }, function (response) {
                    if (response.status.code == 401 || response.status.code == 500) {
                        self.$dispatch('userHasLoggedOut')
                    }
                });
            },

            /**
             * Save the post.
             *
             * @param e
             */
            save: function(e) {
                e.preventDefault();

                console.log([
                    this.start_showing_at,
                    this.stop_showing_at
                ]);

                client({
                    method: 'PUT',
                    path: '/posts/'+self.post.id,
                    entity: self.post
                }).then(function (response) {
                    self.notify('success', 'Saved successfully.');
                }, function (response) {
                    if (response.status.code == 401 || response.status.code == 500) {
                        self.$dispatch('userHasLoggedOut')
                    }
                });
            },

            saveAndClose: function() {
                setTimeout(this.close, 2000);
            },

            delete: function(e) {
                e.preventDefault();

                var confirmed = confirm("Are you sure you want to delete this? This will permanently delete this post and its revision history.");

                if (confirmed) {
                    $.ajax({
                        type: "DELETE",
                        url: '/api/posts/' + this.id,
                        success: function(data) {
                            window.location = "/admin/posts";
                        }
                    });
                }
            },

            lock: function() {
                var self = this;
                client({
                    method: 'PATCH',
                    path: '/posts/'+self.post.id+'/lock',
                    entity: { user_id: self.currentUser.id }
                }).then(function (response) {
                    self.post.is_locked = true;
                    window.onbeforeunload = function (e) {
                        self.unlock();
                    };
                }, function (response) {
                    if (response.status.code == 401 || response.status.code == 500) {
                        self.$dispatch('userHasLoggedOut')
                    }
                });
            },

            unlock: function (done) {
                var self = this;
                client({
                    method: 'PATCH',
                    path: '/posts/'+self.post.id+'/unlock',
                    entity: { user_id: self.currentUser.id }
                }).then(function (response) {
                    self.post.is_locked = false;
                    done();
                }, function (response) {
                    if (response.status.code == 401 || response.status.code == 500) {
                        self.$dispatch('userHasLoggedOut')
                    }
                });
            },

            /**
             * Initialize the redactor WYSIWYG text editor plugin.
             *
             * @param element
             * @param html
             */
            initWYSIWYG: function(element, html) {
                var that = this;

                $('.wysiwyg[name=' + element + ']').redactor({
                    plugins         : ['video', 'imagemanager', 'table', 'fullscreen'],
                    imageManagerJson: '/api/wysiwyg/images',
                    imageUpload     : '/api/wysiwyg/upload/post',
                    codemirror      : true,
                    formattingAdd   : [{
                        tag: 'sup',
                        title: 'Superscript'
                    }],
                    // Set the text to the editor on init
                    initCallback: function() {
                        if (html) {
                            this.code.set(html);
                        }
                        //this.$toolbar.css('opacity', 0);
                    },
                    // Set the editor text back to the element on change
                    changeCallback: function() {
                        that[element] = this.code.get();
                    },
                    focusCallback: function(e) {
                        //this.$toolbar.css('opacity', 1);
                    },
                    blurCallback: function(e) {
                        //this.$toolbar.css('opacity', 0);
                    },
                    keyupCallback: function(e) {
                        // Close fullscreen on "Esc"
                        if (e.keyCode == 27 && this.fullscreen.isOpen) {
                            this.fullscreen.disable();
                        }
                    },
                    codeKeydownCallback: function(e)
                    {
                        // Close fullscreen on "Esc"
                        if (e.keyCode == 27 && this.fullscreen.isOpen) {
                            this.fullscreen.disable();
                        }
                    }
                });

                // CodeMirror syntax highlighting on all text areas
                $('textarea.wysiwyg').each(function(index, elem){
                    CodeMirror.fromTextArea(elem, {
                        lineWrapping: true,
                        theme: "material",
                        mode : "htmlmixed"
                    });
                });
            },

            /**
             * Initialize the select2 plugin.
             */
            initSelect2: function() {
                var self = this;
                setTimeout(function() {
                    $('#tags').select2();
                    $('.form-tags select').on('change', function () {
                        self.post.tags = $(this).val();
                    });
                }.bind(this), 50); // this sucks

            },

            notify: function (type, message) {
                var icon = '';
                if (type == 'success') {
                    icon = "fa fa-thumbs-o-up";
                } else if (type == 'warning') {
                    icon = "fa fa-warning";
                }

                $.notify({
                    // options
                    icon: icon,
                    message: message
                },{
                    // settings
                    type: type,
                    delay: 3000,
                    offset: { x: 20, y: 70 }
                });
            },

            onExternalUnlock: function(data) {
                console.log(data);
                if (data.post.id == this.id) {
                    alert("This post was unlocked by "+data.user.first_name);
                }
            }
        },

        route: {
            data: function (transition) {
                this.fetchTags();
                this.fetchCategories();
                this.fetch(function (post) {
                    this.lock();
                    transition.next({post: post});
                }.bind(this));
            },
            deactivate: function (transition) {
                this.unlock(function () {
                    transition.next();
                });
            }
        }

    }
</script>