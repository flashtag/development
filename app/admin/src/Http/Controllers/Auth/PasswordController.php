<?php

namespace Flashtag\Admin\Http\Controllers\Auth;

use Flashtag\Admin\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\ResetsPasswords;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class PasswordController extends Controller
{
    use ResetsPasswords;

    /**
     * @var string
     */
    protected $redirectPath = '/admin';

    /**
     * Create a new password controller instance.
     */
    public function __construct()
    {
        $this->middleware('guest', ['except' => 'postEmail']);
    }

    /**
     * Display the form to request a password reset link.
     *
     * @return \Illuminate\Http\Response
     */
    public function getEmail()
    {
        return view('admin::auth.password');
    }

    /**
     * Display the password reset view for the given token.
     *
     * @param  string $token
     * @return \Illuminate\Http\Response
     * @throws \Symfony\Component\HttpKernel\Exception\NotFoundHttpException
     */
    public function getReset($token = null)
    {
        if (is_null($token)) {
            throw new NotFoundHttpException;
        }

        return view('admin::auth.reset')->with('token', $token);
    }
}
