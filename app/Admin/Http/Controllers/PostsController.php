<?php

namespace Flashtag\Admin\Http\Controllers;

class PostsController extends Controller
{
    public function index()
    {
        return view('admin::posts.index');
    }

    public function show($id)
    {
        return redirect()->route('admin.posts.edit', [$id], 301);
    }

    public function create()
    {
        //
    }

    public function store()
    {
        //
    }

    public function edit($id)
    {
        return view('admin::posts.edit', ['id' => (int) $id]);
    }

    public function update($id)
    {
        //
    }

    public function destroy($id)
    {
        //
    }
}