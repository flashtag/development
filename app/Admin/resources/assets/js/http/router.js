var VueRouter = require('vue-router');
import { mapRoutes } from './routes';

module.exports = getRouter();

function getRouter () {
    var router = new VueRouter();
    mapRoutes(router);

    return router;
}
