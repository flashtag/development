module.exports = {

    mapRoutes: function (router) {

        router.map({
            '/home': { component: require('./components/home.vue') },
            '/posts': { component: require('./components/posts/index.vue') },
            '/posts/create': { component: require('./components/posts/create.vue') },
            '/posts/:id': { component: require('./components/posts/edit.vue') }
        });

        router.alias({
            '': '/home',
            '/auth': '/auth/login'
        });

    }

};
