<?php

namespace Flashtag\Api\Http\Controllers\V1;

use Illuminate\Http\Request;
use Flashtag\Api\Transformers\AuthorTransformer;
use Flashtag\Posts\Author;

class AuthorsController extends Controller
{
    /**
     * @var \Flashtag\Posts\Author
     */
    private $author;

    /**
     * @param \Flashtag\Posts\Author $author
     */
    public function __construct(Author $author)
    {
        $this->author = $author;
    }

    /**
     * Display a listing of the authors.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Dingo\Api\Http\Response
     */
    public function index(Request $request)
    {
        $count = $request->get('count', 100);
        $authors = $this->author->paginate($count);

        $this->appendPaginationLinks($authors, $request);

        return $this->response->paginator($authors, new AuthorTransformer());
    }

    /**
     * Display the specified author.
     *
     * @param int $id
     * @return \Dingo\Api\Http\Response
     */
    public function show($id)
    {
        $author = $this->author->findOrFail($id);

        return $this->response->item($author, new AuthorTransformer());
    }

    /**
     * Store a newly created author in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @return \Dingo\Api\Http\Response
     */
    public function store(Request $request)
    {
        $authorData = $this->buildAuthorFromRequest($request);
        $author = $this->author->create($authorData);

        return $this->response->item($author, new AuthorTransformer());
    }

    /**
     * Update the specified author in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @param  int $id
     * @return \Dingo\Api\Http\Response
     */
    public function update(Request $request, $id)
    {
        $authorData = $this->buildAuthorFromRequest($request);
        $author = $this->author->findOrFail($id);
        $author->update($authorData);

        return $this->response->item($author, new AuthorTransformer());
    }

    /**
     * Build the author data array from the request.
     *
     * @param \Illuminate\Http\Request $request
     * @return array
     */
    private function buildAuthorFromRequest(Request $request)
    {
        return [
            'name' => $request->get('name'),
            'slug' => str_slug($request->get('name')),
            'bio' => $request->get('bio'),
        ];
    }

    /**
     * Remove the specified author from storage.
     *
     * @param  int $id
     * @return \Dingo\Api\Http\Response
     */
    public function destroy($id)
    {
        $author = $this->author->findOrFail($id);
        $author->delete();

        return $this->response->item($author, new AuthorTransformer());
    }
}
