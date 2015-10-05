<?php

Route::get('posts', 'TestController@posts');
Route::get('fields', 'TestController@fields');
Route::get('categories', 'TestController@categories');
Route::get('tags', 'TestController@tags');

Route::get('/', function () {
    return view('welcome');
});
