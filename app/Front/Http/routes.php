<?php

use Illuminate\Routing\Router;

/**
 * @var Router $router
 */

$router->get('/', [
    'uses' => 'HomeController@index',
    'as' => 'home'
]);
$router->group(['prefix' => settings('post_route')], function (Router $router) {
    $router->get('/', ['uses' => 'PostsController@index', 'as' => 'posts.index']);
    $router->get('{post}', ['uses' => 'PostsController@show', 'as' => 'posts.show']);
});
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
