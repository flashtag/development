<?php

namespace Flashtag\Api\Http\Controllers\V1;

use Illuminate\Http\Request;
use Flashtag\Api\Transformers\CategoryTransformer;
use Flashtag\Data\Category;

class CategoriesController extends Controller
{
    /**
     * @var \Flashtag\Data\Category
     */
    private $category;

    /**
     * @param \Flashtag\Data\Category $category
     */
    public function __construct(Category $category)
    {
        $this->category = $category;
    }

    /**
     * Display a listing of the categories.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Dingo\Api\Http\Response
     */
    public function index(Request $request)
    {
        $count = $request->get('count', 100);
        $categories = $this->category->paginate($count);

        $this->appendPaginationLinks($categories, $request);

        return $this->response->paginator($categories, new CategoryTransformer());
    }

    /**
     * Display the specified category.
     *
     * @param int $id
     * @return \Dingo\Api\Http\Response
     */
    public function show($id)
    {
        $category = $this->category->findOrFail($id);

        return $this->response->item($category, new CategoryTransformer());
    }

    /**
     * Store a newly created category in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @return \Dingo\Api\Http\Response
     */
    public function store(Request $request)
    {
        $categoryData = $this->buildCategoryFromRequest($request);
        $category = $this->category->create($categoryData);

        return $this->response->item($category, new CategoryTransformer());
    }

    /**
     * Update the specified category in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @param  int $id
     * @return \Dingo\Api\Http\Response
     */
    public function update(Request $request, $id)
    {
        $categoryData = $this->buildCategoryFromRequest($request);
        $category = $this->category->findOrFail($id);
        $category->update($categoryData);

        return $this->response->item($category, new CategoryTransformer());
    }

    /**
     * Build the category data array from the request.
     *
     * @param \Illuminate\Http\Request $request
     * @return array
     */
    private function buildCategoryFromRequest(Request $request)
    {
        return [
            'title'            => $request->get('title'),
            'slug'             => str_slug($request->get('title')),
            'subtitle'         => $request->get('subtitle'),
            'order'            => $request->get('order'),
            'category_id'      => $request->get('category_id'),
            'body'             => $request->get('body'),
            'is_published'     => $request->get('is_published'),
            'start_showing_at' => $request->get('start_showing_at'),
            'stop_showing_at'  => $request->get('stop_showing_at'),
        ];
    }

    /**
     * Remove the specified category from storage.
     *
     * @param  int $id
     * @return \Dingo\Api\Http\Response
     */
    public function destroy($id)
    {
        $category = $this->category->findOrFail($id);
        $category->delete();

        return $this->response->item($category, new CategoryTransformer());
    }
}
