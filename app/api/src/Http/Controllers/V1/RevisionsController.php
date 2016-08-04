<?php

namespace Flashtag\Api\Http\Controllers\V1;

use Flashtag\Api\Transformers\RevisionTransformer;
use Venturecraft\Revisionable\Revision;

class RevisionsController extends Controller
{
    /**
     * @var \Venturecraft\Revisionable\Revision
     */
    private $revision;

    /**
     * @param \Venturecraft\Revisionable\Revision $revision
     */
    public function __construct(Revision $revision)
    {
        $this->revision = $revision;
    }

    /**
     * Display the specified revision.
     *
     * @param int $id
     * @return \Dingo\Api\Http\Response
     */
    public function show($id)
    {
        $revision = $this->revision->findOrFail($id);

        return $this->response->item($revision, new RevisionTransformer());
    }
}
