@extends('admin::layout')

@section('content')
    <div id="Admin">
        <login csrf="{!! csrf_token() !!}"></login>
    </div>
@stop