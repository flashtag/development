<?php

namespace Flashtag\Api\Transformers;

use Flashtag\Data\Author;

class AuthorTransformer extends Transformer
{
    /**
     * @param \Flashtag\Data\Author $author
     * @return array
     */
    public function transform(Author $author)
    {
        return [
            'id' => (int) $author->id,
            'name' => $author->name,
            'slug' => $author->slug,
            'photo' => $author->photo,
            'link' => $author->link,
            'bio' => $author->bio,
            'created_at' => $author->created_at->getTimestamp(),
            'updated_at' => $author->updated_at->getTimestamp(),
        ];
    }
}
