<?php

Route::get('posts', 'TestController@posts');
Route::get('fields', 'TestController@fields');
Route::get('categories', 'TestController@categories');
Route::get('tags', 'TestController@tags');

Route::get('/', function () {
    $categories = \Flashtag\Data\Category::all();
    return view('front::creative.home', compact('categories'));
});
