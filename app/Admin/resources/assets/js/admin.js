import Vue from 'vue';

// Develop
Vue.config.debug = true;

// HTTP Client
Vue.use(require('vue-resource'));
Vue.http.interceptors.push(require('./http/interceptors/jwtAuth'));
Vue.http.options.root = '/api';
window.client = Vue.http;
window.resource = Vue.resource;

// Directives
Vue.directive('select', require('./directives/select'));
Vue.directive('rich-editor', require('./directives/rich-editor'));

new Vue(require('./App'));
