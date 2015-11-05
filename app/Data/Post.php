<?php

namespace Flashtag\Data;

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
 * @property int $order
 * @property string $body
 * @property boolean $is_published
 * @property \Carbon\Carbon $start_showing_at
 * @property \Carbon\Carbon $stop_showing_at
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 * @property \Illuminate\Database\Eloquent\Model $category
 * @property \Illuminate\Database\Eloquent\Model $author
 * @property \Illuminate\Database\Eloquent\Model $meta
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
     * @return \Illuminate\Database\Eloquent\Relations\MorphOne
     */
    public function meta()
    {
        return $this->morphOne(MetaTag::class, 'meta_taggable');
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
     * @param \Flashtag\Data\Category $category
     * @return \Illuminate\Database\Eloquent\Model
     */
    public function changeCategoryTo($category)
    {
        return $this->category()->associate($category);
    }

    /**
     * @param array $tags
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function addTags($tags)
    {
        return new Collection($this->tags()->saveMany($tags));
    }

    /**
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
     * Move the post to a new order.
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

        return \DB::update(
            \DB::raw(
                "UPDATE `posts`
                 SET `order` = `order` {$increment}
                 WHERE `category_id` = ? AND `order` BETWEEN ? AND ?"
            ),
            array_merge([$categoryId], $whereBetween)
        );
    }
}
