<style>
    .order {
        width: 40px;
    }
</style>

<template>
    <div class="panel panel-default">
        <div class="panel-heading">Re-order posts</div>
        <table class="CategoryPosts table table-striped table-hover">
            <tbody>
            <tr v-for="post in posts | orderBy 'order'" class="CategoryPosts__item">
                <td class="order">
                    <input class="post__order"
                           type="number"
                           value="{{ post.order }}"
                           @keyup.enter="blur"
                           @focusout="reorder(post, $event)"
                           number>
                </td>
                <td class="title">{{ post.title }}</td>
            </tr>
            </tbody>
        </table>
    </div>


</template>

<script>
    export default {

        props: ['current-user', 'category-id', 'posts'],

        methods: {

            /**
             * Reorder the posts' list_positions
             * @param post
             * @param e
             */
            reorder: function(post, e) {
                var self = this;

                var new_position = parseInt(e.target.value);
                // If the position is not a number, we are done here.
                if (isNaN(new_position)) {
                    e.target.value = post.order;
                    return;
                }

                var max = self.posts.reduce(function(max, post) {
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

                this.posts = this.posts.map(function (post) {
                    var p = post.order;
                    if (p >= between[0] && p <= between[1]) {
                        post.order += increment;
                    }
                    return post;
                });

                // Save the new position on the current post.
                post.order = new_position;

                // Persist the new order
                this.save(post);

                setTimeout(function() {
                    this.scrollTo($(e.target).closest('tr'));
                }.bind(this), 0);
            },

            /**
             * Save the post's position to the database.
             * @param post
             */
            save: function (post) {
                var self = this;
                client({
                    method: "PATCH",
                    path: '/posts/' + post.id + '/reorder',
                    entity: { order: post.order }
                }).then(function () {
                    setTimeout(function () {
                        self.notify('success', 'Saved post order.');
                    }, 1000);
                }, function () {
                    // fail
                });
            },

            scrollTo: function(target) {
                $('html,body').animate({
                    scrollTop: target.offset().top - 280
                }, 700);

                target.addClass("pulse").delay(4000).queue(function () {
                    $(this).removeClass("pulse").dequeue();
                });

                return false;
            },

            blur: function(e) {
                e.target.blur();
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
            }

        }

    }
</script>