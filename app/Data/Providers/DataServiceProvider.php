<?php

namespace Flashtag\Data\Providers;

use Illuminate\Support\ServiceProvider;
use McCool\LaravelAutoPresenter\AutoPresenterServiceProvider;

class DataServiceProvider extends ServiceProvider
{
    protected $providers = [
        AutoPresenterServiceProvider::class,
        EventServiceProvider::class,
    ];

    public function register()
    {
        foreach ($this->providers as $provider) {
            $this->app->register($provider);
        }
    }

    public function boot()
    {
        $this->publishes([
            __DIR__.'/../../database/migrations/' => database_path('migrations')
        ], 'migrations');
    }
}
