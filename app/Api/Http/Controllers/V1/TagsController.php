<?php

namespace Flashtag\Api\Http\Controllers\V1;

use Illuminate\Http\Request;
use Flashtag\Api\Transformers\TagTransformer;
use Flashtag\Data\Tag;

class TagsController extends Controller
{
    /**
     * @var \Flashtag\Data\Tag
     */
    private $tag;

    /**
     * @param \Flashtag\Data\Tag $tag
     */
    public function __construct(Tag $tag)
    {
        $this->tag = $tag;
    }

    /**
     * Display a listing of the tags.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Dingo\Api\Http\Response
     */
    public function index(Request $request)
    {
        $count = $request->get('count', 100);
        $tags = $this->tag->paginate($count);

        $this->appendPaginationLinks($tags, $request);

        return $this->response->paginator($tags, new TagTransformer());
    }

    /**
     * Display the specified tag.
     *
     * @param int $id
     * @return \Dingo\Api\Http\Response
     */
    public function show($id)
    {
        $tag = $this->tag->findOrFail($id);

        return $this->response->item($tag, new TagTransformer());
    }

    /**
     * Store a newly created tag in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @return \Dingo\Api\Http\Response
     */
    public function store(Request $request)
    {
        $tagData = $this->buildTagFromRequest($request);
        $tag = $this->tag->create($tagData);

        return $this->response->item($tag, new TagTransformer());
    }

    /**
     * Update the specified tag in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @param  int $id
     * @return \Dingo\Api\Http\Response
     */
    public function update(Request $request, $id)
    {
        $tagData = $this->buildTagFromRequest($request);
        $tag = $this->tag->findOrFail($id);
        $tag->update($tagData);

        return $this->response->item($tag, new TagTransformer());
    }

    /**
     * Build the tag data array from the request.
     *
     * @param \Illuminate\Http\Request $request
     * @return array
     */
    private function buildTagFromRequest(Request $request)
    {
        return [
            'name' => $request->get('name'),
            'slug' => str_slug($request->get('name')),
            'description' => $request->get('description'),
        ];
    }

    /**
     * Remove the specified tag from storage.
     *
     * @param  int $id
     * @return \Dingo\Api\Http\Response
     */
    public function destroy($id)
    {
        $tag = $this->tag->findOrFail($id);
        $tag->delete();

        return $this->response->item($tag, new TagTransformer());
    }
}
