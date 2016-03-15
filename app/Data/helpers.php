<?php

/**
 * Helper method for getting and setting settings
 *
 * @param mixed $key
 * @return mixed
 */
function settings(...$key)
{
    $settings = app('settings');

    if (empty($key)) {
        return $settings;
    }

    return $settings(...$key);
}
