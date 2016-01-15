<?php

namespace Flashtag\Admin\Http\Controllers;

use Auth;
use Tymon\JWTAuth\JWTAuth;

class HomeController extends Controller
{
    public function home()
    {
        $user = Auth::user();
        $auth = app(JWTAuth::class);
        $token = $auth->fromUser($user);

        return  view('admin::admin', compact('user', 'token'));
    }
}