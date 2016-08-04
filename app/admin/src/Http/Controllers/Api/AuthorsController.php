<?php

namespace Flashtag\Admin\Http\Controllers\Api;

use Flashtag\Admin\Http\Controllers\Controller;
use Flashtag\Data\Author;

class AuthorsController extends Controller
{
    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $authors = Author::orderBy('created_at', 'desc')
            ->get();

        return response()->json($authors);
    }

    /**
     * @param Request $request
     */
    public function store(Request $request)
    {
        Author::create($request->all());
    }

    /**
     * @param Request $request
     * @param int $id
     */
    public function update(Request $request, $id)
    {
        $field = Author::findOrFail($id);
        $field->update($request->all());
    }

    /**
     * @param int $id
     */
    public function destroy($id)
    {
        $field = Author::findOrFail($id);
        $field->delete();
    }
}
