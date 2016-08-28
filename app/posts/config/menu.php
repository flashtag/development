<?php

return [

    [
        'label' => 'Blog',
        'access' => 'editor',
        'icon' => '<span class="fa fa-newspaper-o"></span>',
        'items' => [
            [
                [
                    'label' => 'Posts',
                    'items' => [
                        [
                            'label' => 'All Posts',
                            'name' => 'posts',
                            'count' => \Flashtag\Posts\Post::count(),
                            'route' => route('admin::posts.index'),
                        ],
                        [
                            'label' => 'Fields',
                            'name' => 'post-fields',
                            'count' => \Flashtag\Posts\Field::count(),
                            'route' => route('admin::post-fields.index'),
                        ],
                        [
                            'label' => 'Lists',
                            'name' => 'post-lists',
                            'count' => \Flashtag\Posts\PostList::count(),
                            'route' => route('admin::post-lists.index'),
                        ],
                        [
                            'label' => 'Authors',
                            'name' => 'authors',
                            'count' => \Flashtag\Posts\Author::count(),
                            'route' => route('admin::authors.index'),
                        ],
                    ],
                ],
                [
                    'label' => 'Taxonomy',
                    'items' => [
                        [
                            'label' => 'Categories',
                            'name' => 'categories',
                            'count' => \Flashtag\Posts\Category::count(),
                            'route' => route('admin::categories.index'),
                        ],
                        [
                            'label' => 'Tags',
                            'name' => 'tags',
                            'count' => \Flashtag\Posts\Tag::count(),
                            'route' => route('admin::tags.index'),
                        ],
                    ]
                ],
            ]
        ],
    ],

];
