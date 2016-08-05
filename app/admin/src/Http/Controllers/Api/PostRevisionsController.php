<?php

namespace Flashtag\Admin\Http\Controllers\Api;

use Flashtag\Admin\Http\Controllers\Controller;
use Flashtag\Posts\Post;
use Venturecraft\Revisionable\Revision;

class PostRevisionsController extends Controller
{
    public function index($post_id)
    {
        $post = Post::with('revisions')->findOrfail($post_id);

        return response()->json($post);
    }

    public function show($post_id, $revision_id)
    {
        $revision = Revision::findOrfail($revision_id);

        return response()->json($revision);
    }
}