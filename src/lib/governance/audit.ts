/**
 * Système d'audit et logging pour traçabilité des opérations
 * Enregistre les recherches, les réponses et les sources utilisées
 */

export type AuditLogLevel = "info" | "warning" | "error" | "trace";

export type AuditLogEntry = {
  timestamp: string;
  level: AuditLogLevel;
  component: string; // "retrieval", "rag", "agent", "evidence"
  action: string;
  data: Record<string, unknown>;
  userId?: string; // Optionnel pour API multiuser
};

export type RetrievalAudit = {
  queryText: string;
  queriedAt: string;
  mode: "fast" | "semantic";
  topK: number;
  minRelevanceScore?: number;
  boostRegion?: string;
  retrievedChunkIds: string[];
  totalChunksEvaluated: number;
  executionTimeMs: number;
};

export type ResponseAudit = {
  queryText: string;
  respondedAt: string;
  providerUsed: "openai-compatible" | "local-synthesis";
  confidence: number;
  citationCount: number;
  warningCount: number;
  executionTimeMs: number;
  model?: string;
};

class AuditLogger {
  private logs: AuditLogEntry[] = [];
  private maxLogs = 1000; // Garder en mémoire

  log(entry: AuditLogEntry): void {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Afficher en console en développement
    if (process.env.NODE_ENV === "development") {
      const prefix = `[${entry.component}:${entry.action}]`;
      if (entry.level === "error") {
        console.error(prefix, entry.data);
      } else if (entry.level === "warning") {
        console.warn(prefix, entry.data);
      } else if (entry.level === "trace") {
        console.debug(prefix, entry.data);
      } else {
        console.log(prefix, entry.data);
      }
    }
  }

  retrieval(audit: RetrievalAudit): void {
    this.log({
      timestamp: audit.queriedAt,
      level: "info",
      component: "retrieval",
      action: "search_executed",
      data: audit,
    });
  }

  response(audit: ResponseAudit): void {
    const level = audit.warningCount > 0 ? "warning" : "info";
    this.log({
      timestamp: audit.respondedAt,
      level,
      component: "agent",
      action: "response_generated",
      data: audit,
    });
  }

  warning(component: string, message: string, context?: Record<string, unknown>): void {
    this.log({
      timestamp: new Date().toISOString(),
      level: "warning",
      component,
      action: "warning",
      data: { message, ...context },
    });
  }

  error(component: string, message: string, error?: Error): void {
    this.log({
      timestamp: new Date().toISOString(),
      level: "error",
      component,
      action: "error",
      data: {
        message,
        errorMessage: error?.message,
        errorStack: error?.stack,
      },
    });
  }

  trace(component: string, action: string, data: Record<string, unknown>): void {
    this.log({
      timestamp: new Date().toISOString(),
      level: "trace",
      component,
      action,
      data,
    });
  }

  getLogs(filter?: { component?: string; level?: AuditLogLevel; lastN?: number }): AuditLogEntry[] {
    let result = [...this.logs];
    if (filter?.component) {
      result = result.filter((l) => l.component === filter.component);
    }
    if (filter?.level) {
      result = result.filter((l) => l.level === filter.level);
    }
    if (filter?.lastN) {
      result = result.slice(-filter.lastN);
    }
    return result;
  }

  clear(): void {
    this.logs = [];
  }
}

// Instance globale
export const auditLogger = new AuditLogger();
