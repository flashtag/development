@extends('admin::layout')

@section('content')
    @include('admin::partials.form-errors')

    <h4 style="text-align:right;"><small>Flashtag v{{ \Flashtag\Core\Flashtag::VERSION }}</small></h4>

    <div class="panel panel-default">
        <div class="panel-heading">Web Site</div>
        <div class="panel-body">
            <div class="form-group">
                <label for="site_name">Name</label>
                <input type="text" value="{{ settings('site_name') }}" name="site_name" id="site_name" class="form-control">
            </div>
            <div class="form-group">
                <label for="site_tagline">Tagline</label>
                <input type="text" value="{{ settings('site_tagline') }}" name="site_tagline" id="site_tagline" class="form-control">
            </div>
            <div class="form-group">
                <label for="site_keywords">Keywords</label>
                <input type="text" value="{{ settings('site_keywords') }}" name="site_keywords" id="site_keywords" class="form-control" placeholder="flashtag, cms, php, open source">
            </div>
            <div class="form-group">
                <label for="site_description">Description</label>
                <input type="text" value="{{ settings('site_description') }}" name="site_description" id="site_description" class="form-control" placeholder="A short description of your site...">
            </div>
        </div>
    </div>

    <div class="panel panel-default">
        <div class="panel-heading">Social Media</div>
        <div class="panel-body">
            <div class="form-group">
                <label for="twitter_account">Twitter Account</label>
                <input type="text" value="{{ settings('twitter_account') }}" name="twitter_account" id="twitter_account" class="form-control" placeholder="@flashtag">
            </div>
            <div class="form-group">
                <label for="facebook_page">Facebook Page</label>
                <input type="text" value="{{ settings('facebook_page') }}" name="facebook_page" id="facebook_page" class="form-control" placeholder="flashtagcms">
            </div>
        </div>
    </div>

    <div class="panel panel-default">
        <div class="panel-heading">Misc.</div>
        <div class="panel-body">
            <div class="form-group">
                <label for="ga_id">Google Universal Analytics ID</label>
                <input type="text" value="{{ settings('ga_id') }}" name="ga_id" id="ga_id" class="form-control" placeholder="UA-XXXXX-Y">
            </div>
        </div>
    </div>
@endsection
