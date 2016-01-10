import Vue from 'vue';

Vue.use(require('vue-router'));
Vue.use(require('vue-resource'));

// Develop
Vue.config.debug = true;

// HTTP Client
Vue.http.interceptors.push(require('./http/interceptors/jwtAuth'));
window.client = Vue.http;
window.resource = Vue.resource;

// Components
Vue.component('top-nav', require('./components/partials/top-nav.vue'));
Vue.component('side-nav', require('./components/partials/side-nav.vue'));
Vue.component('paginator', require('./components/partials/paginator.vue'));

// Directives
Vue.directive('select', require('./directives/select'));
Vue.directive('rich-editor', require('./directives/rich-editor'));

// Start
var router = require('./http/router');
router.start(require('./App.vue'), '#Admin');
