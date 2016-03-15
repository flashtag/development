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
    return \Request::segment(2) == $path ? $active : '';
}
