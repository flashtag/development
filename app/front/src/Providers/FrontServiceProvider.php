<?php

namespace Flashtag\Front\Providers;

use Flashtag\Front\Console\Commands;
use Flashtag\Front\Theme;
use Illuminate\Routing\Router;
use Illuminate\Support\ServiceProvider;

class FrontServiceProvider extends ServiceProvider
{
    public function boot(Router $router)
    {
        $this->app['view']->prependNamespace('flashtag', Theme::viewLocations());

        if (! $this->app->routesAreCached()) {
            $router->group([
                'namespace' => 'Flashtag\Front\Http\Controllers'
            ], function ($router) {
                require __DIR__.'/../../routes/web.php';
            });
        }
    }

    public function register()
    {
        $this->commands([
            Commands\InstallTheme::class,
        ]);
    }
}
