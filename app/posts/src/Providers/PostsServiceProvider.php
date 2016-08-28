<?php

namespace Flashtag\Posts\Providers;

use Flashtag\Core\Providers\PluginServiceProvider;
use Flashtag\Posts\Presenters\Decorators\ModelDecorator;
use McCool\LaravelAutoPresenter\AutoPresenterServiceProvider;
use McCool\LaravelAutoPresenter\Decorators\AtomDecorator;

class PostsServiceProvider extends PluginServiceProvider
{
    /**
     * Package service providers that need to be registered.
     *
     * @var array
     */
    protected $providers = [
        AutoPresenterServiceProvider::class,
        EventServiceProvider::class,
    ];

    /**
     * Register bindings in the container.
     */
    public function register()
    {
        $this->registerBindings();
        $this->registerServiceProviders();
    }

    /**
     * Perform post-registration booting of services.
     */
    public function boot()
    {
        $this->registerPublishes();
        $this->mergeMenuFrom(__DIR__.'/../../config/menu.php', 'posts');
    }

    /**
     * Register service providers from vendor packages.
     */
    private function registerServiceProviders()
    {
        foreach ($this->providers as $provider) {
            $this->app->register($provider);
        }
    }

    /**
     * Register container bindings.
     */
    private function registerBindings()
    {
        $this->app->bind(AtomDecorator::class, ModelDecorator::class);
    }

    /**
     * Register file publishes.
     */
    private function registerPublishes()
    {
        // Migrations
        $this->publishes([
            __DIR__.'/../database/migrations/' => database_path('migrations')
        ], 'migrations');

        // Model Factories
        $this->publishes([
            __DIR__.'/../database/factories/' => database_path('factories')
        ], 'factories');
    }
}
