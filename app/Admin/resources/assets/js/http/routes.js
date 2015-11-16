module.exports = {

    mapRoutes: function (router) {

        router.map({
            '/home': { component: require('../components/home.vue') },
            '/posts': { component: require('../components/posts/index.vue') },
            '/posts/create': { component: require('../components/posts/create.vue') },
            '/posts/:post_id': { component: require('../components/posts/edit.vue') },
            '/post-fields': { component: require('../components/post-fields/index.vue') },
            '/post-fields/create': { component: require('../components/post-fields/create.vue') },
            '/post-fields/:field_id': { component: require('../components/post-fields/edit.vue') },
            '/categories': { component: require('../components/categories/index.vue') },
            '/categories/:category_id': { component: require('../components/categories/edit.vue') },
            '/categories/create': { component: require('../components/categories/create.vue') },
            '/tags': { component: require('../components/tags/index.vue') },
            '/tags/:tag_id': { component: require('../components/tags/edit.vue') },
            '/tags/create': { component: require('../components/tags/create.vue') }
        });

        router.redirect({
            '/': '/home'
        });

    }

};
