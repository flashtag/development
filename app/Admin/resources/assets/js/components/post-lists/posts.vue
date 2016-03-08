<template>

    <div class="form-group">
        <label>Add post</label>
        <select class="Post-select form-control" multiple>
            <option v-for="post in postList.posts">{{ post.title }}</option>
        </select>
    </div>

    <table v-if="postList.posts.length" class="Posts table table-striped table-hover">
        <thead>
        <tr>
            <th>Order</th>
            <th>Title</th>
            <th>Category</th>
            <th>Created</th>
            <th class="text-centered">Showing</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="post in postList.posts | filterBy titleFilter in 'title' | filterBy categoryFilter in 'category.name' | orderBy sortKey sortDir"
            class="Post" :class="{ 'Post--unpublished': !post.is_published }">

            <td class="order">
                <input class="post__order"
                       type="number"
                       value="{{ post.order }}"
                       @keyup.enter="blur"
                       @focusout="reorder(post, $event)"
                       number>
            </td>

            <td>{{ post.title }}</td>

            <td>{{ post.category ? post.category.name : '' }}</td>

            <td>{{ formatTimestamp(post.created_at) }}</td>

            <td class="text-centered">
                <span v-if="post.is_showing" class="showing"><i class="fa fa-check"></i></span>
                <span v-else class="not-showing"><i class="fa fa-times"></i></span>
            </td>

        </tr>
        </tbody>
    </table>

    <p v-else>No posts.</p>

</template>

<script>
    import PostList from '../../models/post-list';

    export default {

        props: ['post-list-id'],

        data: function () {
            return {
                postList: {
                    posts: []
                }
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

            /**
             * Reorder the posts' list_positions
             * @param post
             * @param e
             */
            reorder: function (post, e) {
                var self = this;

                var new_position = parseInt(e.target.value);
                // If the position is not a number, we are done here.
                if (isNaN(new_position)) {
                    e.target.value = post.order;
                    return;
                }

                var affectedPosts = self.posts.filter(function (p) {
                    return p.category.data.id == post.category.data.id;
                });

                var max = affectedPosts.reduce(function (max, post) {
                    return (post.order > max) ? post.order : max;
                }, 0);

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

                this.posts = affectedPosts.map(function (post) {
                    var p = post.order;
                    if (p >= between[0] && p <= between[1]) {
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
                    this.scrollTo($(e.target).closest('tr'));
                }.bind(this), 0);
            },

            /**
             * Save the post's position to the database.
             * @param post
             */
            saveOrder: function (post) {
                return client.patch('/posts/' + post.id + '/reorder', {order: post.order});
            },

            scrollTo: function (target) {
                $('html,body').animate({
                    scrollTop: target.offset().top - 280
                }, 700);

                target.addClass("pulse").delay(4000).queue(function () {
                    $(this).removeClass("pulse").dequeue();
                });

                return false;
            },

            blur: function (e) {
                e.target.blur();
            },

            formatTimestamp: function (timestamp) {
                return moment.unix(timestamp).format('MMM D, YYYY');
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
                    self.postList.addPost(e.params.data.id);
                    $(this).val(null).trigger("change");
                });
            }

        }

    }
</script>