<?php

namespace Flashtag\Admin\Http\Controllers;

class SettingsController extends Controller
{
    public function index()
    {
        return view('admin::settings.index');
    }
}
