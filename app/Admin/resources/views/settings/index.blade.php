@extends('admin::layout')

@section('content')
    @include('admin::partials.form-errors')

    <div class="panel panel-default">
        <div class="panel-heading">Settings</div>
        <div class="panel-body">
            <div class="form-group">
                <label for="site_name">Site Name</label>
                <input type="text" value="{{ settings('site_name') }}" name="site_name" id="site_name" class="form-control">
            </div>
            <div class="form-group">
                <label for="site_tagline">Site Tagline</label>
                <input type="text" value="{{ settings('site_tagline') }}" name="site_tagline" id="site_tagline" class="form-control">
            </div>
        </div>
    </div>
@endsection
