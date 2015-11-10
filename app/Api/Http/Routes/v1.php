<?php

$api->group(['prefix' => 'auth'], function ($api) {
    $api->post('/', 'AuthController@authenticate');
    $api->get('user/me', 'AuthController@me');
});


$api->group(['middleware' => ['api.auth', 'jwt.refresh']], function ($api) {

    $api->put('posts/{id}/publish', 'PostsController@publish');
    $api->resource('posts', 'PostsController', ['except' => ['create', 'edit']]);

//    $api->resource('listings', 'ListingsController', [
//        'except' => ['create', 'edit']
//    ]);

//    $api->resource('tags', 'TagsController', [
//        'except' => ['create', 'edit']
//    ]);

//    $api->resource('categories', 'CategoriesController', [
//        'except' => ['create', 'edit']
//    ]);

    $api->resource('users', 'UsersController', ['except' => ['create', 'edit']]);

});
