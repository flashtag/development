<?php

namespace Flashtag\Api;

use Dingo\Api\Provider\LaravelServiceProvider;
use Dingo\Api\Routing\Router;
use Illuminate\Support\ServiceProvider;
use Tymon\JWTAuth\Providers\JWTAuthServiceProvider;

class ApiServiceProvider extends ServiceProvider
{
    /**
     * @var array
     */
    protected $versions = ['v1'];

    /**
     * Bind implementations.
     */
    public function register()
    {
        $this->mergeConfigFrom(__DIR__.'/../config/api.php', 'api');

        $this->app->register(LaravelServiceProvider::class);
        $this->app->register(JWTAuthServiceProvider::class);
    }

    /**
     * Register routes and stuff.
     */
    public function boot()
    {
        if (! $this->app->routesAreCached()) {
            $this->apiRoutes();
        }

        $this->publishes([
            __DIR__.'/../config/api.php' => config_path('api.php')
        ]);
    }

    /**
     * Register API routes.
     */
    private function apiRoutes()
    {
        $api = $this->app->make(Router::class);

        foreach ($this->versions as $version) {
            $namespace = 'Flashtag\\Api\\Http\\Controllers\\'.strtoupper($version);

            $api->version($version, [
                'namespace' => $namespace,
//                'middleware' => 'api.auth'
            ], function ($api) use ($version) {
                require __DIR__.'/Http/Routes/'.$version.'.php';
            });
        }
    }
}
