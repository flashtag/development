<?php

namespace Flashtag\Api\Http\Controllers\V1;

use Illuminate\Http\Request;
use Flashtag\Api\Transformers\PostListTransformer;
use Flashtag\Data\PostList;

class PostListsController extends Controller
{
    /**
     * @var \Flashtag\Data\PostList
     */
    private $postList;

    /**
     * @param \Flashtag\Data\PostList $postList
     */
    public function __construct(PostList $postList)
    {
        $this->postList = $postList;
    }

    /**
     * Display a listing of the postLists.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Dingo\Api\Http\Response
     */
    public function index(Request $request)
    {
        $count = $request->get('count', 100);
        $postLists = $this->postList->paginate($count);
        $this->appendPaginationLinks($postLists, $request);

        return $this->response->paginator($postLists, new PostListTransformer());
    }

    /**
     * Display the specified postList.
     *
     * @param int $id
     * @return \Dingo\Api\Http\Response
     */
    public function show($id)
    {
        $postList = $this->postList->findOrFail($id);

        return $this->response->item($postList, new PostListTransformer());
    }

    /**
     * Store a newly created postList in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @return \Dingo\Api\Http\Response
     */
    public function store(Request $request)
    {
        $postListData = $this->buildPostListFromRequest($request);
        $postList = $this->postList->create($postListData);
        $this->syncRelationships($postList, $request);

        return $this->response->item($postList, new PostListTransformer());
    }

    /**
     * Update the specified postList in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @param  int $id
     * @return \Dingo\Api\Http\Response
     */
    public function update(Request $request, $id)
    {
        $postListData = $this->buildPostListFromRequest($request);
        $postList = $this->postList->findOrFail($id);
        $postList->update($postListData);
        $this->syncRelationships($postList, $request);

        return $this->response->item($postList, new PostListTransformer());
    }

    /**
     * Build the postList data array from the request.
     *
     * @param \Illuminate\Http\Request $request
     * @return array
     */
    private function buildPostListFromRequest(Request $request)
    {
        return [
            'name' => $request->get('name'),
            'slug' => str_slug($request->get('name')),
        ];
    }

    /**
     * Remove the specified postList from storage.
     *
     * @param  int $id
     * @return \Dingo\Api\Http\Response
     */
    public function destroy($id)
    {
        $postList = $this->postList->findOrFail($id);
        $postList->delete();

        return $this->response->item($postList, new PostListTransformer());
    }

    private function syncRelationships($postList, $request)
    {
        //
    }
}
