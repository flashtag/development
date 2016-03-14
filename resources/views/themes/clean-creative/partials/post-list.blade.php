
@foreach ($posts as $post)
    <div class="post-preview">
        <a href="{{ route('posts.show', [$post->slug]) }}">
            <h2 class="post-title">
                {{ $post->title }}
            </h2>
            <h3 class="post-subtitle">
                {{ $post->subtitle }}
            </h3>
        </a>
        <p class="post-meta">
            Posted
            @if ($post->show_author && $post->author) <span class="Post__author">by <a href="{{ route('authors.show', [$post->author->slug]) }}">{{ $post->author->name }}</a></span> @endif
            on {{ $post->publishedOn }}
            @if ($post->category) in <a href="{{ route('categories.show', [$post->category->slug]) }}">{{ $post->category->name }}</a> @endif
        </p>
    </div>
    <hr>
@endforeach

<ul class="pager">
    @if ($posts->currentPage() > 1)
        <li class="previous">
            <a href="{{ $posts->previousPageUrl() }}">&larr; Newer Posts</a>
        </li>
    @endif
    @if ($posts->hasMorePages())
        <li class="next">
            <a href="{{ $posts->nextPageUrl() }}">Older Posts &rarr;</a>
        </li>
    @endif
</ul>
