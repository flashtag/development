<?php

namespace Flashtag\Admin\Http\Controllers\Api;

use Flashtag\Admin\Http\Controllers\Controller;
use Flashtag\Data\Page;
use Illuminate\Http\Request;

class PagesController extends Controller
{
    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $pages = Page::orderBy('created_at', 'desc')
            ->get();

        return response()->json($pages);
    }

    /**
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $page = Page::findOrFail($id);

        return response()->json($page);
    }

    /**
     * @param Request $request
     */
    public function store(Request $request)
    {
        Page::create($this->buildPageFromRequest($request));
    }

    /**
     * @param Request $request
     * @param int $id
     */
    public function update(Request $request, $id)
    {
        $page = Page::findOrFail($id);
        $page->update($request->all());
    }

    /**
     * @param int $id
     */
    public function lock($id)
    {
        $page = Page::findOrFail($id);
        $page->is_locked = true;
        $page->locked_by_id = \Auth::user()->id;
        $page->save();
    }

    /**
     * @param int $id
     */
    public function unlock($id)
    {
        $page = Page::findOrFail($id);
        $page->is_locked = false;
        $page->locked_by_id = null;
        $page->save();
    }

    public function search(Request $request)
    {
        $query = $request->get('q');
        $query = str_replace(' ', '%', ' '.$query.' ');

        $pages = Page::whereRaw('lower(title) like ?', [$query])
            ->get();

        return response()->json($pages);
    }

    /**
     * @param int $id
     */
    public function destroy($id)
    {
        $page = Page::findOrFail($id);
        $page->delete();
    }

    /**
     * Build the page data array from the request.
     *
     * @param \Illuminate\Http\Request $request
     * @return array
     */
    private function buildPageFromRequest(Request $request)
    {
        $page = $request->only([
            'title',
            'subtitle',
            'body',
            'is_published',
            'start_showing_at',
            'stop_showing_at',
        ]);
        if (isset($page['title'])) {
            $page['slug'] = str_slug($page['title']);
        }

        return $page;
    }
}