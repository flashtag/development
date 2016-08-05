<?php

namespace Flashtag\Admin\Http\Controllers\Api;

use Flashtag\Admin\Http\Controllers\Controller;
use Flashtag\Posts\Field;
use Illuminate\Http\Request;

class PostFieldsController extends Controller
{
    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $fields = Field::orderBy('created_at', 'desc')->get();

        return response()->json($fields);
    }

    /**
     * @param Request $request
     */
    public function store(Request $request)
    {
        Field::create($request->all());
    }

    /**
     * @param Request $request
     * @param int $id
     */
    public function update(Request $request, $id)
    {
        $field = Field::findOrFail($id);
        $field->update($request->all());
    }

    /**
     * @param int $id
     */
    public function destroy($id)
    {
        $field = Field::findOrFail($id);
        $field->delete();
    }
}