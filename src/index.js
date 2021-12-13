import { Router } from 'tiny-request-router'

import { createResponse } from './response'
import { getCacheKey } from './get-cache-key'
import { forwardToNotion } from './notion-client'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
}

const router = new Router()

router.options('*', () => new Response(null, { headers: corsHeaders }))

router.get('/v1/dev', async () => {
  return createResponse({
    foo: 'bar',
  })
})

router.post(
  '/v1/databases/:databaseId/query',
  async ({ body, params, notionToken, searchParams }) => {
    const { databaseId } = params
    try {
      const result = await forwardToNotion({
        resource: `v1/databases/${databaseId}/query`,
        body,
        method: 'POST',
        notionToken,
        searchParams,
      })
      return createResponse(result)
    } catch (error) {
      return createResponse(error, {}, error.status || 500)
    }
  },
)

router.get(
  '/v1/blocks/:blockId/children',
  async ({ params, searchParams, notionToken }) => {
    const { blockId } = params

    try {
      const result = await forwardToNotion({
        resource: `v1/blocks/${blockId}/children`,
        notionToken,
        searchParams,
      })
      return createResponse(result)
    } catch (error) {
      return createResponse(error, {}, error.status || 500)
    }
  },
)

router.get('*', async () =>
  createResponse(
    {
      error: `Route not found!`,
      // routes: ['/v1/page/:pageId', '/v1/table/:pageId', '/v1/user/:pageId'],
    },
    {},
    404,
  ),
)

const cache = caches.default

const handleRequest = async fetchEvent => {
  const request = fetchEvent.request
  const reqBody = await readRequestBody(request)
  const { pathname, searchParams } = new URL(request.url)
  const notionToken =
    (request.headers.get('Authorization') || '').split('Bearer ')[1] ||
    undefined

  const workerAuth = request.headers.get('X-Worker-Auth')
  if (!workerAuth || workerAuth !== WORKER_API_KEY) {
    return new Response('Unauthorized', { status: 401 })
  }

  const match = router.match(request.method, pathname)

  if (!match) {
    return new Response('Endpoint not found.', { status: 404 })
  }

  const cacheKey = getCacheKey(request)
  let response

  if (cacheKey) {
    try {
      response = await cache.match(cacheKey)
    } catch (err) {}
  }

  const getResponseAndPersist = async () => {
    const res = await match.handler({
      request,
      searchParams,
      params: match.params,
      notionToken,
      body: reqBody,
      path: pathname,
    })

    if (cacheKey) {
      await cache.put(cacheKey, res.clone())
    }

    return res
  }

  if (response) {
    fetchEvent.waitUntil(getResponseAndPersist())
    return response
  }

  return getResponseAndPersist()
}

async function readRequestBody(request) {
  const { headers } = request
  const contentType = headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    return await request.json()
  } else if (contentType.includes('application/text')) {
    return request.text()
  } else if (contentType.includes('text/html')) {
    return request.text()
  } else if (contentType.includes('form')) {
    const formData = await request.formData()
    const body = {}
    for (const entry of formData.entries()) {
      body[entry[0]] = entry[1]
    }
    return body
  } else {
    // Image, file, etc.
    return null
  }
}

self.addEventListener('fetch', async event => {
  const fetchEvent = event
  fetchEvent.respondWith(handleRequest(fetchEvent))
})
