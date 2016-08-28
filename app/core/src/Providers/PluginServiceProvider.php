<?php

namespace Flashtag\Core\Providers;

use Illuminate\Support\ServiceProvider;

abstract class PluginServiceProvider extends ServiceProvider
{
    /**
     * Register your views.
     *
     * @param string $namespace
     * @param string $path
     */
    protected function registerViews($namespace, $path)
    {
        $this->app['view']->prependNamespace($namespace, $path);
    }

    /**
     * Merge the given configuration with the existing configuration.
     *
     * @param  string  $view
     */
    protected function addToMenu($view)
    {
        $this->app['menu']->add(null, $view);
    }

    /**
     * @param string $path
     * @param string $key
     */
    protected function mergeMenuFrom($path, $key = null)
    {
        $menu = $key ? $this->app['menu']->get($key, []) : $this->app['menu']->all();

        $this->app['menu']->set($key, array_merge(require $path, $menu));
    }
}
