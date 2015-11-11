var Cookies = require('js-cookie');

(function (define) {
    'use strict';

    define(function (require) {

        var interceptor = require('rest/interceptor');

        /**
         * Authenticates the request using JWT Authentication
         *
         * @param {Client} [client] client to wrap
         * @param {Object} config
         *
         * @returns {Client}
         */
        return interceptor({
            request: function (request, config) {
                var token, headers;

                token = Cookies.get('jwt-token');
                headers = request.headers || (request.headers = {});

                if ( token !== null && token !== 'undefined') {
                    headers.Authorization = token;
                }

                return request;
            },
            response: function (response) {
                if (response.status && response.status.code == 401) {
                    Cookies.remove('jwt-token');
                }
                if (response.headers && response.headers.Authorization) {
                    Cookies.set('jwt-token', response.headers.Authorization, { expires: 7, path: '' })
                }
                if (response.entity && response.entity.token && response.entity.token.length > 10) {
                    Cookies.set('jwt-token', 'Bearer ' + response.entity.token, { expires: 7, path: '' });
                }
                return response;
            }
        });

    });

}(
    typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
));
