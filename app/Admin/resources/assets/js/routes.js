var Cookies = require('js-cookie');

module.exports = {

    mapRoutes: function (router) {

        router.map({
            '/auth/login': { component: require('./components/auth/login.vue'), guest: true },
            '/auth/logout': { component: require('./components/auth/logout.vue'), auth: true },
            '/home': { component: require('./components/home.vue'), auth: true },
            '/posts': { component: require('./components/posts/index.vue'), auth: true },
            '/posts/create': { component: require('./components/posts/create.vue'), auth: true },
            '/posts/:id': { component: require('./components/posts/edit.vue'), auth: true }
        });

        router.alias({
            '/home': ''
        });

        router.beforeEach(function (transition) {
            var token = Cookies.get('jwt-token');
            if (transition.to.auth) {
                if (!token || token === null) {
                    transition.redirect('/auth/login')
                }
            }
            if (transition.to.guest) {
                if (token) {
                    transition.redirect('/home')
                }
            }
            transition.next()
        });

    }

};
