<?php

/**
 * @var \Illuminate\Routing\Router $router
 */

// ----------------------------------------------------------------------------------------
// Public routes
// ----------------------------------------------------------------------------------------

// Authentication routes
$router->get('auth/login', 'Auth\AuthController@getLogin');
$router->post('auth/login', 'Auth\AuthController@postLogin');
$router->get('auth/logout', 'Auth\AuthController@getLogout');

// Password reset link request routes
$router->get('password/email', 'Auth\PasswordController@getEmail');
$router->post('password/email', 'Auth\PasswordController@postEmail');

// Password reset routes
$router->get('password/reset/{token}', 'Auth\PasswordController@getReset');
$router->post('password/reset', 'Auth\PasswordController@postReset');

// ----------------------------------------------------------------------------------------
// Authenticated routes
// ----------------------------------------------------------------------------------------

// Admin routes
$router->group(['middleware' => 'auth'], function ($router) {
    $router->get('/', 'HomeController@home');
    $router->resource('posts/{post_id}/revisions', 'PostRevisionsController', ['only' => ['index', 'show']]);
    $router->resource('posts', 'PostsController');
    $router->resource('post-fields', 'PostFieldsController');
    $router->resource('post-lists', 'PostListsController');
    $router->resource('pages/{page_id}/revisions', 'PageRevisionsController', ['only' => ['index', 'show']]);
    $router->resource('pages', 'PagesController');
    $router->resource('categories', 'CategoriesController');
    $router->resource('tags', 'TagsController');
    $router->resource('authors', 'AuthorsController');
    $router->resource('users', 'UsersController');
    $router->resource('settings', 'SettingsController', ['only' => ['index', 'store', 'destroy']]);
    $router->get('media/preview/{type}', 'MediaController@preview');
});
