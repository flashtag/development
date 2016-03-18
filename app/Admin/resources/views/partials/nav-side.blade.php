
<div class="Side-nav panel">
    <div class="list-group">
        <a class="list-group-item {{ Flashtag\Admin\set_active('') }}" href="/admin/">
            <i class="fa fa-home"></i> Home
        </a>
        <a class="list-group-item {{ Flashtag\Admin\set_active('posts') }}" href="/admin/posts">
            <i class="fa fa-sticky-note-o"></i> Posts
        </a>
        <a class="list-group-item indented {{ Flashtag\Admin\set_active('post-fields') }}" href="/admin/post-fields">
            <i class="fa fa-list-alt"></i> Custom fields
        </a>
        <a class="list-group-item indented {{ Flashtag\Admin\set_active('post-lists') }}" href="/admin/post-lists">
            <i class="fa fa-th-list"></i> Lists
        </a>
        <a class="list-group-item indented {{ Flashtag\Admin\set_active('categories') }}" href="/admin/categories">
            <i class="fa fa-columns"></i> Categories
        </a>
        <a class="list-group-item indented {{ Flashtag\Admin\set_active('tags') }}" href="/admin/tags">
            <i class="fa fa-tags"></i> Tags
        </a>
        <a class="list-group-item indented {{ Flashtag\Admin\set_active('authors') }}" href="/admin/authors">
            <i class="fa fa-pencil-square-o"></i> Authors
        </a>
        <a class="list-group-item {{ Flashtag\Admin\set_active('pages') }}" href="/admin/pages">
            <i class="fa fa-newspaper-o"></i> Pages
        </a>
        @if ($current_user->admin)
            <a class="list-group-item {{ Flashtag\Admin\set_active('users') }}" href="/admin/users">
                <i class="fa fa-users"></i> Users
            </a>
            <a class="list-group-item {{ Flashtag\Admin\set_active('settings') }}" href="/admin/settings">
                <i class="fa fa-gear"></i> Settings
            </a>
        @endif
    </div>
</div>

<div class="flashtag">
    <!-- You don't have to leave this, but it would be nice if you did -->
    <div class="flashtag__link"><a href="http://flashtag.org" title="&copy; Ryan Winchester">FLASHTAG</a></div>
</div>
