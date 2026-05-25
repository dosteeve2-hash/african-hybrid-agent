import { NextRequest, NextResponse } from 'next/server';
import { VectorService } from '@/lib/db/vectors';
import { initializePool } from '@/lib/db/client';
import { buildTFIDFVector } from '@/lib/rag/embeddings';
import { loadCorpus } from '@/lib/rag/corpus';
import { getCachedSearchResults, cacheSearchResults, initializeRedis } from '@/lib/cache/redis';

export const runtime = 'nodejs';

/**
 * POST /api/search/vector - Vector similarity search
 * 
 * Request body:
 * {
 *   query: string,
 *   limit?: number (default: 10),
 *   minDistance?: number (default: 0.3),
 *   hybrid?: boolean (default: false - use vector only, true for hybrid)
 * }
 */
export async function POST(request: NextRequest) {
  await initializePool();
  await initializeRedis();

  try {
    const { query: queryText, limit = 10, minDistance = 0.3, hybrid = false } = await request.json();

    if (!queryText || typeof queryText !== 'string') {
      return NextResponse.json({ error: 'Query text required' }, { status: 400 });
    }

    // Check cache
    const cacheKey = `search:${Buffer.from(`${queryText}:${limit}:${minDistance}:${hybrid}`).toString('base64')}`;
    const cachedResult = await getCachedSearchResults(cacheKey);
    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        fromCache: true,
      });
    }

    // Load corpus for building query vector
    const corpus = await loadCorpus();
    if (corpus.length === 0) {
      return NextResponse.json(
        { error: 'Corpus not available for embedding generation' },
        { status: 503 }
      );
    }

    // Build query embedding using TF-IDF
    const queryVector = buildTFIDFVector(queryText, corpus.map((c) => c.text));

    // Perform search
    const results = hybrid
      ? await VectorService.hybridSearch(queryVector.normalizedVector, queryText, limit)
      : await VectorService.searchSimilar(queryVector.normalizedVector, limit, minDistance);

    const response = {
      query: queryText,
      resultCount: results.length,
      results,
      mode: hybrid ? 'hybrid' : 'vector-only',
      timestamp: new Date().toISOString(),
    };

    // Cache for 1 hour
    await cacheSearchResults(cacheKey, response, 3600);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Vector search error:', error);
    return NextResponse.json(
      {
        error: 'Vector search failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/search/vector/stats - Get vector embedding statistics
 */
export async function GET() {
  await initializePool();

  try {
    const stats = await VectorService.getStatistics();

    return NextResponse.json({
      embeddings: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
