<?php

namespace Flashtag\Front\Http\Controllers;

use Flashtag\Data\Page;
use Flashtag\Front\Http\Controllers\Controller;

class PagesController extends Controller
{
    /**
     * Display the specified resource.
     *
     * @param string $page_slug
     * @return \Illuminate\Http\Response
     */
    public function show($page_slug)
    {
        $page = Page::getBySlug($page_slug);

        $template = $page->template ?: 'flashtag::pages.default';
        $template .= '-page';

        return view($template, compact('page'));
    }
}
