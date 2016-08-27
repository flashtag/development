<?php

namespace Flashtag\Posts;

use Illuminate\Support\Facades\Storage;

/**
 * Class PostRating
 *
 * @property int $id
 * @property int $post_id
 * @property string $ip
 * @property int $rater_id
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 * @property \Illuminate\Database\Eloquent\Model $post
 */
class PostRating extends Model
{
    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function post()
    {
        return $this->belongsTo(Post::class);
    }

    /**
     * Set the author's photo.
     *
     * @param string $value
     * @return string
     */
    public function setIpAttribute($value)
    {
        $this->attributes['ip'] = ip2long($value);
    }

    /**
     * @param int $value
     * @return string
     */
    public function getIpAttribute($value)
    {
        return long2ip($value);
    }

    /**
     * Delete the photo from the filesystem.
     *
     * @returns bool
     */
    private function deletePhoto()
    {
        return Storage::delete($this->photo);
    }
}
