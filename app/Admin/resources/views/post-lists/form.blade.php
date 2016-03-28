
@include('admin::partials.form-errors')

<div class="panel panel-default">
    <div class="panel-heading"><h3 class="panel-title">Post List</h3></div>
    <div class="panel-body">
        <div class="form-group">
            <label for="name">Name</label>
            <input type="text" value="{{ $postList->name or old('name') }}" name="name" id="name" class="form-control">
        </div>
    </div>
</div>
