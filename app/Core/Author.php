<?php

namespace Flashtag\Core;

use Illuminate\Database\Eloquent\Model;

/**
 * Class Author
 *
 * @property int $id
 * @property string $name
 * @property string $bio
 * @property string $photo
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 * @property \Illuminate\Database\Eloquent\Collection $posts
 */
class Author extends Model
{
    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function posts()
    {
        return $this->hasMany(Post::class);
    }

    /**
     * Delete the author from the database.
     *
     * @return bool|null
     * @throws \Exception
     */
    public function delete()
    {
        if (isset($this->attributes['photo'])) {
            $this->deletePhoto();
        }

        parent::delete();
    }

    /**
     * Set the author's photo.
     *
     * @param string $value
     * @return string
     */
    public function setPhotoAttribute($value)
    {
        if ($this->attributes['photo'] == $value) {
            return;
        }

        $this->deletePhoto();

        $this->attributes['photo'] = $value;
    }

    /**
     * Delete the photo from the filesystem.
     *
     * @returns bool
     */
    private function deletePhoto()
    {
        return \Storage::delete($this->photo);
    }
}
