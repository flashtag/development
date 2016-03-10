<?php

/**
 * @var \Dingo\Api\Routing\Router $api
 */

// ----------------------------------------------------------------------------------------
// Public routes
// ----------------------------------------------------------------------------------------

$api->group(['prefix' => 'auth'], function ($api) {
    $api->post('/', 'AuthController@authenticate');
    $api->get('user/me', 'AuthController@me');
});

// ----------------------------------------------------------------------------------------
// Authenticated routes
// ----------------------------------------------------------------------------------------

$api->group(['middleware' => ['api.auth', 'jwt.refresh']], function ($api) {
    // Posts
    $api->patch('posts/{id}/publish', 'PostsController@publish');
    $api->patch('posts/{id}/lock', 'PostsController@lock');
    $api->patch('posts/{id}/unlock', 'PostsController@unlock');
    $api->patch('posts/{id}/property', 'PostsController@property');
    $api->patch('posts/{id}/reorder', 'PostsController@reorder');
    $api->post('posts/{id}/image', 'PostsController@addImage');
    $api->delete('posts/{id}/image', 'PostsController@deleteImage');
    $api->resource('posts', 'PostsController', ['except' => ['create', 'edit']]);
    // Tags
    $api->resource('tags', 'TagsController', ['except' => ['create', 'edit']]);
    // Categories
    $api->post('categories/{id}/image', 'CategoriesController@addImage');
    $api->delete('categories/{id}/image', 'CategoriesController@deleteImage');
    $api->resource('categories', 'CategoriesController', ['except' => ['create', 'edit']]);
    // Post fields
    $api->resource('fields', 'FieldsController', ['except' => ['create', 'edit']]);
    // Post lists
    $api->resource('post-lists', 'PostListsController', ['except' => ['create', 'edit']]);
    // Authors
    $api->resource('authors', 'AuthorsController', ['except' => ['create', 'edit']]);
    // Users
    $api->resource('users', 'UsersController', ['except' => ['create', 'edit']]);
    // Settings
    $api->resource('settings', 'SettingsController', ['except' => ['create', 'edit']]);
    // Revisions
    $api->get('revisions/{id}', 'RevisionsController@show');
});
