<?php

/**
 * @var \Illuminate\Routing\Router $router
 */

$router->get('posts/search', 'PostsController@search');
$router->patch('posts/{post}/lock', 'PostsController@lock');
$router->patch('posts/{post}/unlock', 'PostsController@unlock');
$router->resource('posts/{post_id}/revisions', 'PostRevisionsController', ['only' => ['index', 'show']]);
$router->resource('posts', 'PostsController', ['except' => ['edit', 'create']]);
$router->resource('post-fields', 'PostFieldsController', ['except' => ['edit', 'create']]);
$router->post('post-lists/{postList}/posts', 'PostListsController@addPost');
$router->delete('post-lists/{postList}/posts/{post}', 'PostListsController@removePost');
$router->patch('post-lists/{postList}/reorder', 'PostListsController@reorder');
$router->resource('post-lists', 'PostListsController', ['except' => ['edit', 'create']]);
$router->patch('pages/{page}/lock', 'PagesController@lock');
$router->patch('pages/{page}/unlock', 'PagesController@unlock');
$router->resource('pages', 'PagesController', ['except' => ['edit', 'create']]);
$router->resource('tags', 'TagsController', ['except' => ['edit', 'create']]);
$router->resource('categories', 'CategoriesController', ['except' => ['edit', 'create']]);
$router->resource('authors', 'AuthorsController', ['except' => ['edit', 'create']]);
$router->resource('users', 'UsersController', ['except' => ['edit', 'create']]);
$router->resource('media/images', 'ImagesController', ['only' => ['destroy']]);
