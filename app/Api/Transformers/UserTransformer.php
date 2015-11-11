<?php

namespace Flashtag\Api\Transformers;

use Flashtag\Data\User;

class UserTransformer extends Transformer
{
    /**
     * @param \Flashtag\Data\User $user
     * @return array
     */
    public function transform(User $user)
    {
        return [
            'id' => (int) $user->id,
            'email' => $user->email,
            'name' => $user->name,
            'created_at' => $user->created_at->getTimestamp(),
            'updated_at' => $user->updated_at->getTimestamp(),
        ];
    }
}
