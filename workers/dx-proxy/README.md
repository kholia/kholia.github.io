# HF propagation proxy

This Cloudflare Worker exposes HB9VQQ's propagation JSON to the browser at
`https://proxy.rfcorner.in/dx`. It accepts requests from `https://rfcorner.in` and
`https://www.rfcorner.in`, adds the required CORS response headers, and caches
successful responses for 60 seconds. It does not generate or persist snapshots.

## GitHub deployment

The Worker and its `proxy.rfcorner.in` custom domain are already provisioned.
To enable automatic deployments from this repository:

1. Create a Cloudflare API token with **Workers Scripts: Edit** permission.
2. Add these GitHub Actions repository secrets:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
3. Add the repository variable `CLOUDFLARE_WORKER_ENABLED` with value `true`.
4. Run the **Deploy HF propagation proxy** workflow once.

Subsequent changes below `workers/dx-proxy/` deploy automatically when the
enable variable remains set. Without that variable, push and manual workflow
runs are both skipped. The Hugo site endpoint is configured by
`params.dxApiURL` in `hugo.yaml`.

For local Worker development, run this directory with a current Wrangler:

```console
npx wrangler dev
```

For a local Hugo preview, the configured production endpoint works as-is:

```console
hugo serve
```
