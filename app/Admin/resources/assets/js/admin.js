import Vue from 'vue';

// Develop
Vue.config.debug = true;

// HTTP Client
Vue.use(require('vue-resource'));
Vue.http.options.root = '/admin/api';
window.client = Vue.http;
window.resource = Vue.resource;

// Global Directives
Vue.directive('select', require('./directives/select'));
Vue.directive('rich-editor', require('./directives/rich-editor'));

// Global Components
Vue.component('media-input', require('./components/partials/media-input.vue'));
Vue.component('image-preview', require('./components/partials/image-preview.vue'));

new Vue({
    el: '#Admin',
    components: {
        'posts': require('./components/posts/index.vue'),
        'post-revisions': require('./components/posts/revisions/index.vue'),
        'post-revision': require('./components/posts/revisions/show.vue'),
        'fields': require('./components/fields/index.vue'),
        'post-lists': require('./components/post-lists/index.vue'),
        'post-list': require('./components/post-lists/posts.vue'),
        'categories': require('./components/categories.vue'),
        'tags': require('./components/tags.vue'),
        'authors': require('./components/authors.vue'),
        'users': require('./components/users.vue')
    }
});
