<?php

namespace Flashtag\Admin\Http\Controllers\Api;

use Flashtag\Admin\Http\Controllers\Controller;
use Flashtag\Data\PostList;

class PostListsController extends Controller
{
    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $lists = PostList::with('posts')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($lists);
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
}
