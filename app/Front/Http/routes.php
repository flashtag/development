<?php

/**
 * @var \Illuminate\Routing\Router $router
 */

$router->get('/', [
    'uses' => 'HomeController@index',
    'as' => 'home'
]);
$router->resource('posts', 'PostsController', [
    'only' => ['index', 'show']
]);
$router->resource('categories', 'CategoriesController', [
    'only' => ['index', 'show']
]);
$router->resource('topics', 'TagsController', [
    'only' => ['index', 'show']
]);
$router->resource('authors', 'AuthorsController', [
    'only' => ['index', 'show']
]);
$router->get('{page}', 'PagesController@show')->where([
    'page' => pageRoutesPattern()
]);

// Example custom view
$router->get('contact', function () {
    return view('flashtag::contact');
});
