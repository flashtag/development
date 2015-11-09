<?php

namespace Flashtag\Admin\Providers;

use Illuminate\Support\ServiceProvider;

class AdminServiceProvider extends ServiceProvider
{
    public function register()
    {
        //
    }

    public function boot()
    {
        $this->loadViewsFrom(__DIR__.'/../resources/views', 'admin');

        if (! $this->app->routesAreCached()) {
            $this->app['router']->group([
                'prefix' => 'admin',
                'namespace' => 'Flashtag\Admin\Http\Controllers'
            ], function ($router) {
                require __DIR__.'/../Http/routes.php';
            });
        }
    }
}
