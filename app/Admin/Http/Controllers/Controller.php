<?php

namespace Flashtag\Admin\Http\Controllers;

use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Tymon\JWTAuth\JWTAuth;

abstract class Controller extends BaseController
{
    use AuthorizesRequests, DispatchesJobs, ValidatesRequests;

    protected $auth;

    public function __construct(JWTAuth $auth)
    {
        $this->auth = $auth;

        if (auth()->check()) {
            $this->setTokenToSession();
        }
    }

    /**
     * Store the JWT into the session.
     */
    private function setTokenToSession()
    {
        session([
            'jwt' => $this->auth->fromUser($this->auth->user())
        ]);
    }
}
