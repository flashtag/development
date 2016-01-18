<?php

namespace Flashtag\Admin\Providers;

use Illuminate\Routing\Router;
use Illuminate\Support\ServiceProvider;

class AdminServiceProvider extends ServiceProvider
{
    public function register()
    {
        //
    }

    public function boot(Router $router)
    {
        $this->defineAdminRoutes($router);

        $this->loadViewsFrom(__DIR__.'/../resources/views', 'admin');

        $this->publishesAssets();

        view()->composer('admin::layout', function ($view) {
            $view->with('current_user', \Auth::user());
        });
    }

    private function defineAdminRoutes($router)
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

    private function publishesAssets()
    {
        $this->publishes([
            __DIR__.'/../public/build' => public_path('assets/admin'),
            __DIR__.'/../public/vendor' => public_path('assets/vendor/admin'),
        ], 'public');
    }
}
