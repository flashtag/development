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
    $router->resource('posts', 'PostsController');
    $router->resource('posts/{post_id}/revisions', 'RevisionsController', ['only' => ['index', 'show']]);
    $router->resource('post-fields', 'PostFieldsController');
    $router->resource('post-lists', 'PostListsController');
    $router->resource('categories', 'CategoriesController');
    $router->resource('tags', 'TagsController');
    $router->resource('authors', 'AuthorsController');
    $router->resource('users', 'UsersController');
    $router->resource('settings', 'SettingsController');
    $router->get('media/preview/{type}', 'MediaController@preview');
});

// Admin API
$router->group(['prefix' => 'api', 'middleware' => 'auth'], function ($router) {
    $router->patch('posts/{post}/lock', 'Api\PostsController@lock');
    $router->patch('posts/{post}/unlock', 'Api\PostsController@unlock');
    $router->get('posts/search', 'Api\PostsController@search');
    $router->resource('posts', 'Api\PostsController', ['except' => ['edit', 'create']]);
    $router->resource('post-fields', 'Api\PostFieldsController', ['except' => ['edit', 'create']]);
    $router->post('post-lists/{postList}/posts', 'Api\PostListsController@addPost');
    $router->patch('post-lists/{postList}/reorder', 'Api\PostListsController@reorder');
    $router->resource('post-lists', 'Api\PostListsController', ['except' => ['edit', 'create']]);
    $router->resource('tags', 'Api\TagsController', ['except' => ['edit', 'create']]);
    $router->resource('categories', 'Api\CategoriesController', ['except' => ['edit', 'create']]);
    $router->resource('authors', 'Api\AuthorsController', ['except' => ['edit', 'create']]);
    $router->resource('users', 'Api\UsersController', ['except' => ['edit', 'create']]);
});
