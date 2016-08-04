<?php

namespace Flashtag\Core\Providers;

use Flashtag\Core\Setting;
use Flashtag\Core\Settings\Settings;
use Flashtag\Core\Settings\SettingsMiddleware;
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
