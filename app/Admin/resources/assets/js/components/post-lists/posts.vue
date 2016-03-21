<template>

    <div class="row">
        <div class="col-md-6">
            <div class="form-group">
                <label for="order_by">Sort by</label>
                <select name="order_by" id="order_by" v-model="sortKey" class="form-control">
                    <option v-for="key in sortKeys" value="{{ key.value }}">{{ key.text }}</option>
                </select>
            </div>
        </div>
        <div class="col-md-6">
            <label for="order_dir">Sort direction</label>
            <select name="order_dir" id="order_dir" v-model="orderDir" class="form-control">
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
            </select>
        </div>
    </div>

    <div class="form-group">
        <label for="add-post">Add post</label>
        <select id="add-post" class="Post-select form-control" multiple>
            <option></option>
        </select>
    </div>

    <table v-if="postList.posts.length" class="Posts table table-striped table-hover">
        <thead>
        <tr>
            <th v-if="sortKey == 'order'">Order</th>
            <th>Title</th>
            <th>Category</th>
            <th>Created</th>
            <th class="text-centered">Showing</th>
            <th></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="post in postList.posts | filterBy titleFilter in 'title' | filterBy categoryFilter in 'category.name' | orderBy sortKey sortDir"
            class="Post" :class="{ 'Post--unpublished': !isShowing(post) }" id="Post-{{post.id}}">

            <td v-if="sortKey == 'order'" class="order">
                <input class="post__order"
                       type="number"
                       :value="post.order"
                       @keydown.enter.prevent="blur"
                       @focusout="reorder(post, $event)"
                       number>
            </td>

            <td>{{ post.title }}</td>

            <td>{{ post.category ? post.category.name : '' }}</td>

            <td>{{ formatTimestamp(post.created_at) }}</td>

            <td class="text-centered">
                <span v-if="isShowing(post)" class="showing"><i class="fa fa-check"></i></span>
                <span v-else class="not-showing"><i class="fa fa-ban"></i></span>
            </td>

            <td>
                <a @click.prevent="removePost(post.id)" href="#remove" class="remove-post">
                    <i class="fa fa-times"></i>
                </a>
            </td>

        </tr>
        </tbody>
    </table>

    <p v-else>No posts.</p>

</template>

