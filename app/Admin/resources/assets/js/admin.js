var Vue = require('vue');
var VueRouter = require('vue-router');

Vue.use(VueRouter);

// Develop
Vue.config.debug = true;

// Rest client
window.client = require('./http/client');

// Router
var router = require('./http/router');

// Components
Vue.component('nav-component', require('./components/partials/nav.vue'));
Vue.component('footer-component', require('./components/partials/footer.vue'));
Vue.component('paginator', require('./components/partials/paginator.vue'));

// Directives
Vue.directive('select', require('./directives/select'));

// App
var Admin = Vue.extend(require('./App'));

// Start
router.start(Admin, '#Admin');
