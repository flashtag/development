
<div class="nav-pf-vertical nav-pf-vertical-with-secondary-nav">
    <ul class="list-group">
        <li class="list-group-item {{ Flashtag\Admin\set_active('') }}">
            <a href="/admin">
                <span class="fa fa-dashboard"></span>
                <span class="list-group-item-value">Dashboard</span>
            </a>
        </li>
        <li class="list-group-item persistent-secondary {{ Flashtag\Admin\set_active(['posts','post-fields','post-lists','tags','categories','pages']) }}"
            data-target="#content-secondary">
            <a href="#">
                <span class="fa fa-newspaper-o"></span>
                <span class="list-group-item-value">Pages</span>
            </a>
            <div id="content-secondary" class="nav-pf-persistent-secondary">
                <div class="persistent-secondary-header">
                    <a class="fa fa-arrow-circle-o-left" href="#" data-toggle="collapse-secondary-nav"></a>
                    <span>Pages</span>
                </div>
                <h5>Pages</h5>
                <ul class="list-group">
                    <li class="list-group-item {{ Flashtag\Admin\set_active('pages') }}">
                        <a href="{{ route('admin::pages.index') }}">
                            <span class="list-group-item-value">Pages</span>
                            <div class="badge-container-pf">
                                <span class="badge">{{ Flashtag\Core\Page::count() }}</span>
                            </div>
                        </a>
                    </li>
                </ul>
            </div>
        </li>

        @foreach (Flashtag\Admin\menu() as $menu)
            @include($menu)
        @endforeach

        @if ($current_user->admin)
            <li class="list-group-item persistent-secondary {{ Flashtag\Admin\set_active(['users','settings']) }}" data-target="#admin-secondary">
                <a href="#">
                    <span class="fa fa-cog"></span>
                    <span class="list-group-item-value">Admin</span>
                </a>
                <div id="admin-secondary" class="nav-pf-persistent-secondary">
                    <div class="persistent-secondary-header">
                        <a class="fa fa-arrow-circle-o-left" href="#" data-toggle="collapse-secondary-nav"></a>
                        <span>Admin</span>
                    </div>
                    <h5>Administration</h5>
                    <ul class="list-group">
                        <li class="list-group-item {{ Flashtag\Admin\set_active('users') }}">
                            <a href="{{ route('admin::users.index') }}">
                                <span class="list-group-item-value">Users</span>
                                <div class="badge-container-pf">
                                    <span class="badge">{{ Flashtag\Auth\User::count() }}</span>
                                </div>
                            </a>
                        </li>
                        <li class="list-group-item {{ Flashtag\Admin\set_active('settings') }}">
                            <a href="{{ route('admin::settings.index') }}">
                                <span class="list-group-item-value">Settings</span>
                            </a>
                        </li>
                    </ul>
                </div>
            </li>
        @endif
    </ul>
</div>
