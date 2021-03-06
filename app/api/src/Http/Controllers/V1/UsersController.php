<?php

namespace Flashtag\Api\Http\Controllers\V1;

use Flashtag\Api\Http\Requests\Users\CreateUserRequest;
use Illuminate\Http\Request;
use Flashtag\Api\Transformers\UserTransformer;
use Flashtag\Auth\User;

class UsersController extends Controller
{
    /**
     * @var \Flashtag\Auth\User
     */
    private $user;

    /**
     * @param \Flashtag\Auth\User $user
     */
    public function __construct(User $user)
    {
        $this->user = $user;
    }

    /**
     * Display a listing of the users.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Dingo\Api\Http\Response
     */
    public function index(Request $request)
    {
        $count = $request->get('count', 100);
        $users = $this->user->paginate($count);

        $this->appendPaginationLinks($users, $request);

        return $this->response->paginator($users, new UserTransformer());
    }

    /**
     * Display the specified user.
     *
     * @param int $id
     * @return \Dingo\Api\Http\Response
     */
    public function show($id)
    {
        $user = $this->user->findOrFail($id);

        return $this->response->item($user, new UserTransformer());
    }

    /**
     * Store a newly created user in storage.
     *
     * @param \Flashtag\Api\Http\Requests\CreateUserRequest $request
     * @return \Dingo\Api\Http\Response
     */
    public function store(CreateUserRequest $request)
    {
        $user = User::create([
            'email' => $request->get('email'),
            'name' => $request->get('name'),
            'password' => bcrypt($request->get('password')),
        ]);

        return $this->response->item($user, new UserTransformer());
    }

    /**
     * Update the specified user in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @param  int $id
     * @return \Dingo\Api\Http\Response
     */
    public function update(Request $request, $id)
    {
        $userData = $this->buildUserFromRequest($request);
        $user = $this->user->findOrFail($id);
        $user->update($userData);

        return $this->response->item($user, new UserTransformer());
    }

    /**
     * Build the user data array from the request.
     *
     * @param \Illuminate\Http\Request $request
     * @return array
     */
    private function buildUserFromRequest(Request $request)
    {
        return [
            'email' => $request->get('email'),
            'name' => $request->get('name'),
//            'role' => $request->get('role'),
        ];
    }

    /**
     * Remove the specified user from storage.
     *
     * @param  int $id
     * @return \Dingo\Api\Http\Response
     */
    public function destroy($id)
    {
        $user = $this->user->findOrFail($id);
        $user->delete();

        return $this->response->item($user, new UserTransformer());
    }
}
