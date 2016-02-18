<?php

namespace Flashtag\Admin\Http\Controllers;

use Flashtag\Admin\Http\Requests\PostListCreateRequest;
use Flashtag\Admin\Http\Requests\PostListDestroyRequest;
use Flashtag\Admin\Http\Requests\PostListUpdateRequest;
use Flashtag\Data\PostList;

class PostListsController extends Controller
{
    /**
     * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View
     */
    public function index()
    {
        return view('admin::post-lists.index');
    }

    /**
     * @param int $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function show($id)
    {
        return redirect()->route('admin.post-lists.edit', [$id], 301);
    }

    /**
     * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View
     */
    public function create()
    {
        $postList = new PostList();

        return view('admin::post-lists.create', compact('postList'));
    }

    /**
     * @param PostListCreateRequest $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(PostListCreateRequest $request)
    {
        $postList = PostList::create($this->buildListFromRequest($request));

        return redirect()->route('admin.post-lists.index');
    }

    /**
     * @param int $id
     * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View
     */
    public function edit($id)
    {
        $postList = PostList::findOrFail($id);

        return view('admin::post-lists.edit', compact('postList'));
    }

    /**
     * @param PostListUpdateRequest $request
     * @param int $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(PostListUpdateRequest $request, $id)
    {
        $postList = PostList::findOrFail($id);
        $postList->update($this->buildListFromRequest($request));

        return redirect()->route('admin.post-lists.index');
    }

    /**
     * @param PostListDestroyRequest $request
     * @param int $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(PostListDestroyRequest $request, $id)
    {
        $postList = PostList::findOrFail($id);
        $postList->delete();

        return redirect()->route('admin.post-lists.index');
    }

    /**
     * @param \Illuminate\Http\Request $request
     * @return array
     */
    private function buildListFromRequest($request)
    {
        $data['name'] = $request->get('name');
        $data['slug'] = str_slug($request->get('name'));

        return $data;
    }
}