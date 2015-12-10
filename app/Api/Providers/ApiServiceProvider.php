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

//        $this->bindTransformer();
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
     * Set up the transformer.
     */
    private function bindTransformer()
    {
        $this->app->bind('League\Fractal\Manager', function($app) {
            $fractal = new \League\Fractal\Manager;
            $fractal->setSerializer(new \League\Fractal\Serializer\ArraySerializer());

            return $fractal;
        });

        $this->app->bind('Dingo\Api\Transformer\Adapter\Fractal', function($app) {
            $fractal = $app->make('\League\Fractal\Manager');

            return new \Dingo\Api\Transformer\Adapter\Fractal($fractal);
        });
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
