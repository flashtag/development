<?php

namespace Flashtag\Api\Providers;

use Dingo\Api\Auth\Provider\JWT;
use Dingo\Api\Provider\LaravelServiceProvider as DingoServiceProvider;
use Dingo\Api\Routing\Router;
use Illuminate\Support\ServiceProvider;
use Tymon\JWTAuth\Providers\LaravelServiceProvider as JWTAuthServiceProvider;

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
        $this->app->register(DingoServiceProvider::class);
        $this->app->register(JWTAuthServiceProvider::class);

        $this->configOverrides();

//        $this->app['Dingo\Api\Transformer\Factory']->setTransformer(function ($app) {
//            $fractal = new \League\Fractal\Manager;
//            $fractal->setSerializer(new YourSerializer);
//            return new \Dingo\Api\Transformer\Adapter\Fractal($fractal, 'include', ',');
//        });
    }

    /**
     * Set configuration overrides.
     */
    private function configOverrides()
    {
        $this->app['config']->set('api.auth', ['jwt' => JWT::class]);
        $this->app['config']->set('jwt.blacklist_grace_period', env('JWT_BLACKLIST_GRACE_PERIOD', 60));
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
            ], function ($api) use ($version) {
                require __DIR__.'/../Http/Routes/'.$version.'.php';
            });
        }
    }
}
