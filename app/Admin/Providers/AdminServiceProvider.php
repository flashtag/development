<?php

namespace Flashtag\Admin\Providers;

use Illuminate\Foundation\AliasLoader;
use Illuminate\Routing\Router;
use Illuminate\Support\ServiceProvider;
use Tymon\JWTAuth\Facades\JWTAuth;

class AdminServiceProvider extends ServiceProvider
{
    public function register()
    {
        $this->registerFacades();
    }

    public function boot(Router $router)
    {
        $this->defineAdminRoutes($router);

        $this->loadViewsFrom(__DIR__.'/../resources/views', 'admin');

        $this->publishesAssets();
    }

    private function registerFacades()
    {
        $this->app->booting(function () {
            $loader = AliasLoader::getInstance();
            $loader->alias('JWTAuth', JWTAuth::class);
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
