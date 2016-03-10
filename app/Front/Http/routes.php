<?php

// PAGES
Route::get('/', function () {
    $posts = \Flashtag\Data\Post::getLatest(10);
    $categories = \Flashtag\Data\Category::all();
    return view('flashtag::home', compact('posts', 'categories'));
});

Route::get('about', function () {
    return view('flashtag::about');
});

Route::get('contact', function () {
    return view('flashtag::contact');
});

// POSTS
Route::get('posts', function () {
    $posts = \Flashtag\Data\Post::getLatest(10);
    return view('flashtag::posts.index', compact('posts'));
});


Route::get('topics/{tag_slug}', function ($tag_slug) {
    $tag = \Flashtag\Data\Tag::getBySlug($tag_slug);
    $posts = $tag->posts;
    return view('flashtag::posts.tag', compact('tag', 'posts'));
});

Route::get('posts/{post}', function ($post_slug) {
    $post = $posts = \Flashtag\Data\Post::getBySlug($post_slug);
    return view('flashtag::posts.show', compact('post'));
});

Route::get('authors/{author}', function ($author_slug) {
    $author = \Flashtag\Data\Author::getBySlug($author_slug);
    $posts = $author->posts->filter(function ($post) {
        return $post->show_author;
    });
    return view('flashtag::posts.author', compact('author', 'posts'));
});

Route::get('{category}/{post}', function ($category_slug, $post_slug) {
    return redirect('posts/'.$post_slug, 301);
});

Route::get('{category}', function ($category_slug) {
    $category = \Flashtag\Data\Category::getBySlug($category_slug);
    $posts = $category->posts;
    return view('flashtag::posts.category', compact('category', 'posts'));
});
