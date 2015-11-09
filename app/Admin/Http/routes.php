<?php

// Authentication routes...
$router->get('auth/login', 'Auth\AuthController@getLogin');
$router->post('auth/login', 'Auth\AuthController@postLogin');
$router->get('auth/logout', 'Auth\AuthController@getLogout');

$router->group(['middleware' => 'auth'], function ($router) {
    // Registration routes...
    $router->get('auth/register', 'Auth\AuthController@getRegister');
    $router->post('auth/register', 'Auth\AuthController@postRegister');

    // Admin dashboard
    $router->get('/', function () {
        return view('admin::admin');
    });
});
