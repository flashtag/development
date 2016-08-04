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
        $this->AddMiddlewares($router);
        $this->loadViewsFrom(__DIR__.'/../resources/views', 'admin');
        $this->publishesAssets();
        $this->loadComposers();
    }

    private function defineAdminRoutes(Router $router)
    {
        if (! $this->app->routesAreCached()) {
            $router->group([
                'prefix' => 'admin',
                'namespace' => 'Flashtag\Admin\Http\Controllers'
            ], function ($router) {
                require __DIR__.'/../Http/routes.php';
            });
        }
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
