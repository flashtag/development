
@foreach ($posts as $post)
    <div class="post-preview">
        <a href="/posts/{{ $post->slug }}">
            <h2 class="post-title">
                {{ $post->title }}
            </h2>
            <h3 class="post-subtitle">
                {{ $post->subtitle }}
            </h3>
        </a>
        <p class="post-meta">
            Posted
            @if ($post->show_author && $post->author) <span class="Post__author">by <a href="/authors/{{ $post->author->slug }}">{{ $post->author->name }}</a></span> @endif
            on {{ $post->publishedOn }}
            @if ($post->category) in <a href="/{{ $post->category->slug }}">{{ $post->category->name }}</a> @endif
        </p>
    </div>
    <hr>
@endforeach
