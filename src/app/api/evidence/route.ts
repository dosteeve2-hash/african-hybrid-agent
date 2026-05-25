import { NextResponse } from "next/server";

import { buildEvidencePack, type BuildEvidenceOptions } from "@/lib/agent/evidence-pack-builder";
import {
  buildRetrievalQuery,
  type RecommendationProfilePayload,
} from "@/lib/agent/query-from-profile";

function authorize(request: Request): boolean {
  const key = process.env.AGENT_API_KEY?.trim();
  if (!key) return true;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${key}`;
}

/**
 * POST body:
 * - { "query": "texte libre" }
 * ou
 * - { "recommendationProfile": RecommendationProfilePayload }
 * 
 * Options optionnelles:
 * - maxItems (default 10)
 * - minReliability (default 0)
 * - searchMode ("semantic" | "fast")
 * - boostRegion (code pays pour boost géographique)
 */
export async function POST(request: Request) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    query?: string;
    recommendationProfile?: RecommendationProfilePayload;
    maxItems?: number;
    minReliability?: number;
    searchMode?: "fast" | "semantic";
    boostRegion?: string;
  };

  let query = "";
  if (typeof body.query === "string" && body.query.trim().length > 0) {
    query = body.query.trim();
  } else if (body.recommendationProfile) {
    query = buildRetrievalQuery(body.recommendationProfile);
  }

  if (!query) {
    return NextResponse.json(
      {
        error:
          "Fournir 'query' (string) ou 'recommendationProfile' (objet). Voir README ou exemple.",
      },
      { status: 400 },
    );
  }

  const options: BuildEvidenceOptions = {
    maxItems: body.maxItems ?? 10,
    minReliability: body.minReliability ?? 0,
    searchMode: body.searchMode === "fast" ? "fast" : "semantic",
    boostRegion: body.boostRegion,
  };

  try {
    const pack = await buildEvidencePack(
      body.recommendationProfile ?? query,
      options,
    );
    return NextResponse.json(pack);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erreur evidence pack" },
      { status: 500 },
    );
  }
}
