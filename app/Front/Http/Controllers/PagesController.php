<?php

namespace Flashtag\Front\Http\Controllers;

use Flashtag\Data\Page;
use Illuminate\Http\Request;
use Flashtag\Front\Http\Requests;
use Flashtag\Front\Http\Controllers\Controller;

class PagesController extends Controller
{
    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        if (is_numeric($id)) {
            $page = Page::findOrFail($id);
            return redirect()->action('PagesController@show', [$page->slug], 301);
        }

        $page = Page::getBySlug($id);

        return view('flashtag::page', compact('page'));
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }
}
