<?php

namespace Flashtag\Admin\Http\Controllers;

use Flashtag\Data\Page;
use Venturecraft\Revisionable\Revision;

class PageRevisionsController extends Controller
{
    public function index($page_id)
    {
        $page = Page::with('revisions')->findOrfail($page_id);

        return view('admin::pages.revisions.index', compact('page'));
    }

    public function show($page_id, $revision_id)
    {
        $revision = Revision::findOrfail($revision_id);

        return view('admin::pages.revisions.show', compact('page_id', 'revision'));
    }
}