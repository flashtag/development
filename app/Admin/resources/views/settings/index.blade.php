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
                        <div class="input-group">
                            <input type="text" value="{{ settings('name') }}" name="name" id="name" class="form-control">
                            <span class="input-group-btn">
                                <button class="btn btn-default reset-setting" type="button"><i class="fa fa-refresh"></i></button>
                            </span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="tagline">Tagline</label>
                        <div class="input-group">
                            <input type="text" value="{{ settings('tagline') }}" name="tagline" id="tagline" class="form-control">
                            <span class="input-group-btn">
                                <button class="btn btn-default reset-setting" type="button"><i class="fa fa-refresh"></i></button>
                            </span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="keywords">Keywords</label>
                        <div class="input-group">
                            <input type="text" value="{{ settings('keywords') }}" name="keywords" id="keywords" class="form-control" placeholder="flashtag, cms, php, open source">
                            <span class="input-group-btn">
                                <button class="btn btn-default reset-setting" type="button"><i class="fa fa-refresh"></i></button>
                            </span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="description">Description</label>
                        <div class="input-group">
                            <input type="text" value="{{ settings('description') }}" name="description" id="description" class="form-control" placeholder="A short description of your site...">
                            <span class="input-group-btn">
                                <button class="btn btn-default reset-setting" type="button"><i class="fa fa-refresh"></i></button>
                            </span>
                        </div>
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
                            <div class="input-group">
                                <select name="theme" id="theme" class="form-control">
                                    @foreach (\Flashtag\Front\Theme::lists() as $template)
                                        <option value="{{ $template }}"
                                                {{ settings('theme') == $template ? 'selected' : '' }}>
                                            {{ $template }}
                                        </option>
                                    @endforeach
                                </select>
                                <span class="input-group-btn">
                                    <button class="btn btn-default reset-setting" type="button"><i class="fa fa-refresh"></i></button>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            @endif

            <div class="panel panel-default">
                <div class="panel-heading">Routing</div>
                <div class="panel-body">
                    <div class="form-group">
                        <label for="post_route">Posts Route Prefix</label>
                        <div class="input-group">
                            <input type="text" value="{{ settings('post_route') }}" name="post_route" id="post_route" class="form-control" placeholder="posts">
                            <span class="input-group-btn">
                                <button class="btn btn-default reset-setting" type="button"><i class="fa fa-refresh"></i></button>
                            </span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="category_route">Categories Route Prefix</label>
                        <div class="input-group">
                            <input type="text" value="{{ settings('category_route') }}" name="category_route" id="category_route" class="form-control" placeholder="categories">
                            <span class="input-group-btn">
                                <button class="btn btn-default reset-setting" type="button"><i class="fa fa-refresh"></i></button>
                            </span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="tag_route">Tags Route Prefix</label>
                        <div class="input-group">
                            <input type="text" value="{{ settings('tag_route') }}" name="tag_route" id="tag_route" class="form-control" placeholder="topics">
                            <span class="input-group-btn">
                                <button class="btn btn-default reset-setting" type="button"><i class="fa fa-refresh"></i></button>
                            </span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="author_route">Authors Route Prefix</label>
                        <div class="input-group">
                            <input type="text" value="{{ settings('author_route') }}" name="author_route" id="author_route" class="form-control" placeholder="authors">
                            <span class="input-group-btn">
                                <button class="btn btn-default reset-setting" type="button"><i class="fa fa-refresh"></i></button>
                            </span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="search_route">Search Route Prefix</label>
                        <div class="input-group">
                            <input type="text" value="{{ settings('search_route') }}" name="search_route" id="search_route" class="form-control" placeholder="search">
                            <span class="input-group-btn">
                                <button class="btn btn-default reset-setting" type="button"><i class="fa fa-refresh"></i></button>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="panel panel-default">
                <div class="panel-heading">Social Media</div>
                <div class="panel-body">
                    <div class="form-group">
                        <label for="twitter_account">Twitter Account</label>
                        <div class="input-group">
                            <input type="text" value="{{ settings('twitter_account') }}" name="twitter_account" id="twitter_account" class="form-control" placeholder="@flashtag">
                            <span class="input-group-btn">
                                <button class="btn btn-default reset-setting" type="button"><i class="fa fa-refresh"></i></button>
                            </span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="facebook_page">Facebook Page</label>
                        <div class="input-group">
                            <input type="text" value="{{ settings('facebook_page') }}" name="facebook_page" id="facebook_page" class="form-control" placeholder="flashtagcms">
                            <span class="input-group-btn">
                                <button class="btn btn-default reset-setting" type="button"><i class="fa fa-refresh"></i></button>
                            </span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="facebook_app_id">Facebook App ID</label>
                        <div class="input-group">
                            <input type="text" value="{{ settings('facebook_app_id') }}" name="facebook_app_id" id="facebook_app_id" class="form-control">
                            <span class="input-group-btn">
                                <button class="btn btn-default reset-setting" type="button"><i class="fa fa-refresh"></i></button>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="panel panel-default">
                <div class="panel-heading">Misc.</div>
                <div class="panel-body">
                    <div class="form-group">
                        <label for="ga_id">Google Universal Analytics ID</label>
                        <div class="input-group">
                            <input type="text" value="{{ settings('ga_id') }}" name="ga_id" id="ga_id" class="form-control" placeholder="UA-XXXXX-Y">
                            <span class="input-group-btn">
                                <button class="btn btn-default reset-setting" type="button"><i class="fa fa-refresh"></i></button>
                            </span>
                        </div>
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
<script>
    $(document).ready(function() {
        $('.reset-setting').click(function (e) {
            e.preventDefault();

            var key = $(this).parent().siblings('input').attr('name');

            $('<form action="{{ url('admin/settings') }}/'+key+'" method="POST">'
            +'<input type="hidden" name="_method" value="DELETE">'
            +'<input type="hidden" name="_token" value="{{ csrf_token() }}">'
            +'</form>').appendTo($(document.body)).submit();
        });
    });
</script>
@endsection
