import { NextRequest, NextResponse } from 'next/server';
import { getCacheStats, invalidateSearchCaches, clearCache } from '@/lib/cache/redis';

export const runtime = 'nodejs';

/**
 * GET /api/cache/stats - Get cache statistics
 */
export async function GET(request: NextRequest) {
  try {
    const stats = await getCacheStats();

    return NextResponse.json({
      cache: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cache stats error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch cache statistics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cache - Clear cache or specific cache type
 * 
 * Query params:
 * - type: 'all' (default), 'search', 'session'
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';

    let cleared = false;

    if (type === 'search') {
      await invalidateSearchCaches();
      cleared = true;
    } else if (type === 'all') {
      cleared = await clearCache();
    }

    return NextResponse.json({
      success: cleared,
      cleared: type,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cache clear error:', error);
    return NextResponse.json(
      {
        error: 'Failed to clear cache',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
