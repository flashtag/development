@extends('admin::layout')

@section('content')
    <div class="container-fluid container-pf-nav-pf-vertical container-pf-nav-pf-vertical-with-secondary">
        <ol class="breadcrumb">
            <li><a href="/admin">Home</a></li>
            <li class="active">Settings</li>
        </ol>

        @include('admin::partials.form-errors')

        <h4>Settings <small style="float:right;">Flashtag v{{ \Flashtag\Core\Flashtag::VERSION }}</small></h4>

        @include('admin::partials.form-errors')

        <form class="EditForm" action="{{ route('admin.settings.store') }}" method="POST">
            {{ csrf_field() }}
            <div class="panel panel-default">
                <div class="panel-heading">General</div>
                <div class="panel-body">
                    <div class="form-group">
                        <label for="name">Name</label>
                        <input type="text" value="{{ settings('name') }}" name="name" id="name" class="form-control">
                    </div>
                    <div class="form-group">
                        <label for="tagline">Tagline</label>
                        <input type="text" value="{{ settings('tagline') }}" name="tagline" id="tagline" class="form-control">
                    </div>
                    <div class="form-group">
                        <label for="keywords">Keywords</label>
                        <input type="text" value="{{ settings('keywords') }}" name="keywords" id="keywords" class="form-control" placeholder="flashtag, cms, php, open source">
                    </div>
                    <div class="form-group">
                        <label for="description">Description</label>
                        <input type="text" value="{{ settings('description') }}" name="description" id="description" class="form-control" placeholder="A short description of your site...">
                    </div>
                </div>
            </div>

            {{-- Only show template select if using flashtag/front --}}
            @if (class_exists(\Flashtag\Front\Theme::class))
                <div class="panel panel-default">
                    <div class="panel-heading">Display</div>
                    <div class="panel-body">
                        <div class="form-group">
                            <label for="theme">Theme</label>
                            <select name="theme" id="theme" class="form-control">
                                @foreach (\Flashtag\Front\Theme::lists() as $template)
                                    <option value="{{ $template }}"
                                            {{ settings('theme') == $template ? 'selected' : '' }}>
                                        {{ $template }}
                                    </option>
                                @endforeach
                            </select>
                        </div>
                    </div>
                </div>
            @endif

            <div class="panel panel-default">
                <div class="panel-heading">Routing</div>
                <div class="panel-body">
                    <div class="form-group">
                        <label for="twitter_account">Posts Route Prefix</label>
                        <input type="text" value="{{ settings('post_route') }}" name="post_route" id="post_route" class="form-control" placeholder="posts">
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

            <section class="info row">
                <div class="col-md-6 col-md-offset-6 clearfix">
                    <div class="action-buttons">
                        <button type="submit" class="btn btn-primary"><i class="fa fa-save"></i> Save</button>
                        <a href="/admin" class="btn btn-default"><i class="fa fa-close"></i> Close</a>
                    </div>
                </div>
            </section>
        </form>
    </div>
@endsection
