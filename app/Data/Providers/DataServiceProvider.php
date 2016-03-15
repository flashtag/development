<?php

namespace Flashtag\Data\Providers;

use Flashtag\Data\Setting;
use Flashtag\Data\Settings\Settings;
use Illuminate\Contracts\Http\Kernel;
use Illuminate\Support\ServiceProvider;
use Flashtag\Data\Settings\SettingsMiddleware;
use Flashtag\Data\Presenters\Decorators\ModelDecorator;
use McCool\LaravelAutoPresenter\Decorators\AtomDecorator;
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
        $this->registerBindings();
        $this->registerServiceProviders();
    }

    /**
     * Perform post-registration booting of services.
     */
    public function boot(Kernel $kernel)
    {
        $this->registerPublishes();

        $kernel->pushMiddleware(SettingsMiddleware::class);
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

        $this->app->singleton('settings', function ($app) {
            return new Settings($app['cache.store'], $app['config'], $app['events'], new Setting);
        });

        $this->app->alias('settings', Settings::class);
    }

    /**
     * Register file publishes.
     */
    private function registerPublishes()
    {
        // Config
        $this->publishes([
            __DIR__.'/../config/settings.php' => config_path('settings.php')
        ], 'config');

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
