<template>
    <h1>Posts</h1>

    <table class="table table-striped table-hover">
        <thead>
            <tr>
                <th>Title</th>
                <th>Published</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="post in posts">
                <td>{{ post.title }}</td>
                <td class="published">
                    <div class="switch">
                        <input class="cmn-toggle cmn-toggle-round-sm"
                               id="is_published_{{post.id}}"
                               type="checkbox"
                               name="is_published"
                               v-model="post.is_published"
                               @change="publish(post, $event)">
                        <label for="is_published_{{post.id}}"></label>
                    </div>
                </td>
            </tr>
        </tbody>
    </table>

    <paginator :pagination="pagination"></paginator>

</template>

<script>
export default {

    data: function () {
        return {
            posts: [],
            pagination: { links: {} }
        }
    },

    methods: {

        fetch: function (successHandler) {
            var self = this;
            client({
                path: '/posts'
            }).then(function (response) {
                self.$set('posts', response.entity.data);
                self.$set('pagination', response.entity.meta.pagination);
                successHandler(response.entity.data)
            }, function (response) {
                if (response.status.code == 401 || response.status.code == 500) {
                    self.$dispatch('userHasLoggedOut')
                }
            });
        },

        publish: function (post) {
            client({
                method: 'PUT',
                path: '/posts/' + post.id + '/publish',
                entity: { is_published: post.is_published }
            });
        },

        isShowing: function (post) {
            if (! post.is_published) {
                return false;
            }

            var start = !!post.publish_start ? moment(post.publish_start, "YYYY-MM-DD HH:mm:ss") : moment("1980-01-01", "YYYY-MM-DD");
            var end   = !!post.publish_end   ? moment(post.publish_end, "YYYY-MM-DD HH:mm:ss")   : moment("2033-01-19", "YYYY-MM-DD");
            var now = moment();

            return (start <= now && now <= end);
        },

        checkLock: function (post, isLocked, e) {
            if (!isLocked) {
                return;
            }

            var unlock = confirm(
                "The post is locked by "+this.userName(post.locked_by_id)+". " +
                "Do you want to unlock it and proceed?" +
                "\r\n\r\n" +
                "If you proceed and they are still editing the post, you may overwrite each other's work."
            );

            if (!unlock) {
                e.preventDefault();
            }
        },

        userName: function (userId) {
            if (!userId) {
                return '';
            }

            var user = this.users.filter(function(user) {
                return user.id == userId;
            })[0];

            return user.first_name + ' ' + user.last_name;
        }

    },

    route: {
        data: function (transition) {
            this.fetch(function (data) {
                transition.next({posts: data})
            });
        }
    }
}
</script>