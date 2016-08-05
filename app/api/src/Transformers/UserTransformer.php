<?php

namespace Flashtag\Api\Transformers;

use Flashtag\Auth\User;

class UserTransformer extends Transformer
{
    /**
     * @param \Flashtag\Auth\User $user
     * @return array
     */
    public function transform(User $user)
    {
        return [
            'id' => (int) $user->id,
            'email' => $user->email,
            'name' => $user->name,
            'admin' => (bool) $user->admin,
            'created_at' => $user->created_at->getTimestamp(),
            'updated_at' => $user->updated_at->getTimestamp(),
        ];
    }
}
