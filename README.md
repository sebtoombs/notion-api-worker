# Notion API Worker

Notion API Worker is a Cloudflare worker to wrap & cache the _public_ Notion API.

It's inspired by [Splitbee's notion-api-worker](https://github.com/splitbee/notion-api-worker), but uses the public, documented Notion API instead.

## What?

This project is essentially just a serverless wrapper around the public Notion API. It simply proxies requests to the Notion API and inserts a layer of edge caching.

In the future, I might add "convenience" routes that don't exist in the Notion API, e.g. to combine common chained/waterfalled requests into one.

## Why?

The Notion API is pretty darn slow. If you're trying to use Notion as a backend for your blog or website, making those requests can cost valuable time. By using a Cloudflare worker, we can cache those results at the edge for much faster future retrievals.

## Deploy

You can deploy this any way you might deploy a Cloudflare Worker.

The recommended approach is;

1. Clone the repo

   ```bash
   git clone https://github.com/sebtoombs/notion-api-worker
   ```

2. Install dependencies

   ```bash
   cd notion-api-worker && npm install
   ```

3. Add API key secret
   The worker uses an API key passed as an HTTP header (`X-Worker-Auth`) to authorize calls to the worker.

   You'll need to add this as an environment variable (secret) in Cloudflare. You can do this via the dashboard, or via wrangler with

   ```bash
   wrangler secret put WORKER_API_KEY
   ```

4. Deploy with `wrangler`
   (Follow steps to [login/configure wrangler on your machine first](https://developers.cloudflare.com/workers/cli-wrangler))
   ```bash
   wrangler publish
   ```

## Usage

Once you've deployed the worker to your `*.workers.dev` subdomain, or a custom domain, you can use it exactly like the Notion API.

e.g. Instead of;

```
https://api.notion.com/v1/databases/<databaseId>
```

Use

```
https://my-worker.my-subdomain.workers.dev/v1/databases/<databaseId>
```

Note: you don't need to pass the `Notion-Version` HTTP header, as this is currently hardcoded in the source.

### Authorization

There are two authto take to make calls to your worker.

1. `X-Worker-Auth`
   You must pass a header named `X-Worker-Auth` and specify the same value that you used for the secret environment variable `WORKER_API_KEY`

2. Notion Token
   Provide the Notion API token exactly as per the Notion documentation
   `Authorization: Bearer {notion_token}`
   This will be forwarded to the Notion API

## Development

If you want to develop this project "locally", you can do so using `wrangler`. Follow steps 1 & 2 above (under "Deploy") to install dependencies and configure wrangler, then

```bash
wrangler dev
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## Credits

Some parts of the source are borrowed from the [Splitbee notion-api-worker](https://github.com/splitbee/notion-api-worker), so many thanks to them for that great project.

## License

[MIT](https://choosealicense.com/licenses/mit/)
