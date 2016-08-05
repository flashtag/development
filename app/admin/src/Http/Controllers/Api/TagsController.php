<?php

namespace Flashtag\Admin\Http\Controllers\Api;

use Flashtag\Admin\Http\Controllers\Controller;
use Flashtag\Posts\Tag;

class TagsController extends Controller
{
    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $tags = Tag::orderBy('created_at', 'desc')
            ->get();

        return response()->json($tags);
    }

    /**
     * @param Request $request
     */
    public function store(Request $request)
    {
        Tag::create($request->all());
    }

    /**
     * @param Request $request
     * @param int $id
     */
    public function update(Request $request, $id)
    {
        $field = Tag::findOrFail($id);
        $field->update($request->all());
    }

    /**
     * @param int $id
     */
    public function destroy($id)
    {
        $field = Tag::findOrFail($id);
        $field->delete();
    }
}
