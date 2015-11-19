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
Vue.component('top-nav', require('./components/partials/top-nav.vue'));
Vue.component('side-nav', require('./components/partials/side-nav.vue'));
Vue.component('paginator', require('./components/partials/paginator.vue'));

// Directives
Vue.directive('select', require('./directives/select'));
Vue.directive('rich-editor', require('./directives/rich-editor'));

// App
var Admin = Vue.extend(require('./App.vue'));

// Start
router.start(Admin, '#Admin');
