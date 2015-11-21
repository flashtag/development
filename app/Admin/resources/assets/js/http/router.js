var VueRouter = require('vue-router');
import { mapRoutes } from './routes';

module.exports = getRouter();

function getRouter () {
    var router = new VueRouter();
    mapRoutes(router);

    router.beforeEach(function () {
        window.scrollTo(0, 0)
    });

    return router;
}
