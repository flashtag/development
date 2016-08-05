<?php

namespace Flashtag\Front\Http\Controllers;

use Flashtag\Posts\Page;
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

        if (! $page->isShowing()) {
            abort(404);
        }

        $template = $page->template ?: 'flashtag::page-templates.default';
        $template .= '-page';

        return view($template, compact('page'));
    }
}
