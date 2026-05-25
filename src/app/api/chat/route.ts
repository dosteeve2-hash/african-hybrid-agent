import { NextResponse } from "next/server";

import { runAgentTurn, type AgentRunOptions } from "@/lib/agent/orchestrator";
import { AuditService, ChatService } from "@/lib/db/services";
import { initializePool } from "@/lib/db/client";
import { getCachedSessionData, cacheSessionData, initializeRedis } from "@/lib/cache/redis";
import type { ChatMessage, ChatMode } from "@/lib/types/chat";

function isChatMessage(x: unknown): x is ChatMessage {
  if (!x || typeof x !== "object") return false;
  const m = x as ChatMessage;
  return (
    (m.role === "user" || m.role === "assistant" || m.role === "system") &&
    typeof m.content === "string"
  );
}

function localSessionId(): string {
  return `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

async function withOptionalDb<T>(
  action: () => Promise<T>,
  fallback: T,
): Promise<{ value: T; available: boolean; error?: string }> {
  try {
    initializePool();
    return { value: await action(), available: true };
  } catch (error) {
    return {
      value: fallback,
      available: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function logOptional(
  component: string,
  action: string,
  level: "info" | "warning" | "error" | "trace",
  data?: Record<string, unknown>,
): Promise<void> {
  try {
    initializePool();
    await AuditService.log(component, action, level, data);
  } catch {
    // Database is optional for the local prototype.
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    messages?: unknown[];
    mode?: ChatMode;
    searchMode?: "fast" | "semantic";
    boostRegion?: string;
    maxCitations?: number;
    sessionId?: string;
  };

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json(
      { error: "messages[] requis (au moins un message)." },
      { status: 400 },
    );
  }

  const messages = body.messages.filter(isChatMessage) as ChatMessage[];
  if (messages.length === 0) {
    return NextResponse.json(
      { error: "Format de messages invalide." },
      { status: 400 },
    );
  }

  const mode: ChatMode = body.mode === "research" ? "research" : "general";

  const options: AgentRunOptions = {
    mode,
    searchMode: body.searchMode === "fast" ? "fast" : "semantic",
    boostRegion: body.boostRegion,
    maxCitations: body.maxCitations ?? 6,
  };

  let dbAvailable = true;

  const session = await withOptionalDb(
    async () => body.sessionId ?? (await ChatService.createSession()),
    body.sessionId ?? localSessionId(),
  );
  const sessionId = session.value;
  dbAvailable = session.available;
  const dbWarning = session.error;

  // Check cache for this session
  await initializeRedis();
  const cacheKey = `session:${sessionId}:${Buffer.from(JSON.stringify(messages)).toString("base64").slice(0, 32)}`;
  const cachedResult = await getCachedSessionData(cacheKey);
  if (cachedResult) {
    return NextResponse.json({
      sessionId,
      dbAvailable,
      ...cachedResult,
      fromCache: true,
    });
  }

  if (dbAvailable) {
    for (const msg of messages) {
      if (msg.role === "user") {
        await withOptionalDb(
          () => ChatService.addMessage(sessionId, "user", msg.content),
          "",
        );
      }
    }

    await logOptional("orchestrator", "chat_request", "info", {
      sessionId,
      messageCount: messages.length,
      mode,
      searchMode: options.searchMode,
    });
  }

  try {
    const result = await runAgentTurn({ messages, mode, options });

    if (!dbAvailable && dbWarning) {
      result.warnings.push(
        `Base PostgreSQL indisponible : session non persistee (${dbWarning}).`,
      );
    }

    if (dbAvailable) {
      await withOptionalDb(
        () =>
          ChatService.addMessage(
            sessionId,
            "assistant",
            result.response ?? result.reply,
            result.chunks,
          ),
        "",
      );

      await logOptional("orchestrator", "chat_complete", "info", {
        sessionId,
        responseTime: result.perf?.totalMs,
        citationCount: result.citations?.length || 0,
      });
    }

    // Cache the result for 24 hours
    await cacheSessionData(cacheKey, result, 86400);

    return NextResponse.json({
      sessionId,
      dbAvailable,
      ...result,
    });
  } catch (e) {
    await logOptional("orchestrator", "chat_error", "error", {
      error: e instanceof Error ? e.message : "Unknown error",
    });

    return NextResponse.json(
      {
        error: e instanceof Error ? e.message : "Erreur serveur",
      },
      { status: 500 },
    );
  }
}
