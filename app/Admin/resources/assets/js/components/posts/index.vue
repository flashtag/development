<template>
    <h1>Posts</h1>

    <table class="table table-striped table-hover">
        <thead>
            <tr>
                <th>Title</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="post in posts">
                <td>{{ post.title }}</td>
            </tr>
        </tbody>
    </table>

    <ul class="pagination">
        <li v-bind:class="{ 'disabled': !hasPrevious() }"><a href="#">&laquo;</a></li>
        <li v-bind:class="{ 'disabled': !hasNext() }"><a href="#">&raquo;</a></li>
    </ul>

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
                path: '/posts?count=25'
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

        hasPrevious: function () {
            return !! this.pagination.links.previous;
        },

        hasNext: function () {
            return !! this.pagination.links.next;
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