<?php

namespace Flashtag\Front\Providers;

use Illuminate\Routing\Router;
use Illuminate\Support\ServiceProvider;

class FrontServiceProvider extends ServiceProvider
{
    public function register()
    {
        //
    }

    public function boot(Router $router)
    {
        $this->loadViewsFrom(__DIR__.'/../resources/views', 'front');

        if (! $this->app->routesAreCached()) {
            $router->group([
                'namespace' => 'Flashtag\Front\Http\Controllers'
            ], function ($router) {
                require __DIR__.'/../Http/routes.php';
            });
        }

        $this->publishes([
            __DIR__.'/../public/assets' => public_path('assets/front')
        ], 'public');
    }
}
