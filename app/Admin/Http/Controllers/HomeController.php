<?php

namespace Flashtag\Admin\Http\Controllers;

class HomeController extends Controller
{
    public function home()
    {
        return  view('admin::home');
    }
}
