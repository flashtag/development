<?php

/**
 * Return a route pattern matching all the available pages.
 *
 * @return string
 */
function page_routes_pattern()
{
    try {
        $pages = \Flashtag\Core\Page::pluck('slug')->all();
    } catch (\PDOException $e) {
        $pages = null;
    }

    return implode('|', $pages ?: ['338e56cd45b6483dbe63c1616cd5feee']);
}
