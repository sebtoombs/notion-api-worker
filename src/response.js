export const createResponse = (body, headers, statusCode) => {
  return new Response(JSON.stringify(body), {
    status: statusCode || 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Content-Type': 'application/json',
      ...headers,
    },
  })
}
