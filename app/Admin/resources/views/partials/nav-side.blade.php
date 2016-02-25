
<div class="Side-nav panel">
    <div class="list-group">
        <a class="list-group-item" href="/admin/">
            <i class="fa fa-home"></i> Home
        </a>
        <a class="list-group-item" href="/admin/posts">
            <i class="fa fa-newspaper-o"></i> Posts
        </a>
        <a class="list-group-item indented" href="/admin/post-fields">
            <i class="fa fa-list-alt"></i> Post fields
        </a>
        <a class="list-group-item indented" href="/admin/post-lists">
            <i class="fa fa-th-list"></i> Post lists
        </a>
        <a class="list-group-item" href="/admin/categories">
            <i class="fa fa-columns"></i> Categories
        </a>
        <a class="list-group-item" href="/admin/tags">
            <i class="fa fa-tags"></i> Tags
        </a>
        <a class="list-group-item" href="/admin/authors">
            <i class="fa fa-pencil-square-o"></i> Authors
        </a>
        @if ($current_user->admin)
            <a class="list-group-item" href="/admin/users">
                <i class="fa fa-users"></i> Users
            </a>
            <!-- TODO: Settings
            <a class="list-group-item" href="/admin/settings">
                <i class="fa fa-gear"></i> Settings
            </a>
            -->
        @endif
    </div>
</div>

<div class="flashtag">
    <!-- You don't have to leave this, but it would be nice if you did -->
    <div class="flashtag__link"><a href="http://flashtag.org" title="&copy; Ryan Winchester">FLASHTAG</a></div>
</div>
