import { NextResponse } from "next/server";

import { buildEvidencePack } from "@/lib/agent/evidence-pack-builder";
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
 */
export async function POST(request: Request) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    query?: string;
    recommendationProfile?: RecommendationProfilePayload;
  };

  const query =
    typeof body.query === "string" && body.query.trim().length > 0
      ? body.query.trim()
      : body.recommendationProfile
        ? buildRetrievalQuery(body.recommendationProfile)
        : "";

  if (!query) {
    return NextResponse.json(
      { error: "Fournir query (string) ou recommendationProfile (objet)." },
      { status: 400 },
    );
  }

  try {
    const pack = await buildEvidencePack(query);
    return NextResponse.json(pack);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erreur evidence pack" },
      { status: 500 },
    );
  }
}
