<?php

use Illuminate\Routing\Router;

/**
 * @var Router $router
 */

// ----------------------------------------------------------------------------------------
// Public routes
// ----------------------------------------------------------------------------------------

// Authentication Routes...
$router->get('login', 'Auth\LoginController@showLoginForm')->name('login');
$router->post('login', 'Auth\LoginController@login');
$router->post('logout', 'Auth\LoginController@logout');

// Password Reset Routes...
$router->get('password/reset', 'Auth\ForgotPasswordController@showLinkRequestForm');
$router->post('password/email', 'Auth\ForgotPasswordController@sendResetLinkEmail');
$router->get('password/reset/{token}', 'Auth\ResetPasswordController@showResetForm');
$router->post('password/reset', 'Auth\ResetPasswordController@reset');

// ----------------------------------------------------------------------------------------
// Authenticated routes
// ----------------------------------------------------------------------------------------

// Admin routes
$router->group(['middleware' => 'auth'], function (Router $router) {
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
