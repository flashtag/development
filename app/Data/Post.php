<?php

namespace Flashtag\Data;

use Carbon\Carbon;
use Flashtag\Data\Presenters\PostPresenter;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use McCool\LaravelAutoPresenter\HasPresenter;
use Venturecraft\Revisionable\RevisionableTrait;

/**
 * Class Post
 *
 * @property int $id
 * @property int $category_id
 * @property string $title
 * @property string $slug
 * @property string $subtitle
 * @property string $body
 * @property boolean $is_published
 * @property string $image
 * @property string $meta_description
 * @property string $meta_canonical
 * @property \Carbon\Carbon $start_showing_at
 * @property \Carbon\Carbon $stop_showing_at
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 * @property \Illuminate\Database\Eloquent\Model $category
 * @property \Illuminate\Database\Eloquent\Model $author
 * @property \Illuminate\Database\Eloquent\Collection $fields
 * @property \Illuminate\Database\Eloquent\Collection $tags
 * @property \Illuminate\Database\Eloquent\Collection $ratings
 * @property \Illuminate\Database\Eloquent\Collection $revisionHistory
 */
class Post extends Model implements HasPresenter
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
        'category_id' => 'integer',
        'is_published' => 'boolean',
        'show_author' => 'boolean',
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
        return PostPresenter::class;
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function author()
    {
        return $this->belongsTo(Author::class);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\MorphToMany
     */
    public function tags()
    {
        return $this->morphToMany(Tag::class, 'taggable');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function fields()
    {
        return $this->belongsToMany(Field::class)->withPivot('value');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\MorphMany
     */
    public function revisions()
    {
        return $this->revisionHistory();
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function ratings()
    {
        return $this->hasMany(PostRating::class);
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
     * Get the average rating.
     *
     * @return string
     */
    public function getRating()
    {
        $ratings = $this->ratings;

        return number_format($ratings->sum('value') / $ratings->count());
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
     * Change the post's category.
     *
     * @param \Flashtag\Data\Category $category
     * @return \Illuminate\Database\Eloquent\Model
     */
    public function changeCategoryTo($category)
    {
        return $this->category()->associate($category);
    }

    /**
     * Add tags to the post.
     *
     * @param array $tags
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function addTags($tags)
    {
        return new Collection($this->tags()->saveMany($tags));
    }

    /**
     * Save fields.
     *
     * @param \Illuminate\Support\Collection|array $fields
     */
    public function saveFields($fields)
    {
        $postFields = Field::all();

        $getValue = function ($field) use ($fields) {
            $default = $field->pivot ? $field->pivot->value : null;

            return isset($fields[$field->name]) ? $fields[$field->name] : $default;
        };

        $sync = $postFields->reduce(function ($carry, $field) use ($getValue) {
            $carry[$field->id] = ['value' => $getValue($field)];

            return $carry;
        }, []);

        $this->fields()->sync($sync);
    }

    /**
     * Reorder the post within its category.
     *
     * @param int $order
     * @return bool
     */
    public function reorder($order)
    {
        $current = $this->order;

        if ($order === $current) {
            return false;
        }

        static::incrementCategoryOrderBetween($this->category_id, $current, $order);

        $this->order = $order;

        return $this->save();
    }

    /**
     * Increment all the posts in a category between an old and new order.
     *
     * @param int $categoryId
     * @param int $old
     * @param int $new
     * @return int The number of rows affected.
     */
    public static function incrementCategoryOrderBetween($categoryId, $old, $new)
    {
        if ($new < $old) {
            $increment = '+1';
            $whereBetween = [$new, $old];
        } else {
            $increment = '-1';
            $whereBetween = [$old, $new];
        }

        $query = sprintf(
            'UPDATE posts
             SET "order" = "order" %s
             WHERE category_id = ? AND "order" BETWEEN ? AND ?',
            $increment
        );

        return \DB::update(\DB::raw($query), array_merge([$categoryId], $whereBetween));
    }

    /**
     * Add an image to the post.
     *
     * @param \Symfony\Component\HttpFoundation\File\UploadedFile $image
     */
    public function addImage($image)
    {
        $name = 'post__'.$this->slug.'.'.$this->imageExtension($image);
        $image->move(public_path('images/media'), $name);
        $this->image = $name;

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
     * Remove an image from a post and delete it.
     */
    public function removeImage()
    {
        $img = '/public/images/media/'.$this->image;

        if (\Storage::exists($img)) {
            \Storage::delete($img);
        }

        $this->image = null;
        $this->save();
    }

    /**
     * Get the latest visible posts.
     *
     * @param int|null $count
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public static function getLatest($count = 10)
    {
        $query = static::showing()
            ->with('author', 'category')
            ->orderBy('start_showing_at', 'DESC')
            ->orderBy('created_at', 'DESC');

        return $query->simplePaginate($count);
    }

    /**
     * Get a post by its slug.
     *
     * @param string $post_slug
     * @return Post
     */
    public static function getBySlug($post_slug)
    {
        return static::with('fields', 'author', 'category')
            ->where('slug', $post_slug)
            ->firstOrFail();
    }

    public static function search($search, $columns = [])
    {
        if (empty($columns)) {
            $columns = ['title', 'subtitle', 'body'];
        }

        // Check if query is surrounded by double or single quotes
        if (preg_match('/^(["\']).*\1$/m', $search) !== false) {
            $search = str_replace('"', " ", $search);
            $search = str_replace("'", " ", $search);
        } else {
            $search = str_replace(' ', '%', $search);
        }

        return static::where(function ($query) use ($columns, $search) {
            foreach ($columns as $column) {
                $query->orWhere($column, 'LIKE', "%{$search}%"); 
            }
        })->get();
    }

    /**
     * Whether or not the post is showing.
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
}
