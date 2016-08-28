<?php

namespace Flashtag\Posts;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

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
     * The attributes that aren't mass assignable.
     *
     * @var array
     */
    protected $guarded = ['id', 'created_at', 'updated_at'];

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
        if (! empty($this->photo)) {
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
        if ($this->photo == $value) {
            return $value;
        }

        if (! empty($this->photo)) {
            $this->deletePhoto();
        }

        $this->attributes['photo'] = $value;
    }

    /**
     * Delete the photo from the filesystem.
     *
     * @returns bool
     */
    private function deletePhoto()
    {
        if (! Storage::exists($this->photo)) {
            return false;
        }

        return Storage::delete($this->photo);
    }

    public static function getBySlug($author_slug)
    {
        return static::where('slug', $author_slug)
            ->firstOrFail();
    }
}
