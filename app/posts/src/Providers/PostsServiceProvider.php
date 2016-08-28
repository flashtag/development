<?php

namespace Flashtag\Posts\Providers;

use Flashtag\Core\Providers\PluginServiceProvider;
use Flashtag\Posts\Presenters\Decorators\ModelDecorator;
use Illuminate\Foundation\AliasLoader;
use Intervention\Image\Facades\Image;
use Intervention\Image\ImageServiceProvider;
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
        ImageServiceProvider::class,
    ];

    protected $aliases = [
        'Image' => Image::class,
    ];

    /**
     * Register bindings in the container.
     */
    public function register()
    {
        $this->app->bind(AtomDecorator::class, ModelDecorator::class);
        $this->registerServiceProviders();
        $this->registerAliases();
    }

    /**
     * Register service providers from vendor packages.
     */
    protected function registerServiceProviders()
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
        $loader = AliasLoader::getInstance();
        foreach ($this->aliases as $alias => $class) {
            $loader->alias($alias, $class);
        }
    }

    /**
     * Perform post-registration booting of services.
     */
    public function boot()
    {
        $this->registerPublishes();
        $this->registerViews('posts', __DIR__.'/../../views');
        $this->addToMenu('posts::menu');
    }

    /**
     * Register file publishes.
     */
    protected function registerPublishes()
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
