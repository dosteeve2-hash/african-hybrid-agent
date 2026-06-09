import { NextResponse } from "next/server";
import { runAgentTurn, streamAgentTurn, type AgentRunOptions } from "@/lib/agent/orchestrator";
import { AuditService, ChatService } from "@/lib/db/services";
import { initializePool } from "@/lib/db/client";
import { getCachedSessionData, cacheSessionData, initializeRedis } from "@/lib/cache/redis";
import type { ChatMessage, ChatMode, StreamChunk } from "@/lib/types/chat";

function isChatMessage(x: unknown): x is ChatMessage {
  if (!x || typeof x !== "object") return false;
  const m = x as ChatMessage;
  return ["user", "assistant", "system"].includes(m.role) && typeof m.content === "string";
}

function localSessionId(): string {
  return `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

async function withOptionalDb<T>(action: () => Promise<T>, fallback: T) {
  try {
    initializePool();
    return { value: await action(), available: true };
  } catch (error) {
    return { value: fallback, available: false, error: String(error) };
  }
}

async function logOptional(component: string, action: string, level: "info" | "error", data?: Record<string, unknown>) {
  try {
    initializePool();
    await AuditService.log(component, action, level, data);
  } catch { /* DB optional */ }
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    messages?: unknown[];
    mode?: ChatMode;
    searchMode?: "fast" | "semantic" | "hybrid";
    boostRegion?: string;
    maxCitations?: number;
    sessionId?: string;
    stream?: boolean;
  };

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json({ error: "messages[] requis (au moins un message)." }, { status: 400 });
  }

  const messages = body.messages.filter(isChatMessage) as ChatMessage[];
  if (messages.length === 0) {
    return NextResponse.json({ error: "Format de messages invalide." }, { status: 400 });
  }

  const mode: ChatMode = body.mode === "research" ? "research" : "general";
  const options: AgentRunOptions = {
    mode,
    searchMode: body.searchMode ?? "semantic",
    boostRegion: body.boostRegion,
    maxCitations: body.maxCitations ?? 6,
  };

  // ── Streaming path ──────────────────────────────────────────────────────────
  if (body.stream) {
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const send = (chunk: StreamChunk) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
        };

        try {
          for await (const chunk of streamAgentTurn({ messages, mode, options })) {
            send(chunk);
          }
        } catch (e) {
          send({
            type: "done",
            meta: {
              chunks: [],
              providerUsed: "local-synthesis",
              mode,
              warnings: [`Erreur: ${(e as Error).message}`],
              confidence: 0,
              agentSteps: [],
              perf: { totalMs: 0 },
            },
          });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  }

  // ── Non-streaming path ──────────────────────────────────────────────────────
  const session = await withOptionalDb(
    async () => body.sessionId ?? (await ChatService.createSession()),
    body.sessionId ?? localSessionId(),
  );
  const sessionId = session.value;

  // Cache check
  await initializeRedis();
  const cacheKey = `session:${sessionId}:${Buffer.from(JSON.stringify(messages)).toString("base64").slice(0, 32)}`;
  const cached = await getCachedSessionData(cacheKey);
  if (cached) {
    return NextResponse.json({ sessionId, dbAvailable: session.available, ...cached, fromCache: true });
  }

  if (session.available) {
    for (const msg of messages) {
      if (msg.role === "user") {
        await withOptionalDb(() => ChatService.addMessage(sessionId, "user", msg.content), "");
      }
    }
    await logOptional("orchestrator", "chat_request", "info", { sessionId, mode });
  }

  try {
    const result = await runAgentTurn({ messages, mode, options });

    if (!session.available && session.error) {
      result.warnings.push(`PostgreSQL indisponible: session non persistée.`);
    }

    if (session.available) {
      await withOptionalDb(
        () => ChatService.addMessage(sessionId, "assistant", result.reply, result.chunks),
        "",
      );
    }

    await cacheSessionData(cacheKey, result, 86400);

    return NextResponse.json({ sessionId, dbAvailable: session.available, ...result });
  } catch (e) {
    await logOptional("orchestrator", "chat_error", "error", { error: String(e) });
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
