<?php

namespace Scribbl\Providers;

use Illuminate\Support\ServiceProvider;
use McCool\LaravelAutoPresenter\AutoPresenterServiceProvider;

class ScribblCoreServiceProvider extends ServiceProvider
{
    protected $providers = [
        AutoPresenterServiceProvider::class,
    ];

    public function register()
    {
        foreach ($providers as $provider) {
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
