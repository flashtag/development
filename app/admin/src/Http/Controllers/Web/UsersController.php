<?php

namespace Flashtag\Admin\Http\Controllers\Web;

use Flashtag\Admin\Http\Controllers\Controller;
use Flashtag\Admin\Http\Requests\UserCreateRequest;
use Flashtag\Admin\Http\Requests\UserDestroyRequest;
use Flashtag\Admin\Http\Requests\UserUpdateRequest;
use Flashtag\Auth\User;

class UsersController extends Controller
{
    /**
     * Register middleware and stuff.
     */
    public function __construct()
    {
        $this->middleware('admin');
    }

    /**
     * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View
     */
    public function index()
    {
        return view('admin::users.index');
    }

    /**
     * @param int $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function show($id)
    {
        return redirect()->route('admin::users.edit', [$id], 301);
    }

    /**
     * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View
     */
    public function create()
    {
        $user = new User();

        return view('admin::users.create', compact('user'));
    }

    /**
     * @param UserCreateRequest $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(UserCreateRequest $request)
    {
        $user = User::create($this->buildUserFromRequest($request));

        return redirect()->route('admin::users.index');
    }

    /**
     * @param int $id
     * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View
     */
    public function edit($id)
    {
        $user = User::findOrFail($id);

        return view('admin::users.edit', compact('user'));
    }

    /**
     * @param UserUpdateRequest $request
     * @param int $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(UserUpdateRequest $request, $id)
    {
        $user = User::findOrFail($id);
        $user->update($this->buildUserFromRequest($request));

        return redirect()->route('admin::users.index');
    }

    /**
     * @param UserDestroyRequest $request
     * @param int $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(UserDestroyRequest $request, $id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return redirect()->route('admin::users.index');
    }

    /**
     * @param \Illuminate\Http\Request $request
     * @return array
     */
    private function buildUserFromRequest($request)
    {
        $data['email'] = $request->get('email');
        $data['name'] = $request->get('name');
        $data['admin'] = $request->get('admin', false);
        if ($request->has('password')) {
            $data['password'] = bcrypt($request->get('password'));
        }

        return $data;
    }
}