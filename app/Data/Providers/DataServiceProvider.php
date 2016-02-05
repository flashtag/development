<?php

namespace Flashtag\Data\Providers;

use Flashtag\Data\Presenters\Decorators\PostFieldDecorator;
use Illuminate\Support\ServiceProvider;
use McCool\LaravelAutoPresenter\AutoPresenterServiceProvider;

class DataServiceProvider extends ServiceProvider
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
        $this->registerServiceProviders();
        $this->registerPresenterDecorators();
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
     * Register decorators for auto presenter.
     */
    private function registerPresenterDecorators()
    {
        $this->app['autopresenter']->register(new PostFieldDecorator());
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
    }
}
