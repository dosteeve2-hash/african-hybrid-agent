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
};

export type ChatResponseBody = {
  reply: string;
  citations: Citation[];
  providerUsed: "openai-compatible" | "local-synthesis";
  mode: ChatMode;
  warnings: string[];
};
