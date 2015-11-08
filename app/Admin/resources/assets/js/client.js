var rest = require('rest');

module.exports = getWrappedClient(rest);

function getWrappedClient(rest) {
    var pathPrefix = require('rest/interceptor/pathPrefix');
    var mime = require('rest/interceptor/mime');
    var defaultRequest = require('rest/interceptor/defaultRequest');
    var errorCode = require('rest/interceptor/errorCode');
    var interceptor = require('rest/interceptor');
    var jwtAuth = require('./interceptors/jwtAuth');

    var defaultHeaders = {
        'X-Requested-With': 'rest.js',
        'Content-Type': 'application/json'
    };

    return rest.wrap(pathPrefix, { prefix: 'http://app.test/api' })
        .wrap(mime)
        .wrap(defaultRequest, { headers: defaultHeaders})
        .wrap(errorCode, { code: 400 })
        .wrap(jwtAuth);
}
