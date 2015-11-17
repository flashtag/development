module.exports = {

    mapRoutes: function (router) {

        router.map({

            '/home': { component: require('../components/home.vue') },

            // POSTS
            '/posts': { component: require('../components/posts/index.vue') },
            '/posts/create': { component: require('../components/posts/create.vue') },
            '/posts/:post_id': { component: require('../components/posts/edit.vue') },
            '/posts/:post_id/revisions': { component: require('../components/posts/revisions/index.vue') },
            '/posts/:post_id/revisions/:revision_id': { component: require('../components/posts/revisions/show.vue') },

            // POST FIELDS
            '/post-fields': { component: require('../components/post-fields/index.vue') },
            '/post-fields/create': { component: require('../components/post-fields/create.vue') },
            '/post-fields/:field_id': { component: require('../components/post-fields/edit.vue') },

            // CATEGORIES
            '/categories': { component: require('../components/categories/index.vue') },
            '/categories/create': { component: require('../components/categories/create.vue') },
            '/categories/:category_id': { component: require('../components/categories/edit.vue') },

            // TAGS
            '/tags': { component: require('../components/tags/index.vue') },
            '/tags/create': { component: require('../components/tags/create.vue') },
            '/tags/:tag_id': { component: require('../components/tags/edit.vue') },

            // AUTHORS
            '/authors': { component: require('../components/authors/index.vue') },
            '/authors/create': { component: require('../components/authors/create.vue') },
            '/authors/:author_id': { component: require('../components/authors/edit.vue') },

            // USERS
            '/users': { component: require('../components/users/index.vue') },
            '/users/create': { component: require('../components/users/create.vue') },
            '/users/:user_id': { component: require('../components/users/edit.vue') }

        });

        router.redirect({
            '/': '/home'
        });

    }

};
