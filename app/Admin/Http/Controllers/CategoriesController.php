<?php

namespace Flashtag\Admin\Http\Controllers;

use Flashtag\Admin\Http\Requests\CategoryCreateRequest;
use Flashtag\Admin\Http\Requests\CategoryDestroyRequest;
use Flashtag\Admin\Http\Requests\CategoryUpdateRequest;
use Flashtag\Data\Category;
use Flashtag\Data\Tag;

class CategoriesController extends Controller
{
    public function index()
    {
        return view('admin::categories.index');
    }

    public function show($id)
    {
        return redirect()->route('admin.categories.edit', [$id], 301);
    }

    public function create()
    {
        $category = new Category();

        $categories = Category::all('id', 'name');
        $tags = Tag::all('id', 'name');

        return view('admin::categories.create', compact('category', 'categories', 'tags'));
    }

    public function store(CategoryCreateRequest $request)
    {
        $category = Category::create($this->buildCategoryFromRequest($request));

//        $this->syncTags($category, $request->get('tags'));

        return redirect()->route('admin.categories.index');
    }

    public function edit($id)
    {
        $category = Category::with('tags')->findOrFail($id);

        $categories = Category::all('id', 'name');
        $tags = Tag::all('id', 'name');

        return view('admin::categories.edit', compact('category', 'categories', 'tags'));
    }

    public function update(CategoryUpdateRequest $request, $id)
    {
        $category = Category::findOrFail($id);
        $category->update($this->buildCategoryFromRequest($request));

        $this->syncTags($category, $request->get('tags'));

        return redirect()->route('admin.categories.index');
    }

    public function destroy(CategoryDestroyRequest $request, $id)
    {
        $category = Category::findOrFail($id);
        $category->delete();

        return redirect()->route('admin.categories.index');
    }

    private function buildCategoryFromRequest($request)
    {
        $data['name'] = $request->get('name');
        $data['description'] = $request->get('description');
        $data['slug'] = str_slug($request->get('name'));
        $data['parent_id'] = $request->get('parent_id');

        return $data;
    }

    private function syncTags($category, $tags = [])
    {
        $category->tags()->sync((array) $tags);
    }
}
