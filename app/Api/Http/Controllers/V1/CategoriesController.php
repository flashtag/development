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
     * @param int $id
     * @return \Dingo\Api\Http\Response
     */
    public function show($id)
    {
        $category = $this->category->findOrFail($id);

        return $this->response->item($category, new CategoryTransformer());
    }

    /**
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
     * @param  \Illuminate\Http\Request $request
     * @param  int $id
     * @return \Dingo\Api\Http\Response
     */
    public function update(Request $request, $id)
    {
        $categoryData = $this->buildCategoryFromRequest($request);
        $category = $this->category->findOrFail($id);
        $category->update($categoryData);
        $this->syncMediaRelationshipFromRequest($category, $request);

        return $this->response->item($category, new CategoryTransformer());
    }

    /**
     * @param \Illuminate\Http\Request $request
     * @return array
     */
    private function buildCategoryFromRequest(Request $request)
    {
        return [
            'name' => $request->get('name'),
            'slug' => str_slug($request->get('name')),
            'parent_id' => $request->get('parent_id'),
            'description' => $request->get('description'),
            'order_by' => $request->get('order_by'),
            'order_dir' => $request->get('order_dir'),
        ];
    }

    /**
     * @param \Flashtag\Data\Category $category
     * @param \Illuminate\Http\Request $request
     */
    private function syncMediaRelationshipFromRequest($category, $request)
    {
        $type = isset($request->get('media')['type']) ? $request->get('media')['type'] : null;
        $url = isset($request->get('media')['url']) ? $request->get('media')['url'] : null;

        $category->updateMedia($type, $url);
    }

    /**
     * @param \Illuminate\Http\Request $request
     * @param int                      $id
     * @return \Dingo\Api\Http\Response
     */
    public function addImage(Request $request, $id)
    {
        $category = $this->category->findOrFail($id);
        $image = $request->file('image');
        $category->addImage($image);

        return $this->response->item($category, new CategoryTransformer());
    }

    /**
     * @param int $id
     * @return \Dingo\Api\Http\Response
     */
    public function deleteImage($id)
    {
        $category = $this->category->findOrFail($id);
        $category->removeImage();

        return $this->response->item($category, new CategoryTransformer());
    }

    /**
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
