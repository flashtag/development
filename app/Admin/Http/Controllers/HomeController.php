<?php

namespace Flashtag\Admin\Http\Controllers;

class HomeController extends Controller
{
    public function home()
    {
        return  view('admin::admin', ['current_user' => $this->current_user]);
    }
}