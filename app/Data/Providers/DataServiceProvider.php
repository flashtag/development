<?php

namespace Flashtag\Data\Providers;

use Flashtag\Data\Setting;
use Flashtag\Data\Settings\Settings;
use Illuminate\Contracts\Http\Kernel;
use Illuminate\Support\ServiceProvider;
use Flashtag\Data\Settings\SettingsMiddleware;
use Illuminate\Database\Eloquent\Relations\Relation;
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
        \Intervention\Image\ImageServiceProvider::class,
    ];

    protected $aliases = [
        'Image' => \Intervention\Image\Facades\Image::class,
    ];

    /**
     * Register bindings in the container.
     */
    public function register()
    {
        $this->registerBindings();
        $this->registerServiceProviders();
        $this->registerAliases();
    }

    /**
     * Perform post-registration booting of services.
     */
    public function boot(Kernel $kernel)
    {
        $this->registerPublishes();

        $kernel->pushMiddleware(SettingsMiddleware::class);

        // morph mapping
        Relation::morphMap([
            'post' => \Flashtag\Data\Post::class,
        ]);
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
     * Register the aliases from vendor packages.
     */
    protected function registerAliases()
    {
        $loader = \Illuminate\Foundation\AliasLoader::getInstance();

        foreach ($this->aliases as $alias => $class) {
            $loader->alias($alias, $class);
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
            __DIR__.'/../config/settings.php' => config_path('settings.php'),
            __DIR__.'/../config/site.php' => config_path('site.php')
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
