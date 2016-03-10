# Flashtag/Front


Making your own theme:

## 1. Make a composer package

Add `theme.php`

```php
<?php

return [

    'name' => 'my-theme',
    'version' => '0.0.1',
    'path' => __DIR__,

];

```

## 2. Create your views

| blade views       | variables available
|-------------------|---------------------
| home              | 
| page              | 
| posts.index       | Collection $posts
| posts.show        | Post $post
| posts.category    | Category $category, Collection $posts
| posts.tag         | Tag $tag, Collection $posts
| posts.author      | Author $author, Collection $posts

## 3. Make a service provider

Publish

```php
public function boot()
{
    // Load your theme config
    $config = require __DIR__.'/../theme.php';
    
    // Create new theme instance
    $theme = new \Flashtag\Front\Theme($config);

    // Register your views and assets for publishing
    $this->publishes($theme->publishes(), 'public');
}
```
