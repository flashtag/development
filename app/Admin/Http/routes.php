<?php

// Authentication routes...
$router->get('auth/login', 'Auth\AuthController@getLogin');
$router->post('auth/login', 'Auth\AuthController@postLogin');
$router->get('auth/logout', 'Auth\AuthController@getLogout');

// Password reset link request routes...
$router->get('password/email', 'Auth\PasswordController@getEmail');
$router->post('password/email', 'Auth\PasswordController@postEmail');

// Password reset routes...
$router->get('password/reset/{token}', 'Auth\PasswordController@getReset');
$router->post('password/reset', 'Auth\PasswordController@postReset');

$router->group(['middleware' => 'auth'], function ($router) {
    // Admin dashboard
    $router->get('/', function () {
        $user = \Auth::user();
        $token = \JWTAuth::fromUser($user);

        return  view('admin::admin', compact('user', 'token'));
    });
});
