import { createServer } from "node:http";
import { URL } from "node:url";

const PORT = Number.parseInt(process.env.ENGINE_BRIDGE_PORT ?? "8788", 10);
const HOST = process.env.ENGINE_BRIDGE_HOST ?? "127.0.0.1";
const ALLOW_ORIGIN = process.env.ENGINE_BRIDGE_ALLOW_ORIGIN ?? "*";
const BRIDGE_TOKEN = process.env.ENGINE_BRIDGE_TOKEN ?? "";
const UNREAL_CONTROL_ENDPOINT =
  process.env.UNREAL_CONTROL_ENDPOINT ?? "http://127.0.0.1:5189/pajama/control";
const UNREAL_HEALTH_ENDPOINT =
  process.env.UNREAL_HEALTH_ENDPOINT ?? "http://127.0.0.1:5189/pajama/health";

function json(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Access-Control-Allow-Origin": ALLOW_ORIGIN,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Cache-Control": "no-store",
  });
  res.end(body);
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw.trim()) {
    return {};
  }
  return JSON.parse(raw);
}

function verifyToken(req) {
  if (!BRIDGE_TOKEN) {
    return true;
  }
  const header = req.headers.authorization ?? "";
  const expected = `Bearer ${BRIDGE_TOKEN}`;
  return header.trim() === expected;
}

async function proxyJson(url, method, payload, extraHeaders = {}) {
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...extraHeaders,
    },
    body: method === "POST" ? JSON.stringify(payload) : undefined,
  });

  const text = await response.text();
  let parsed;
  try {
    parsed = text ? JSON.parse(text) : {};
  } catch {
    parsed = { upstreamRaw: text };
  }

  return { ok: response.ok, status: response.status, body: parsed };
}

const server = createServer(async (req, res) => {
  const method = req.method ?? "GET";
  const parsed = new URL(req.url ?? "/", `http://${HOST}:${PORT}`);

  if (method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": ALLOW_ORIGIN,
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    });
    res.end();
    return;
  }

  if (parsed.pathname === "/health" && method === "GET") {
    try {
      const upstream = await proxyJson(UNREAL_HEALTH_ENDPOINT, "GET");
      json(res, 200, {
        ok: true,
        bridge: {
          host: HOST,
          port: PORT,
          unrealControlEndpoint: UNREAL_CONTROL_ENDPOINT,
          unrealHealthEndpoint: UNREAL_HEALTH_ENDPOINT,
          tokenRequired: Boolean(BRIDGE_TOKEN),
        },
        unreal: upstream.body,
      });
    } catch (error) {
      json(res, 200, {
        ok: true,
        bridge: {
          host: HOST,
          port: PORT,
          unrealControlEndpoint: UNREAL_CONTROL_ENDPOINT,
          unrealHealthEndpoint: UNREAL_HEALTH_ENDPOINT,
          tokenRequired: Boolean(BRIDGE_TOKEN),
        },
        unreal: {
          ok: false,
          error: error instanceof Error ? error.message : String(error),
        },
      });
    }
    return;
  }

  if (parsed.pathname === "/v1/command" && method === "POST") {
    if (!verifyToken(req)) {
      json(res, 401, { ok: false, error: "Unauthorized" });
      return;
    }

    try {
      const payload = await readJson(req);
      const upstream = await proxyJson(UNREAL_CONTROL_ENDPOINT, "POST", payload);
      json(res, upstream.status, {
        ok: upstream.ok,
        upstream: upstream.body,
      });
    } catch (error) {
      json(res, 500, {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
    return;
  }

  json(res, 404, {
    ok: false,
    error: "Not Found",
    path: parsed.pathname,
  });
});

server.listen(PORT, HOST, () => {
  console.log(
    `[engine-bridge] listening on http://${HOST}:${PORT} -> ${UNREAL_CONTROL_ENDPOINT}`
  );
});
