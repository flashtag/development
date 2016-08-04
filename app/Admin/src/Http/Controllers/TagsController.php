<?php

namespace Flashtag\Admin\Http\Controllers;

use Flashtag\Admin\Http\Controllers\Traits\SyncsMedia;
use Flashtag\Admin\Http\Requests\TagCreateRequest;
use Flashtag\Admin\Http\Requests\TagDestroyRequest;
use Flashtag\Admin\Http\Requests\TagUpdateRequest;
use Flashtag\Data\Tag;

class TagsController extends Controller
{
    use SyncsMedia;

    /**
     * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View
     */
    public function index()
    {
        return view('admin::tags.index');
    }

    /**
     * @param int $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function show($id)
    {
        return redirect()->route('admin.tags.edit', [$id], 301);
    }

    /**
     * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View
     */
    public function create()
    {
        $tag = new Tag();

        return view('admin::tags.create', compact('tag'));
    }

    /**
     * @param TagCreateRequest $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(TagCreateRequest $request)
    {
        $tag = Tag::create($this->buildTagFromRequest($request));

        $this->syncMediaFromRequest($tag, $request);
        $this->handleImageUploadsFromRequest($tag, $request);

        return redirect()->route('admin.tags.index');
    }

    /**
     * @param int $id
     * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View
     */
    public function edit($id)
    {
        $tag = Tag::findOrFail($id);

        return view('admin::tags.edit', compact('tag'));
    }

    /**
     * @param TagUpdateRequest $request
     * @param int $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(TagUpdateRequest $request, $id)
    {
        $tag = Tag::findOrFail($id);
        $tag->update($this->buildTagFromRequest($request));

        $this->syncMediaFromRequest($tag, $request);
        $this->handleImageUploadsFromRequest($tag, $request);

        return redirect()->route('admin.tags.index');
    }

    /**
     * @param TagDestroyRequest $request
     * @param int $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(TagDestroyRequest $request, $id)
    {
        $tag = Tag::findOrFail($id);
        $tag->delete();

        return redirect()->route('admin.tags.index');
    }

    /**
     * @param \Illuminate\Http\Request $request
     * @return array
     */
    private function buildTagFromRequest($request)
    {
        $data['name'] = $request->get('name');
        $data['slug'] = str_slug($request->get('name'));
        $data['description'] = $request->get('description');

        return $data;
    }
}
