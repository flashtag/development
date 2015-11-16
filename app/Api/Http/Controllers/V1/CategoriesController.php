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
            'name' => $request->get('name'),
            'slug' => str_slug($request->get('name')),
            'description' => $request->get('description'),
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