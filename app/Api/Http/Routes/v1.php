<?php

$api->group(['prefix' => 'auth'], function ($api) {
    $api->post('/', 'AuthController@authenticate');
    $api->get('user/me', 'AuthController@me');
});


$api->group(['middleware' => ['api.auth', 'jwt.refresh']], function ($api) {

    $api->patch('posts/{id}/publish', 'PostsController@publish');
    $api->patch('posts/{id}/lock', 'PostsController@lock');
    $api->patch('posts/{id}/unlock', 'PostsController@unlock');
    $api->patch('posts/{id}/property', 'PostsController@property');
    $api->resource('posts', 'PostsController', ['except' => ['create', 'edit']]);

    $api->resource('tags', 'TagsController', ['except' => ['create', 'edit']]);

    $api->resource('categories', 'CategoriesController', ['except' => ['create', 'edit']]);

    $api->resource('fields', 'FieldsController', ['except' => ['create', 'edit']]);

    $api->resource('authors', 'AuthorsController', ['except' => ['create', 'edit']]);

    $api->resource('users', 'UsersController', ['except' => ['create', 'edit']]);

    $api->get('revisions/{id}', 'RevisionsController@show');

});
