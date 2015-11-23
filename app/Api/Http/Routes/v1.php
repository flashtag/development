<?php

$api->group(['prefix' => 'auth'], function ($api) {
    $api->post('/', 'AuthController@authenticate');
    $api->get('user/me', 'AuthController@me');
});


$api->group(['middleware' => ['api.auth', 'jwt.refresh']], function ($api) {

    // POSTS
    $api->patch('posts/{id}/publish', 'PostsController@publish');
    $api->patch('posts/{id}/lock', 'PostsController@lock');
    $api->patch('posts/{id}/unlock', 'PostsController@unlock');
    $api->patch('posts/{id}/property', 'PostsController@property');
    $api->patch('posts/{id}/reorder', 'PostsController@reorder');
    $api->resource('posts', 'PostsController', ['except' => ['create', 'edit']]);

    // TAGS
    $api->resource('tags', 'TagsController', ['except' => ['create', 'edit']]);

    // CATEGORIES
    $api->resource('categories', 'CategoriesController', ['except' => ['create', 'edit']]);

    // POST FIELDS
    $api->resource('fields', 'FieldsController', ['except' => ['create', 'edit']]);

    // AUTHORS
    $api->resource('authors', 'AuthorsController', ['except' => ['create', 'edit']]);

    // USERS
    $api->resource('users', 'UsersController', ['except' => ['create', 'edit']]);

    // REVISIONS
    $api->get('revisions/{id}', 'RevisionsController@show');

});
