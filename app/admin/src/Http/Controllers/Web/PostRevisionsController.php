<?php

namespace Flashtag\Admin\Http\Controllers\Web;

use Flashtag\Admin\Http\Controllers\Controller;
use Flashtag\Posts\Post;
use Venturecraft\Revisionable\Revision;

class PostRevisionsController extends Controller
{
    public function index($post_id)
    {
        $post = Post::with('revisions')->findOrfail($post_id);

        return view('admin::posts.revisions.index', compact('post'));
    }

    public function show($post_id, $revision_id)
    {
        $revision = Revision::findOrfail($revision_id);

        return view('admin::posts.revisions.show', compact('post_id', 'revision'));
    }
}