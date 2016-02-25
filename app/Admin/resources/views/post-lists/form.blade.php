
@include('admin::partials.form-errors')

<div class="panel panel-default">
    <div class="panel-heading">Post List</div>
    <div class="panel-body">
        <div class="form-group">
            <label for="name">Name</label>
            <input type="text" value="{{ $postList->name or old('name') }}" name="name" id="name" class="form-control">
        </div>
    </div>
</div>

<div class="panel panel-default">
    <div class="panel-heading">Posts</div>
    <div class="panel-body">
        <post-list :post-list-id="{{ $postList->id }}"></post-list>
    </div>
</div>
