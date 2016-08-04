<?php

use Illuminate\Routing\Router;

/** @var Router $router */

// Home
$router->get('/', [
    'uses' => 'HomeController@index',
    'as' => 'home'
]);

// Posts
$router->group(['prefix' => settings('post_route', 'posts')], function (Router $router) {
    $router->get('/', [
        'uses' => 'PostsController@index',
        'as' => 'posts.index'
    ]);
    $router->get('{post}', [
        'uses' => 'PostsController@show',
        'as' => 'posts.show'
    ]);
});

// Categories
$router->group(['prefix' => settings('category_route', 'categories')], function (Router $router) {
    $router->get('/', [
        'uses' => 'CategoriesController@index',
        'as' => 'categories.index',
    ]);
    $router->get('{post}', [
        'uses' => 'CategoriesController@show',
        'as' => 'categories.show',
    ]);
});

// Tags
$router->group(['prefix' => settings('tag_route', 'topics')], function (Router $router) {
    $router->get('/', [
        'uses' => 'TagsController@index',
        'as' => 'tags.index',
    ]);
    $router->get('{post}', [
        'uses' => 'TagsController@show',
        'as' => 'tags.show',
    ]);
});

// Authors
$router->group(['prefix' => settings('author_route', 'authors')], function (Router $router) {
    $router->get('/', [
        'uses' => 'AuthorsController@index',
        'as' => 'authors.index',
    ]);
    $router->get('{post}', [
        'uses' => 'AuthorsController@show',
        'as' => 'authors.show',
    ]);
});

// Pages
$router->get('{page}', [
    'uses' => 'PagesController@show',
    'as' => 'pages.show',
])->where(['page' => page_routes_pattern()]);

// Search
$router->get(settings('search_route', 'search'), [
    'uses' => 'SearchController@search',
    'as' => 'search',
]);

// Example custom view
$router->get('contact', function () {
    return view('flashtag::contact');
});
