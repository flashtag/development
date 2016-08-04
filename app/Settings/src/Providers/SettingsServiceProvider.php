<?php

namespace Flashtag\Settings\Providers;

use Flashtag\Settings\Setting;
use Flashtag\Settings\Settings;
use Flashtag\Settings\SettingsMiddleware;
use Illuminate\Support\ServiceProvider;

class SettingsServiceProvider extends ServiceProvider
{
    /**
     * Register bindings in the container.
     */
    public function register()
    {
        $this->app->singleton('settings', function ($app) {
            return new Settings(
                $app['cache.store'],
                $app['config'],
                $app['events'],
                new Setting()
            );
        });

        $this->app->alias('settings', Settings::class);

        $this->app->register(EventServiceProvider::class);
    }

    /**
     * Perform post-registration booting of services.
     */
    public function boot()
    {
        // Config
        $this->publishes([
            __DIR__.'/../config/settings.php' => config_path('settings.php')
        ], 'config');

        // Migrations
        $this->publishes([
            __DIR__.'/../database/migrations/' => database_path('migrations')
        ], 'migrations');

        $this->app->router->middleware('settings', SettingsMiddleware::class);
    }
}
