import type { H3Event } from "h3";
import { createEvent, createRouter, send, toNodeListener } from "h3";
import { createServer, type Server } from "node:http";
import type { EventHandler } from "h3";

let server: Server | null = null;
let baseUrl = "";

export async function startTestServer(
  routes: Record<string, EventHandler>,
): Promise<string> {
  if (server) {
    return baseUrl;
  }
  const router = createRouter();
  for (const [path, handler] of Object.entries(routes)) {
    router.use(path, handler);
  }
  router.use(
    "/**",
    defineEventHandler(() => send(createEvent({} as never), null)),
  );

  await new Promise<void>((resolve) => {
    server = createServer(toNodeListener(router));
    server.listen(0, "127.0.0.1", () => {
      const addr = server!.address();
      if (addr && typeof addr === "object") {
        baseUrl = `http://127.0.0.1:${addr.port}`;
      }
      resolve();
    });
  });
  return baseUrl;
}

export async function stopTestServer(): Promise<void> {
  if (server) {
    await new Promise<void>((resolve) => {
      server!.close(() => resolve());
    });
    server = null;
    baseUrl = "";
  }
}

export function mockEvent(
  method: string,
  path: string,
  body?: unknown,
): H3Event {
  return createEvent({
    method,
    url: path,
    headers: body ? { "content-type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  } as never);
}
