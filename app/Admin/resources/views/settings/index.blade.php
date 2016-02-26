@extends('admin::layout')

@section('content')
    @include('admin::partials.form-errors')

    <h4 style="text-align:right;"><small>Flashtag v{{ \Flashtag\Data\Flashtag::VERSION }}</small></h4>

    <div class="panel panel-default">
        <div class="panel-heading">Site Settings</div>
        <div class="panel-body">
            <div class="form-group">
                <label for="site_name">Site Name</label>
                <input type="text" value="{{ settings('site_name') }}" name="site_name" id="site_name" class="form-control">
            </div>
            <div class="form-group">
                <label for="site_tagline">Site Tagline</label>
                <input type="text" value="{{ settings('site_tagline') }}" name="site_tagline" id="site_tagline" class="form-control">
            </div>
            {{-- Only show template select if using flashtag/front --}}
            @if (class_exists(\Flashtag\Front\Template::class))
            <div class="form-group">
                <label for="site_template">Site Template</label>
                <select name="site_template" id="site_template" class="form-control">
                    @foreach (\Flashtag\Front\Template::lists() as $template)
                        <option value="{{ $template }}"
                                {{ settings('site_template') == $template ? 'selected' : '' }}>
                            {{ $template }}
                        </option>
                    @endforeach
                </select>
            </div>
            @endif
        </div>
    </div>
@endsection
