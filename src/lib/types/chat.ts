export type ChatMode = "general" | "research";

export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type Citation = {
  id: string;
  sourceFile: string;
  excerpt: string;
  credibilityScore: number;
  sourceType: string;
  region?: string;
  title?: string;
};

export type LLMProvider = "claude" | "openai" | "openai-compatible" | "local-synthesis";

export type ChatResponseBody = {
  reply: string;
  response?: string;
  citations: Citation[];
  chunks?: string[];
  providerUsed: LLMProvider;
  model?: string;
  mode: ChatMode;
  warnings: string[];
  confidence: number;
  agentSteps: string[];
  perf?: {
    totalMs: number;
    retrievalMs?: number;
    generationMs?: number;
  };
};

export type StreamChunk =
  | { type: "text"; content: string }
  | { type: "citations"; citations: Citation[] }
  | { type: "done"; meta: Omit<ChatResponseBody, "reply" | "citations"> };
