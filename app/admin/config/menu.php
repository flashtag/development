<?php

return [

    [
        'label' => 'Pages',
        'access' => 'editor',
        'icon' => '<span class="fa fa-newspaper-o"></span>',
        'items' => [
            [
                [
                    'label' => 'Pages',
                    'items' => [
                        [
                            'label' => 'All Pages',
                            'name' => 'pages',
                            'count' => Flashtag\Core\Page::count(),
                            'route' => route('admin::pages.index'),
                        ],
                    ]
                ],
            ]
        ],
    ],

    [
        'label' => 'Admin',
        'access' => 'admin',
        'items' => [
            [
                [
                    'label' => 'Administration',
                    'icon' => '<i class="fa fa-gears"></i>',
                    'items' => [
                        [
                            'label' => 'Users',
                            'name' => 'users',
                            'count' => Flashtag\Auth\User::count(),
                            'route' => route('admin::users.index'),
                        ],
                        [
                            'label' => 'Settings',
                            'name' => 'settings',
                            'route' => route('admin::settings.index'),
                        ]
                    ]
                ]
            ]
        ]
    ],

];