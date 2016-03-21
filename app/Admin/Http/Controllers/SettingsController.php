<?php

namespace Flashtag\Admin\Http\Controllers;

use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function index()
    {
        return view('admin::settings.index');
    }

    public function store(Request $request)
    {
        foreach (settings()->all() as $setting => $value) {
            if ($request->has($setting)) {
                settings()->set($setting, $request->get($setting));
            }
        }

        return redirect()->route('admin.settings.index');
    }
}
