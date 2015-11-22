<style>
    .order {
        display: inline-block;
        width: 60px;
    }
</style>

<template>
    <ol class="breadcrumb">
        <li><a href="#">Home</a></li>
        <li><a v-link="'/categories'">Categories</a></li>
        <li><a v-link="'/categories/'+category.id">{{ category.name }}</a></li>
        <li class="active">Posts</li>
    </ol>

    <ul class="CategoryPosts list-unstyled">
        <li v-for="post in category.posts.data | orderBy 'order'" class="CategoryPosts__item">
            <span class="order">{{ post.order }}</span>
            <span class="title">{{ post.title }}</span>
        </li>
    </ul>
</template>

<script>
    export default {

        props: ['current-user'],

        data: function () {
            return {
                categories: null
            }
        },

        methods: {

            fetch: function (successHandler) {
                var self = this;
                client({
                    path: '/categories/' + this.$route.params.category_id + '/?include=posts:order(order)'
                }).then(function (response) {
                    successHandler(response.entity.data);
                }, function (response) {
                    if (response.status.code == 401 || response.status.code == 500) {
                        self.$dispatch('userHasLoggedOut')
                    }
                });
            }

        },

        route: {
            data: function (transition) {
                this.fetch(function (data) {
                    transition.next({category: data});
                });
            }
        }

    }
</script>