<?php

namespace Flashtag\Admin\Http\Controllers\Api;

use Flashtag\Admin\Http\Controllers\Controller;
use Flashtag\Data\Category;

class CategoriesController extends Controller
{
    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $categories = Category::with('tags', 'parent')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($categories);
    }

    /**
     * @param Request $request
     */
    public function store(Request $request)
    {
        Category::create($request->all());
    }

    /**
     * @param Request $request
     * @param int $id
     */
    public function update(Request $request, $id)
    {
        $field = Category::findOrFail($id);
        $field->update($request->all());
    }

    /**
     * @param int $id
     */
    public function destroy($id)
    {
        $field = Category::findOrFail($id);
        $field->delete();
    }
}
