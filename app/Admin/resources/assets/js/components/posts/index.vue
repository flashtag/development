<template>
    <h1>Posts</h1>
    <p>index</p>
    <ul>
        <li v-for="post in posts">{{ post.title }}</li>
    </ul>
</template>

<script>
export default {

    data: function () {
        return {
            posts: []
        }
    },

    methods: {

        fetch: function (successHandler) {
            var self = this;
            client({
                path: '/posts?count=25'
            }).then(function (response) {
                self.$set('posts', response.entity.data);
                successHandler(response.entity.data)
            }, function (response, status) {
                if (status == 401 || status == 500) {
                    self.$dispatch('userHasLoggedOut')
                }
            });
        }

    },

    route: {
        data: function (transition) {
            this.fetch(function (data) {
                transition.next({posts: data})
            })
        }
    }
}
</script>