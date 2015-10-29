<?php

$api->post('auth', 'AuthController@authenticate');

$api->group(['middleware' => ['api.auth', 'jwt.refresh']], function ($api) {

    $api->resource('posts', 'PostsController', [
        'except' => ['create', 'edit']
    ]);

//    $api->resource('listings', 'ListingsController', [
//        'except' => ['create', 'edit']
//    ]);

//    $api->resource('tags', 'TagsController', [
//        'except' => ['create', 'edit']
//    ]);

//    $api->resource('categories', 'CategoriesController', [
//        'except' => ['create', 'edit']
//    ]);

});
