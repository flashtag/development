<?php

namespace Scribbl\Api;

use Illuminate\Support\ServiceProvider;

class ScribblApiServiceProvider extends ServiceProvider
{
    public function register()
    {
        $this->app->bind(DataFormatter::class, FractalDataFormatter::class);
    }

    public function boot()
    {
        // Routes
        if (! $this->app->routesAreCached()) {
            $this->app['router']->group([
                'prefix'    => 'api',
                'namespace' => 'Scribbl\Api\Http\Controllers',
            ], function ($router) {
                require __DIR__ . '/Http/routes.php';
            });
        }
    }
}