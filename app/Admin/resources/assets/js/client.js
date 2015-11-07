module.exports = getWrappedClient(rest);

function getWrappedClient(rest) {
    var pathPrefix = require('rest/interceptor/pathPrefix');
    var mime = require('rest/interceptor/mime');
    var defaultRequest = require('rest/interceptor/defaultRequest');
    var errorCode = require('rest/interceptor/errorCode');
    var interceptor = require('rest/interceptor');
    var jwtAuth = require('./interceptors/jwtAuth');

    return rest.wrap(pathPrefix, { prefix: config.api.base_url })
        .wrap(mime)
        .wrap(defaultRequest, config.api.defaultRequest)
        .wrap(errorCode, { code: 400 })
        .wrap(jwtAuth);
}
