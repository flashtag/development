<?php

namespace Flashtag\Front\Http\Controllers;

use Flashtag\Data\Category;
use Flashtag\Data\Post;

class CategoriesController extends Controller
{
    /**
     * Display a listing of categories.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param string $category_slug
     * @return \Illuminate\Http\Response
     */
    public function show($category_slug)
    {
        $category = Category::getBySlug($category_slug);

        $posts = Post::whereHas('category', function ($query) use ($category_slug) {
            $query->where('slug', $category_slug);
        })->simplePaginate();

        return view('flashtag::posts.category', compact('category', 'posts'));
    }
}
