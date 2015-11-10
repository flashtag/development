<?php

// Authentication routes...
$router->get('auth/login', 'Auth\AuthController@getLogin');
$router->post('auth/login', 'Auth\AuthController@postLogin');
$router->get('auth/logout', 'Auth\AuthController@getLogout');

$router->group(['middleware' => 'auth'], function ($router) {
    // Admin dashboard
    $router->get('/', function () {
        $user = \Auth::user();
        $view = view('admin::admin', compact('user'));

        return response($view, 200, [
            'Authorization' => 'Bearer ' . \JWTAuth::fromUser($user)
        ]);
    });
});
