<?php

namespace Flashtag\Posts\Providers;

use Flashtag\Posts\Presenters\Decorators\ModelDecorator;
use Illuminate\Support\ServiceProvider;
use McCool\LaravelAutoPresenter\AutoPresenterServiceProvider;
use McCool\LaravelAutoPresenter\Decorators\AtomDecorator;

class PostsServiceProvider extends ServiceProvider
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
