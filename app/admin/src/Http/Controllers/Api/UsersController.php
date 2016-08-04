<?php

namespace Flashtag\Admin\Http\Controllers\Api;

use Flashtag\Admin\Http\Controllers\Controller;
use Flashtag\Data\User;

class UsersController extends Controller
{
    public function __construct()
    {
        $this->middleware('admin');
    }

    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $users = User::orderBy('created_at', 'desc')
            ->get();

        return response()->json($users);
    }

    /**
     * @param Request $request
     */
    public function store(Request $request)
    {
        User::create($request->all());
    }

    /**
     * @param Request $request
     * @param int $id
     */
    public function update(Request $request, $id)
    {
        $field = User::findOrFail($id);
        $field->update($request->all());
    }

    /**
     * @param int $id
     */
    public function destroy($id)
    {
        $field = User::findOrFail($id);
        $field->delete();
    }
}
