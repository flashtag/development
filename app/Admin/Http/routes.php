<?php

// Authentication routes...
$router->get('auth/login', 'Auth\AuthController@getLogin');
$router->post('auth/login', 'Auth\AuthController@postLogin');
$router->get('auth/logout', 'Auth\AuthController@getLogout');

$router->group(['middleware' => 'auth'], function ($router) {
    // Admin dashboard
    $router->get('/', function () {
        $user = \Auth::user();
        $token = \JWTAuth::fromUser($user);

        return view('admin::admin', compact('user', 'token'));
    });
});
