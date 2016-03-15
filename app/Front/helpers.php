<?php

/**
 * Return a route pattern matching all the available pages.
 *
 * @return string
 */
function pageRoutesPattern()
{
    try {
        return implode('|', \Flashtag\Data\Page::lists('slug')->all());
    } catch (\PDOException $e) {
        return '';
    }
}
