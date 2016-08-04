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
    return in_array(\Request::segment(2), (array) $path)
        ? $active
        : '';
}
