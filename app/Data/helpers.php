<?php

/**
 * Helper method for getting and setting settings
 *
 * @return mixed
 */
function settings()
{
    $settings = app('settings');
    $key = func_get_args();

    if (empty($key)) {
        return $settings;
    }

    return call_user_func_array($settings, $key);
}
