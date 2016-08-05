<?php

namespace Flashtag\Admin\Http\Controllers\Api;

use Flashtag\Admin\Http\Controllers\Controller;
use Flashtag\Posts\PostList;
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
        $list = PostList::findOrFail($id);
        $list->update($request->all());
    }

    /**
     * @param int $id
     */
    public function destroy($id)
    {
        $list = PostList::findOrFail($id);
        $list->delete();
    }

    /**
     * @param Request $request
     * @param int $id
     */
    public function addPost(Request $request, $id)
    {
        $list = PostList::findOrFail($id);
        $list->addPost(
            $request->get('post_id'),
            $request->get('position', 1)
        );
    }

    /**
     * @param int $list_id
     * @param int $post_id
     */
    public function removePost($list_id, $post_id)
    {
        $list = PostList::findOrFail($list_id);
        $list->removePost($post_id);
    }

    /**
     * @param Request $request
     * @param int $id
     */
    public function reorder(Request $request, $id)
    {
        $list = PostList::findOrFail($id);
        $list->reorder(
            $request->get('post_id'),
            $request->get('order')
        );
    }
}
