<?php

namespace Flashtag\Admin\Providers;

use Flashtag\Admin\Http\Middleware\Administrator as AdminMiddleware;
use Illuminate\Routing\Router;
use Illuminate\Support\ServiceProvider;

class AdminServiceProvider extends ServiceProvider
{
    public function boot(Router $router)
    {
        $this->defineAdminRoutes($router);
        $this->addMiddlewares($router);
        $this->loadViewsFrom(__DIR__.'/../resources/views', 'admin');
        $this->publishesAssets();
        $this->loadComposers();
    }

    private function defineAdminRoutes(Router $router)
    {
        if (! $this->app->routesAreCached()) {
            $this->mapWebRoutes($router);
            $this->mapApiRoutes($router);
        }
    }

    private function mapWebRoutes(Router $router)
    {
        $router->group([
            'prefix' => 'admin',
            'namespace' => 'Flashtag\Admin\Http\Controllers\Web'
        ], function ($router) {
            require __DIR__.'/../../routes/web.php';
        });
    }

    private function mapApiRoutes(Router $router)
    {
        $router->group([
            'prefix' => 'admin/api',
            'namespace' => 'Flashtag\Admin\Http\Controllers\Api',
            'middleware' => 'auth'
        ], function ($router) {
            require __DIR__.'/../../routes/api.php';
        });
    }

    private function addMiddlewares(Router $router)
    {
        $router->middleware('admin', AdminMiddleware::class);
    }

    private function publishesAssets()
    {
        $this->publishes([
            __DIR__.'/../public/build' => public_path('assets/admin'),
            __DIR__.'/../public/vendor' => public_path('assets/vendor/admin'),
        ], 'public');
    }

    private function loadComposers()
    {
        view()->composer('admin::*', function ($view) {
            return $view->with('current_user', \Auth::user());
        });
    }

    public function register()
    {
        //
    }
}