<script>
    import PostList from '../../models/post-list';

    export default {

        props: ['post-list-id', 'sort-key', 'order-dir'],

        data: function () {
            return {
                postList: {
                    posts: []
                },
                sortKeys: [
                    { value: "created_at", text: "Create date" },
                    { value: "updated_at", text: "Update date" },
                    { value: "order", text: "Custom" }
                ]
            }
        },

        computed: {
            sortDir: function () {
                return this.orderDir == "asc" ? 1 : -1;
            }
        },

        created: function () {
            this.fetch();
        },

        ready: function() {
            this.initSelect();
        },

        methods: {

            fetch: function () {
                this.$http.get('post-lists/'+this.postListId).then(function (response) {
                    this.$set('postList', new PostList(response.data));
                });
            },

            addPost: function (post, position) {
                var self = this;
                position = position || 1;

                return this.$http.get('/admin/api/posts/'+post.id).then(function (response) {
                    var post = response.data;
                    self.postList.savePost(post).then(function(response) {
                        var existing = self.postList.posts.filter(function (p) {
                            return p.id == post.id;
                        })[0];
                        if (typeof existing === 'undefined') {
                            post.order = self.postList.posts.length + 1;
                            self.postList.posts.push(post);
                        }
                        self.reorder(post, position);
                    });
                });
            },

            /**
             * Reorder the posts' list_positions
             * @param post
             * @param e
             */
            reorder: function (post, e) {
                var new_position;
                if (typeof e == 'number') {
                    new_position = e;
                } else {
                    new_position = parseInt(e.target.value);
                    // If the position is not a number, we are done here.
                    if (isNaN(new_position)) {
                        e.target.value = post.order;
                        return;
                    }
                }

                var max = this.postList.posts.length;
                // var max = this.postList.posts.reduce(function (max, post) {
                //     return (post.order > max) ? post.order : max;
                // }, 0);

                new_position = (new_position > 0) ? new_position : 1;
                new_position = (new_position > max) ? max : new_position;

                // If the position is not different, we are done here.
                if (new_position === post.order) {
                    e.target.value = post.order;
                    return;
                }

                // Shift all the posts' between the new list position and old list position up or down by one.
                // If we are moving the list position to a lower number, the other numbers should shift up by one,
                // but if we are moving the list position to a higher number the others should shift down by one.
                var increment = (new_position < post.order) ? +1 : -1;
                var between = (new_position < post.order) ? [new_position, post.order] : [post.order, new_position];

                this.postList.posts = this.postList.posts.map(function (post) {
                    if (post.order >= between[0] && post.order <= between[1]) {
                        post.order += increment;
                    }
                    return post;
                });

                // Save the new position on the current post.
                post.order = new_position;

                // Persist the new order
                this.saveOrder(post);

                this.sortKey = 'order';

                setTimeout(function () {
                    var row;
                    if (typeof e == 'number') {
                        row = this.getAddedPostRow(post);
                    } else {
                        row = $(e.target).closest('tr');
                    }

                    this.scrollTo(row);
                }.bind(this), 0);
            },

            getAddedPostRow: function (post) {
                return $('.Posts').find('#Post-'+post.id);
            },

            removePost: function (post_id) {
                var self = this;
                swal({
                    title: 'Are you sure?',
                    text: 'Do you really want to remove this post from the list?',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#DD6B55',
                    confirmButtonText: 'Yes, remove it!',
                    closeOnConfirm: false,
                    showLoaderOnConfirm: true
                }, function () {
                    self.$http.delete('/admin/api/post-lists/'+self.postListId+'/posts/'+post_id)
                        .then(function(){
                            self.fetch();
                        }).then(function() {
                            swal("Removed!", "post removed.", "success");
                        });
                    });
            },

            /**
             * Save the post's position to the database.
             * @param post
             */
            saveOrder: function (post) {
                return this.$http.patch('post-lists/' + this.postList.id + '/reorder', {
                    post_id: post.id,
                    order: post.order
                });
            },

            scrollTo: function (target) {
                $('html,body').animate({
                    scrollTop: target.offset().top - 280
                }, 500);

                target.addClass("pulse").delay(4000).queue(function () {
                    $(this).removeClass("pulse").dequeue();
                });

                return false;
            },

            blur: function (e) {
                e.target.blur();
            },

            formatTimestamp: function (timestamp) {
                return moment(timestamp, "YYYY-MM-DD").format('MMM D, YYYY');
            },

            isShowing: function (post) {
                if (! post['is_published']) {
                    return false;
                }

                var start = post['start_showing_at']
                        ? moment(post['start_showing_at'], 'YYYY-MM-DD')
                        : moment("1980-01-01", "YYYY-MM-DD");
                var stop = post['stop_showing_at']
                        ? moment(post['stop_showing_at'], 'YYYY-MM-DD')
                        :moment("2033-01-19", "YYYY-MM-DD");
                var now = moment();

                return (start <= now) && (now <= stop);
            },

            initSelect: function() {
                var self = this;
                this.postSelect = $(".Post-select").select2({
                    ajax: {
                        url: "/admin/api/posts/search",
                        dataType: 'json',
                        delay: 250,
                        data: function (params) {
                            return {
                                q: params.term, // search term
                                page: params.page
                            };
                        },
                        processResults: function (data, params) {
                            // parse the results into the format expected by Select2
                            // since we are using custom formatting functions we do not need to
                            // alter the remote JSON data, except to indicate that infinite
                            // scrolling can be used
                            params.page = params.page || 1;

                            return {
                                results: data.map(function (result) {
                                    return {
                                        id: result.id,
                                        text: result.title
                                    }
                                }),
                                pagination: {
                                    more: (params.page * 30) < data.total_count
                                }
                            };
                        },
                        cache: true
                    },
                    //escapeMarkup: function (markup) { return markup; }, // let our custom formatter work
                    minimumInputLength: 1
//                    templateResult: formatRepo, // omitted for brevity, see the source of this page
//                    templateSelection: formatRepoSelection // omitted for brevity, see the source of this page
                }).on("select2:select", function (e) {
//                    console.log(e.params.data.id);
//                    console.log(e.params.data.text);
                    self.addPost(e.params.data);
                    $(this).val(null).trigger("change");
                });
            }

        }

    }
</script>
