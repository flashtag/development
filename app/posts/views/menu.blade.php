
<li class="list-group-item persistent-secondary {{ Flashtag\Admin\set_active(['posts','post-fields','post-lists','tags','categories','pages']) }}"
    data-target="#content-secondary">
    <a href="#">
        <span class="fa fa-newspaper-o"></span>
        <span class="list-group-item-value">Posts</span>
    </a>
    <div id="content-secondary" class="nav-pf-persistent-secondary">
        <div class="persistent-secondary-header">
            <a class="fa fa-arrow-circle-o-left" href="#" data-toggle="collapse-secondary-nav"></a>
            <span>Content</span>
        </div>
        <h5>Posts</h5>
        <ul class="list-group">
            <li class="list-group-item {{ Flashtag\Admin\set_active('posts') }}">
                <a href="{{ route('admin::posts.index') }}">
                    <span class="list-group-item-value">All Posts</span>
                    <div class="badge-container-pf">
                        <span class="badge">{{ Flashtag\Posts\Post::count() }}</span>
                    </div>
                </a>
            </li>
            <li class="list-group-item {{ Flashtag\Admin\set_active('post-fields') }}">
                <a href="{{ route('admin::post-fields.index') }}">
                    <span class="list-group-item-value">Fields</span>
                    <div class="badge-container-pf">
                        <span class="badge">{{ Flashtag\Posts\Field::count() }}</span>
                    </div>
                </a>
            </li>
            <li class="list-group-item {{ Flashtag\Admin\set_active('post-lists') }}">
                <a href="{{ route('admin::post-lists.index') }}">
                    <span class="list-group-item-value">Lists</span>
                    <div class="badge-container-pf">
                        <span class="badge">{{ Flashtag\Posts\PostList::count() }}</span>
                    </div>
                </a>
            </li>
            <li class="list-group-item {{ Flashtag\Admin\set_active('authors') }}">
                <a href="{{ route('admin::authors.index') }}">
                    <span class="list-group-item-value">Authors</span>
                    <div class="badge-container-pf">
                        <span class="badge">{{ Flashtag\Posts\Author::count() }}</span>
                    </div>
                </a>
            </li>
        </ul>
        <h5>Taxonomy</h5>
        <ul class="list-group">
            <li class="list-group-item {{ Flashtag\Admin\set_active('categories') }}">
                <a href="{{ route('admin::categories.index') }}">
                    <span class="list-group-item-value">Categories</span>
                    <div class="badge-container-pf">
                        <span class="badge">{{ Flashtag\Posts\Category::count() }}</span>
                    </div>
                </a>
            </li>
            <li class="list-group-item {{ Flashtag\Admin\set_active('tags') }}">
                <a href="{{ route('admin::tags.index') }}">
                    <span class="list-group-item-value">Tags</span>
                    <div class="badge-container-pf">
                        <span class="badge">{{ Flashtag\Posts\Tag::count() }}</span>
                    </div>
                </a>
            </li>
        </ul>
    </div>
</li>
