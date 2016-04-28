<?php

/**
 * Return a route pattern matching all the available pages.
 *
 * @return string
 */
function pageRoutesPattern()
{
    try {
        $pages = \Flashtag\Data\Page::lists('slug')->all();
    } catch (\PDOException $e) {
        $pages = null;
    }

    return implode('|', $pages ?: ['338e56cd45b6483dbe63c1616cd5feee']);
}
