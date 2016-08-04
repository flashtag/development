<?php

namespace Flashtag\Core;

use Carbon\Carbon;
use Flashtag\Posts\Presenters\PagePresenter;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use McCool\LaravelAutoPresenter\HasPresenter;
use Venturecraft\Revisionable\RevisionableTrait;

/**
 * Class Page
 *
 * @property int $id
 * @property string $title
 * @property string $slug
 * @property string $template
 * @property string $subtitle
 * @property string $body
 * @property boolean $is_published
 * @property string $image
 * @property string $meta_description
 * @property string $meta_canonical
 * @property boolean $is_locked
 * @property int $locked_by_id
 * @property \Carbon\Carbon $start_showing_at
 * @property \Carbon\Carbon $stop_showing_at
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 * @property \Illuminate\Database\Eloquent\Collection $revisionHistory
 */
class Page extends Model implements HasPresenter
{
    use RevisionableTrait;

    /**
     * The attributes that are not mass assignable.
     *
     * @var array
     */
    protected $guarded = ['id', 'created_at', 'updated_at'];

    /**
     * The attributes that should be mutated to dates.
     *
     * @var array
     */
    protected $dates = ['start_showing_at', 'stop_showing_at'];

    /**
     * The attributes that should be casted to native types.
     *
     * @var array
     */
    protected $casts = [
        'id' => 'integer',
        'is_published' => 'boolean',
    ];

    /**
     * Remove old revisions.
     *
     * @var bool
     */
    protected $revisionCleanup = true;

    /**
     * A list of properties to not track the revision history of.
     *
     * @var array
     */
    protected $dontKeepRevisionOf = ['slug', 'is_locked', 'locked_by_id'];

    /**
     * Maintain a maximum of 500 changes at any point of time, while cleaning up old revisions.
     *
     * @var int
     */
    protected $historyLimit = 500;

    /**
     * @return string
     */
    public function getPresenterClass()
    {
        return PagePresenter::class;
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\MorphMany
     */
    public function revisions()
    {
        return $this->revisionHistory();
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function lockedBy()
    {
        return $this->belongsTo(User::class, 'locked_by_id');
    }

    /**
     * Lock the post.
     *
     * @param int $user_id
     *
     * @return bool
     */
    public function lock($user_id)
    {
        $this->is_locked = true;
        $this->locked_by_id = $user_id;

        return $this->save();
    }

    /**
     * Unlock the post.
     *
     * @return bool
     */
    public function unlock()
    {
        $this->is_locked = false;
        $this->locked_by_id = null;

        return $this->save();
    }

    /**
     * Publish the post. Or un-publish by passing in false.
     *
     * @param bool $published
     */
    public function publish($published = true)
    {
        $this->is_published = $published;
        $this->save();
    }

    /**
     * Un-publish the post.
     */
    public function unpublish()
    {
        $this->publish(false);
    }

    /**
     * Add an image to the page.
     *
     * @param \Symfony\Component\HttpFoundation\File\UploadedFile $image
     */
    public function addImage($image)
    {
        $this->removeImage();
        $name = 'page-'.$this->id.'__'.$this->slug.'.'.$this->imageExtension($image);
        $image->move(public_path('images/media'), $name);
        $this->image = $name;

        // TODO: Generate thumbnails

        $this->save();
    }

    /**
     * Add a cover image to the page.
     *
     * @param \Symfony\Component\HttpFoundation\File\UploadedFile $image
     */
    public function addCoverImage($image)
    {
        $this->removeCoverImage();
        $name = 'page-'.$this->id.'__cover__'.$this->slug.'.'.$this->imageExtension($image);
        $image->move(public_path('images/media'), $name);
        $this->cover_image = $name;

        $this->save();
    }

    /**
     * @param \Symfony\Component\HttpFoundation\File\UploadedFile $image
     * @return string|null
     */
    private function imageExtension($image)
    {
        $parts = explode('.', $image->getClientOriginalName());

        return array_pop($parts);
    }

    /**
     * Remove an image from a page and delete it.
     */
    public function removeImage()
    {
        if (! is_null($this->image)) {
            $img = '/public/images/media/' . $this->image;

            if (is_file(base_path($img))) {
                Storage::delete($img);
            }

            $this->image = null;
            $this->save();
        }
    }

    /**
     * Remove an image from a post and delete it.
     */
    public function removeCoverImage()
    {
        if (! is_null($this->cover_image)) {
            $img = '/public/images/media/' . $this->cover_image;

            if (is_file(base_path($img))) {
                Storage::delete($img);
            }

            $this->cover_image = null;
            $this->save();
        }
    }

    /**
     * Get a page by its slug.
     *
     * @param string $page_slug
     * @return Post
     */
    public static function getBySlug($page_slug)
    {
        return static::where('slug', $page_slug)
            ->firstOrFail();
    }

    /**
     * Whether or not the page is showing.
     *
     * @return bool
     */
    public function isShowing()
    {
        if (! $this->is_published) {
            return false;
        }

        $startShowing = $this->start_showing_at ?: new Carbon('1999-01-01');
        $stopShowing = $this->stop_showing_at ?: new Carbon('2038-01-01');

        return ($startShowing->isPast() && $stopShowing->isFuture());
    }

    /**
     * Scope a query to only include posts that are available to show.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeShowing($query)
    {
        return $query->where('is_published', true)
            ->where(function ($query) {
                $query->where('start_showing_at', '<', new Carbon())
                    ->orWhere('start_showing_at', null);
            })
            ->where(function ($query) {
                $query->where('stop_showing_at', '>', new Carbon())
                    ->orWhere('stop_showing_at', null);
            });
    }

    /**
     * Scope a query to perform a very basic search of pages.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $search
     * @param array $columns
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeSearch($query, $search, $columns = [])
    {
        if (empty($columns)) {
            $columns = ['title', 'subtitle', 'body'];
        }

        // Check if query is surrounded by double or single quotes
        if (preg_match('/^(["\']).*\1$/m', $search) !== false) {
            // Remove quotes
            $search = str_replace('"', "", $search);
            $search = str_replace("'", "", $search);
        } else {
            // If not surrounded by quotes, replace all spaces with wildcard
            $search = str_replace(' ', '%', $search);
        }

        return $query->where(function ($query) use ($columns, $search) {
            foreach ($columns as $column) {
                $query->orWhere($column, 'LIKE', "%{$search}%");
            }
        });
    }

    public function view()
    {
        if (str_contains($this->template, settings('theme')) !== false) {
            return 'flashtag::page-templates.default';
        }

        return $this->template;
    }
}
