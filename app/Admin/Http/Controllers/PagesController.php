<?php

namespace Flashtag\Admin\Http\Controllers;

use Flashtag\Admin\Http\Requests\PageCreateRequest;
use Flashtag\Admin\Http\Requests\PageDestroyRequest;
use Flashtag\Admin\Http\Requests\PageUpdateRequest;
use Flashtag\Data\Page;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;

class PagesController extends Controller
{
    public function index()
    {
        return view('admin::pages.index');
    }

    public function show($id)
    {
        return redirect()->route('admin.pages.edit', [$id], 301);
    }

    public function create()
    {
        $page = new Page();
        $templates = $this->listPageTemplates();

        return view('admin::pages.create', compact('page', 'templates'));
    }

    public function store(PageCreateRequest $request)
    {
        $page = Page::create($this->buildPageFromRequest($request));

        $this->handleImageUpload($page, $request->file('image'));

        return redirect()->route('admin.pages.index');
    }

    public function edit($id)
    {
        $page = Page::findOrFail($id);
        $page->lock(auth()->user()->id);

        $templates = $this->listPageTemplates();

        return view('admin::pages.edit', compact('page', 'templates'));
    }

    /**
     * @return array
     */
    private function listPageTemplates()
    {
        $templates = Storage::files('resources/views', true);

        return array_reduce($templates, function ($carry, $file) {
            if (str_contains($file, '-page.blade.php') !== false) {
                $path = str_replace(['-page.blade.php', 'resources/views/'], '', $file);
                $view = str_replace('/', '.', $path);
                $view = preg_replace('/themes\.'.settings('theme').'./', 'flashtag::', $view);
                $carry[$view] = basename($path);
            }
            return $carry;
        }, []);
    }

    public function update(PageUpdateRequest $request, $id)
    {
        $page = Page::findOrFail($id);

        $page->update($this->buildPageFromRequest($request));

        $this->handleImageUploadsFromRequest($page, $request);

        return redirect()->route('admin.pages.index');
    }

    private function buildPageFromRequest($request)
    {
        $data['title'] = $request->get('title');
        $data['subtitle'] = $request->get('subtitle');
        $data['slug'] = $request->get('slug');
        $data['template'] = $request->get('template');
        $data['body'] = $request->get('body');
        $data['is_published'] = $request->get('is_published', false);
        $data['meta_description'] = $request->get('meta_description');
        $data['meta_canonical'] = $request->get('meta_canonical');

        if ($request->get('start_showing_at')) {
            $data['start_showing_at'] = $request->get('start_showing_at');
        }
        if ($request->get('stop_showing_at')) {
            $data['stop_showing_at'] = $request->get('stop_showing_at');
        }

        return $data;
    }

    private function handleImageUploadsFromRequest(Page $page, $request)
    {
        if (! empty($request->file('image'))) {
            $page->addImage($request->file('image'));
        }

        if (! empty($request->file('cover_image'))) {
            $page->addCoverImage($request->file('cover_image'));
        }
    }

    public function destroy(PageDestroyRequest $request, $id)
    {
        $page = Page::findOrFail($id);
        $page->delete();

        return redirect()->route('admin.pages.index');
    }
}