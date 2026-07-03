const UPSTREAM_URL = "https://wspr.hb9vqq.ch/api/dx.json";
const ALLOWED_ORIGINS = new Set([
  "https://rfcorner.in",
  "https://www.rfcorner.in"
]);

function corsHeaders(origin) {
  const headers = {
    "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
    "Access-Control-Allow-Headers": "Accept",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}

function jsonResponse(body, status, origin, additionalHeaders) {
  return new Response(JSON.stringify(body), {
    status: status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      ...corsHeaders(origin),
      ...additionalHeaders
    }
  });
}

async function handleRequest(request) {
  const url = new URL(request.url);
  const origin = request.headers.get("Origin");

  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    return jsonResponse({ error: "Origin not allowed" }, 403, origin);
  }

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    return jsonResponse({ error: "Method not allowed" }, 405, origin, {
      "Allow": "GET, HEAD, OPTIONS"
    });
  }

  if (url.pathname !== "/" && url.pathname !== "/dx") {
    return jsonResponse({ error: "Not found" }, 404, origin);
  }

  let upstream;
  try {
    upstream = await fetch(UPSTREAM_URL, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "rfcorner.in HF propagation tool"
      },
      cf: {
        cacheEverything: true,
        cacheTtl: 60
      }
    });
  } catch (_error) {
    return jsonResponse({ error: "Propagation source is unavailable" }, 502, origin, {
      "Cache-Control": "no-store"
    });
  }

  if (!upstream.ok) {
    return jsonResponse({ error: "Propagation source returned an error" }, 502, origin, {
      "Cache-Control": "no-store"
    });
  }

  let data;
  try {
    data = await upstream.json();
  } catch (_error) {
    return jsonResponse({ error: "Propagation source returned invalid JSON" }, 502, origin, {
      "Cache-Control": "no-store"
    });
  }

  if (!data || typeof data !== "object" || !data.bands || !data.regions) {
    return jsonResponse({ error: "Propagation source returned incomplete data" }, 502, origin, {
      "Cache-Control": "no-store"
    });
  }

  if (request.method === "HEAD") {
    return new Response(null, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
        ...corsHeaders(origin)
      }
    });
  }

  return jsonResponse(data, 200, origin, {
    "Cache-Control": "public, max-age=60, stale-while-revalidate=300"
  });
}

export { ALLOWED_ORIGINS, UPSTREAM_URL, handleRequest };

export default {
  fetch: handleRequest
};
