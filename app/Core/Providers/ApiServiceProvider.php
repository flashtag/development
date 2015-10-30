<?php

namespace Flashtag\Api\Providers;

use Dingo\Api\Routing\Router;
use Illuminate\Support\ServiceProvider;

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
        $this->app->register(\Dingo\Api\Provider\LaravelServiceProvider::class);
        $this->app->register(\Tymon\JWTAuth\Providers\LaravelServiceProvider::class);
    }

    /**
     * Register routes and stuff.
     */
    public function boot()
    {
        if (! $this->app->routesAreCached()) {
            $this->apiRoutes();
        }
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
                require __DIR__.'/../Http/Routes/'.$version.'.php';
            });
        }
    }
}
