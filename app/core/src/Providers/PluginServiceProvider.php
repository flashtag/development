<?php

namespace Flashtag\Core\Providers;

use Illuminate\Support\ServiceProvider;

abstract class PluginServiceProvider extends ServiceProvider
{
    /**
     * Merge the given configuration with the existing configuration.
     *
     * @param  mixed  $key
     * @param  mixed|null  $value
     */
    protected function addToMenu($key, $value = null)
    {
        $this->app['menu']->add($key, $value);
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
