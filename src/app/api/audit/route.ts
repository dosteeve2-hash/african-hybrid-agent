import { NextResponse } from "next/server";
import { auditLogger } from "@/lib/governance/audit";

/**
 * GET /api/audit
 * Récupère les logs d'audit (limité à développement)
 * 
 * Query params:
 * - component: filtrer par composant (retrieval, agent, evidence)
 * - level: filtrer par niveau (info, warning, error)
 * - lastN: récupérer les N derniers logs (default 50)
 */
export async function GET(request: Request) {
  // Sécurité: Audit logs en dev/test seulement
  if (process.env.NODE_ENV === "production") {
    // En production, retourner vide ou 403
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const url = new URL(request.url);
  const component = url.searchParams.get("component") ?? undefined;
  const level = (url.searchParams.get("level") as any) ?? undefined;
  const lastN = parseInt(url.searchParams.get("lastN") ?? "50", 10);

  const logs = auditLogger.getLogs({
    component: component || undefined,
    level,
    lastN,
  });

  return NextResponse.json({
    totalLogs: logs.length,
    logs,
  });
}
