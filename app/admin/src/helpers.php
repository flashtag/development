<?php

namespace Flashtag\Admin;

/**
 * Return active class is path matches.
 *
 * @param string $path
 * @param string $active
 * @return string
 */
function set_active($path, $active = 'active')
{
    return in_array(request()->segment(2), (array) $path)
        ? $active : '';
}

/**
 * Get or set the specified menu item.
 *
 * If an array is passed as the key, we will assume you want to set an array of values.
 *
 * @param  array|string  $key
 * @param  mixed  $default
 * @return mixed
 */
function menu($key = null, $default = null)
{
    if (is_null($key)) {
        return app('menu');
    }
    if (is_array($key)) {
        return app('menu')->add($key);
    }
    return app('menu')->get($key, $default);
}
