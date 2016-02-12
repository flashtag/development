<?php

namespace Flashtag\Admin\Http\Controllers;

use Flashtag\Admin\Http\Requests\AuthorCreateRequest;
use Flashtag\Admin\Http\Requests\AuthorDestroyRequest;
use Flashtag\Admin\Http\Requests\AuthorUpdateRequest;
use Flashtag\Data\Author;

class AuthorsController extends Controller
{
    /**
     * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View
     */
    public function index()
    {
        return view('admin::authors.index');
    }

    /**
     * @param int $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function show($id)
    {
        return redirect()->route('admin.authors.edit', [$id], 301);
    }

    /**
     * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View
     */
    public function create()
    {
        $author = new Author();

        return view('admin::authors.create', compact('author'));
    }

    /**
     * @param AuthorCreateRequest $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(AuthorCreateRequest $request)
    {
        $author = Author::create($this->buildAuthorFromRequest($request));

        return redirect()->route('admin.authors.index');
    }

    /**
     * @param int $id
     * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View
     */
    public function edit($id)
    {
        $author = Author::findOrFail($id);

        return view('admin::authors.edit', compact('author'));
    }

    /**
     * @param AuthorUpdateRequest $request
     * @param int $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(AuthorUpdateRequest $request, $id)
    {
        $author = Author::findOrFail($id);
        $author->update($this->buildAuthorFromRequest($request));

        return redirect()->route('admin.authors.index');
    }

    /**
     * @param AuthorDestroyRequest $request
     * @param int $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(AuthorDestroyRequest $request, $id)
    {
        $author = Author::findOrFail($id);
        $author->delete();

        return redirect()->route('admin.authors.index');
    }

    /**
     * @param \Illuminate\Http\Request $request
     * @return array
     */
    private function buildAuthorFromRequest($request)
    {
        $data['name'] = $request->get('name');
        $data['slug'] = str_slug($request->get('name'));
        $data['bio'] = $request->get('bio');
        $data['link'] = $request->get('link');
        if ($request->has('photo')) {
            $data['photo'] = $request->get('photo');
        }

        return $data;
    }
}