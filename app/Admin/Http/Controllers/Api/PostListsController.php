<?php

namespace Flashtag\Admin\Http\Controllers\Api;

use Flashtag\Admin\Http\Controllers\Controller;
use Flashtag\Data\PostList;
use Illuminate\Http\Request;

class PostListsController extends Controller
{
    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $lists = PostList::orderBy('created_at', 'desc')
            ->get();

        return response()->json($lists);
    }

    /**
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $list = PostList::with('posts.category')
            ->findOrFail($id);

        return response()->json($list);
    }

    /**
     * @param Request $request
     */
    public function store(Request $request)
    {
        PostList::create($request->all());
    }

    /**
     * @param Request $request
     * @param int $id
     */
    public function update(Request $request, $id)
    {
        $field = PostList::findOrFail($id);
        $field->update($request->all());
    }

    /**
     * @param int $id
     */
    public function destroy($id)
    {
        $field = PostList::findOrFail($id);
        $field->delete();
    }

    public function addPost(Request $request, $id)
    {
        $list = PostList::findOrFail($id);
        $post = $request->json('post');

        $list->posts()->sync([$post['id']], false);
    }
}
