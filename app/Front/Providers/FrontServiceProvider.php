<?php

namespace Flashtag\Front\Providers;

use Illuminate\Routing\Router;
use Illuminate\Support\ServiceProvider;

class FrontServiceProvider extends ServiceProvider
{
    /**
     * The default theme to fall back to.
     *
     * @var string
     */
    private $defaultTheme = 'clean-creative';

    public function boot(Router $router)
    {
        $this->app['view']->prependNamespace('flashtag', [
            base_path('resources/views/vendor/themes/'.settings('theme')),
            base_path('resources/views/vendor/themes/'.$this->defaultTheme),
        ]);

        if (! $this->app->routesAreCached()) {
            $router->group([
                'namespace' => 'Flashtag\Front\Http\Controllers'
            ], function ($router) {
                require __DIR__.'/../Http/routes.php';
            });
        }
    }

    public function register()
    {
        //
    }
}
