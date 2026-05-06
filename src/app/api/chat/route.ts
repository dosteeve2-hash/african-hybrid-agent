import { NextResponse } from "next/server";

import { runAgentTurn } from "@/lib/agent/orchestrator";
import type { ChatMessage, ChatMode } from "@/lib/types/chat";

function isChatMessage(x: unknown): x is ChatMessage {
  if (!x || typeof x !== "object") return false;
  const m = x as ChatMessage;
  return (
    (m.role === "user" || m.role === "assistant" || m.role === "system") &&
    typeof m.content === "string"
  );
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    messages?: unknown[];
    mode?: ChatMode;
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

  const mode: ChatMode =
    body.mode === "research" ? "research" : "general";

  try {
    const result = await runAgentTurn({ messages, mode });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      {
        error: e instanceof Error ? e.message : "Erreur serveur",
      },
      { status: 500 },
    );
  }
}
