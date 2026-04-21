declare const process: {
  env: Record<string, string | undefined>;
};
declare const Buffer: {
  from(input: ArrayBuffer): Uint8Array;
};

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "content-length",
  "host",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

function getBackendOrigin(): string {
  const origin = process.env.BACKEND_ORIGIN?.trim();
  if (!origin) {
    throw new Error("BACKEND_ORIGIN is not configured");
  }
  return origin.replace(/\/+$/, "");
}

function buildTargetUrl(req: any): string {
  const host = req.headers["x-forwarded-host"] ?? req.headers.host ?? "localhost";
  const protocol = req.headers["x-forwarded-proto"] ?? "https";
  const incomingUrl = new URL(req.url ?? "/", `${protocol}://${host}`);
  const suffix = incomingUrl.pathname.replace(/^\/api\/?/, "");
  const target = new URL(`${getBackendOrigin()}/${suffix}`);
  target.search = incomingUrl.search;
  return target.toString();
}

function buildHeaders(req: any): Headers {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers ?? {})) {
    if (value == null) continue;
    if (HOP_BY_HOP_HEADERS.has(key.toLowerCase())) continue;

    if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(key, item);
      }
      continue;
    }

    headers.set(key, String(value));
  }
  return headers;
}

function buildRequestBody(req: any): BodyInit | undefined {
  if (req.method === "GET" || req.method === "HEAD") {
    return undefined;
  }

  if (req.body == null) {
    return undefined;
  }

  if (
    typeof req.body === "string" ||
    req.body instanceof Uint8Array ||
    req.body instanceof ArrayBuffer
  ) {
    return req.body;
  }

  return JSON.stringify(req.body);
}

export default async function handler(req: any, res: any) {
  try {
    const upstream = await fetch(buildTargetUrl(req), {
      method: req.method,
      headers: buildHeaders(req),
      body: buildRequestBody(req),
      redirect: "follow",
    });

    res.status(upstream.status);

    upstream.headers.forEach((value, key) => {
      if (HOP_BY_HOP_HEADERS.has(key.toLowerCase())) return;
      res.setHeader(key, value);
    });

    res.send(Buffer.from(await upstream.arrayBuffer()));
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Proxy request failed";
    res.status(503).json({ detail });
  }
}
