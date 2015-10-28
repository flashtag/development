<?php

namespace spec\Scribbl\Api;

use Illuminate\Database\Eloquent\Collection;
use League\Fractal\Manager;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;
use Scribbl\Api\Exceptions\TransformerNotFound;
use Scribbl\Post;

class FractalDataFormatterSpec extends ObjectBehavior
{
    function let(Manager $manager)
    {
        $this->beConstructedWith($manager);
    }

    function it_is_initializable()
    {
        $this->shouldHaveType('Scribbl\Api\FractalDataFormatter');
    }

    function it_throws_exception_when_no_getTransformerClass_method_and_no_default_transformer_exists_on_item(CrappyPost $post)
    {
        $this->shouldThrow(TransformerNotFound::class)->duringItem($post);
    }

    function it_throws_exception_when_no_getTransformerClass_method_and_no_default_transformer_exists_on_collection(Collection $collection, CrappyPost $post)
    {
        $collection->first()->willReturn($post);

        $this->shouldThrow(TransformerNotFound::class)->duringCollection($collection);
    }

    function it_throws_an_exception_when_getTransformerClass_returns_nonexistent_transformer_on_item(NotAsCrappyPost $post)
    {
        $post->getTransformerClass()->willReturn('\Scribbl\Api\Transformers\NoTransformer');

        $this->shouldThrow(TransformerNotFound::class)->duringItem($post);
    }

    function it_throws_an_exception_when_getTransformerClass_returns_nonexistent_transformer_on_collection(Collection $collection, NotAsCrappyPost $post)
    {
        $post->getTransformerClass()->willReturn('\Scribbl\Api\Transformers\NoTransformer');
        $collection->first()->willReturn($post);

        $this->shouldThrow(TransformerNotFound::class)->duringCollection($collection);
    }

    function it_makes_an_item_having_valid_getTransformerClass_method(NotAsCrappyPost $post)
    {
        $post->getTransformerClass()->willReturn('\Scribbl\Api\Transformers\PostTransformer');

        $this->item($post)->shouldBeArray();
    }

    function it_makes_a_collection_with_item_having_valid_getTransformerClass_method(Collection $collection, NotAsCrappyPost $post)
    {
        $post->getTransformerClass()->willReturn('\Scribbl\Api\Transformers\PostTransformer');
        $collection->first()->willReturn($post);

        $this->collection($collection)->shouldBeArray();
    }

    function it_makes_an_item_having_default_transformer()
    {
        $post = new Post();
        $this->item($post)->shouldBeArray();
    }

    function it_makes_a_collection_with_item_having_default_transformer(Collection $collection)
    {
        $post = new Post();
        $collection->first()->willReturn($post);

        $this->collection($collection)->shouldBeArray();
    }

    // TODO: Items with includes... ?
}

class CrappyPost {}
class NotAsCrappyPost { public function getTransformerClass() {} }