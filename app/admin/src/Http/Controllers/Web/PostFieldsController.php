<?php

namespace Flashtag\Admin\Http\Controllers\Web;

use Flashtag\Admin\Http\Controllers\Controller;
use Flashtag\Admin\Http\Requests\FieldCreateRequest;
use Flashtag\Admin\Http\Requests\FieldDestroyRequest;
use Flashtag\Admin\Http\Requests\FieldUpdateRequest;
use Flashtag\Posts\Field;

class PostFieldsController extends Controller
{
    /**
     * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View
     */
    public function index()
    {
        return view('admin::fields.index');
    }

    /**
     * @param int $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function show($id)
    {
        return redirect()->route('admin.post-fields.edit', [$id], 301);
    }

    /**
     * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View
     */
    public function create()
    {
        $field = new Field();

        return view('admin::fields.create', compact('field'));
    }

    /**
     * @param FieldCreateRequest $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(FieldCreateRequest $request)
    {
        $field = Field::create($this->buildFieldFromRequest($request));

        return redirect()->route('admin.post-fields.index');
    }

    /**
     * @param int $id
     * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View
     */
    public function edit($id)
    {
        $field = Field::findOrFail($id);

        return view('admin::fields.edit', compact('field'));
    }

    /**
     * @param FieldUpdateRequest $request
     * @param int $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(FieldUpdateRequest $request, $id)
    {
        $field = Field::findOrFail($id);
        $field->update($this->buildFieldFromRequest($request));

        return redirect()->route('admin.post-fields.index');
    }

    /**
     * @param FieldDestroyRequest $request
     * @param int $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(FieldDestroyRequest $request, $id)
    {
        $field = Field::findOrFail($id);
        $field->delete();

        return redirect()->route('admin.post-fields.index');
    }

    /**
     * @param \Illuminate\Http\Request $request
     * @return array
     */
    private function buildFieldFromRequest($request)
    {
        $data['name'] = $request->get('name');
        $data['label'] = $request->get('label');
        $data['template'] = $request->get('template');
        $data['description'] = $request->get('description');

        return $data;
    }
}