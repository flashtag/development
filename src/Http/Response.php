<?php

namespace Scribbl\Api\Http;

use Illuminate\Contracts\Routing\ResponseFactory;
use Illuminate\Http\Request;
use Scribbl\Api\Transformers\TransformerManager;

class Response
{
    const CODE_WRONG_ARGS = 'GEN-INVALID-ARGS';
    const CODE_NOT_FOUND = 'GEN-NOTHING-HERE';
    const CODE_INTERNAL_ERROR = 'GEN-SERVER-ERROR';
    const CODE_UNAUTHORIZED = 'GEN-UNAUTHORIZED';
    const CODE_FORBIDDEN = 'GEN-FORBIDDEN';

    /**
     * @var int
     */
    protected $statusCode = 200;

    /**
     * @var string
     */
    protected $contentType;

    /**
     * @var array
     */
    protected $supportedTypes = [
        'JSON' => 'application/json',
        'YAML' => 'application/x-yaml',
    ];

    /**
     * @var \Illuminate\Contracts\Routing\ResponseFactory
     */
    private $response;

    /**
     * @var \Illuminate\Http\Request
     */
    private $request;

    /**
     * @param \Illuminate\Http\Request $request
     * @param \Illuminate\Contracts\Routing\ResponseFactory $response
     */
    public function __construct(Request $request, ResponseFactory $response)
    {
        $this->request = $request;
        $this->response = $response;
    }

    /**
     * @param  array $data
     * @return \Illuminate\Http\JsonResponse
     */
    public function collection($data)
    {
        return $this->response->json($data);
    }

    /**
     * @param  array $data
     * @return \Illuminate\Http\JsonResponse
     */
    public function item($data)
    {
        return $this->response->json($data);
    }
}
