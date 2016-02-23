import Vue from 'vue';


// Develop
Vue.config.debug = true;


// HTTP Client
Vue.use(require('vue-resource'));
Vue.http.interceptors.push(require('./http/interceptors/jwtAuth'));
Vue.http.options.root = '/api';
window.client = Vue.http;
window.resource = Vue.resource;


// Global Directives
Vue.directive('select', require('./directives/select'));
Vue.directive('rich-editor', require('./directives/rich-editor'));


// Global Components
Vue.component('media-input', require('./components/partials/media-input.vue'));
Vue.component('dropzone', require('./components/partials/dropzone.vue'));


new Vue(require('./App'));
