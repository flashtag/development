<?php

namespace Flashtag\Admin\Http\Controllers;

use Flashtag\Admin\Http\Controllers\Traits\SyncsMedia;
use Flashtag\Admin\Http\Requests\CategoryCreateRequest;
use Flashtag\Admin\Http\Requests\CategoryDestroyRequest;
use Flashtag\Admin\Http\Requests\CategoryUpdateRequest;
use Flashtag\Data\Category;
use Flashtag\Data\Tag;

class CategoriesController extends Controller
{
    use SyncsMedia;

    /**
     * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View
     */
    public function index()
    {
        return view('admin::categories.index');
    }

    /**
     * @param int $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function show($id)
    {
        return redirect()->route('admin.categories.edit', [$id], 301);
    }

    /**
     * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View
     */
    public function create()
    {
        $category = new Category();
        $categories = Category::all('id', 'name');
        $tags = Tag::all('id', 'name');

        return view('admin::categories.create', compact('category', 'categories', 'tags'));
    }

    /**
     * @param CategoryCreateRequest $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(CategoryCreateRequest $request)
    {
        $category = Category::create($this->buildCategoryFromRequest($request));

        $this->syncTagsFromRequest($category, $request);
        $this->syncMediaFromRequest($category, $request);

        return redirect()->route('admin.categories.index');
    }

    /**
     * @param int $id
     * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View
     */
    public function edit($id)
    {
        $category = Category::with('tags', 'media')->findOrFail($id);
        $categories = Category::all('id', 'name');
        $tags = Tag::all('id', 'name');

        return view('admin::categories.edit', compact('category', 'categories', 'tags'));
    }

    /**
     * @param CategoryUpdateRequest $request
     * @param int $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(CategoryUpdateRequest $request, $id)
    {
        $category = Category::findOrFail($id);
        $category->update($this->buildCategoryFromRequest($request));

        $this->syncTagsFromRequest($category, $request);
        $this->syncMediaFromRequest($category, $request);

        return redirect()->route('admin.categories.index');
    }

    /**
     * @param CategoryDestroyRequest $request
     * @param int $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(CategoryDestroyRequest $request, $id)
    {
        $category = Category::findOrFail($id);
        $category->delete();

        return redirect()->route('admin.categories.index');
    }

    /**
     * @param \Illuminate\Http\Request $request
     * @return array
     */
    private function buildCategoryFromRequest($request)
    {
        $data['name'] = $request->get('name');
        $data['description'] = $request->get('description');
        $data['slug'] = str_slug($request->get('name'));
	    $data['parent_id'] = $request->get('parent_id') ?: null;

        return $data;
    }

    /**
     * @param Category $category
     * @param \Illuminate\Http\Request $request
     */
    private function syncTagsFromRequest(Category $category, $request)
    {
        $tags = $request->get('tags', []);

        $category->tags()->sync($tags);
    }
}
