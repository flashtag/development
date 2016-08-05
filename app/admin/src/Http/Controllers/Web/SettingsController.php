<?php

namespace Flashtag\Admin\Http\Controllers\Web;

use Flashtag\Admin\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    /**
     * Register middleware and stuff.
     */
    public function __construct()
    {
        $this->middleware('admin');
        $this->middleware('settings');
    }

    public function index()
    {
        return view('admin::settings.index');
    }

    public function store(Request $request)
    {
        foreach (settings()->all() as $setting => $value) {
            if ($request->has($setting)) {
                settings()->set($setting, $request->input($setting));
            }
        }

        return redirect()->route('admin::settings.index');
    }

    public function destroy($setting)
    {
        settings()->forget($setting);

        return redirect()->route('admin::settings.index');
    }
}
