const NOTION_API = 'https://api.notion.com'

export async function forwardToNotion({
  resource,
  body,
  method,
  searchParams = {},
  notionToken,
}) {
  const url = new URL(`${NOTION_API}/${resource}`)
  Object.keys(searchParams).forEach(key =>
    url.searchParams.append(key, searchParams[key]),
  )

  const res = await fetch(url.toString(), {
    method: method || 'GET',
    headers: {
      'Notion-Version': '2021-08-16',
      'content-type': 'application/json',
      ...(notionToken && { Authorization: `Bearer ${notionToken}` }),
    },
    ...(body && { body: JSON.stringify(body) }),
  })

  const resBody = await res.json()
  if (!res.ok) {
    throw resBody
  }

  /**
   * On Error;
   * res.ok = false
   * res.json() => {object: 'error', status: 400, code: 'invalid_request_url', message: 'Invalid request URL.'}
   */

  return resBody
}
