import { NextRequest, NextResponse } from 'next/server';
import { CorpusService } from '@/lib/db/services';

// Admin auth middleware
function requireAdminAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('Authorization');
  const adminKey = process.env.ADMIN_API_KEY;

  if (!adminKey) {
    // If no admin key set, allow in development
    return process.env.NODE_ENV === 'development';
  }

  return authHeader === `Bearer ${adminKey}`;
}

/**
 * GET /api/admin/corpus - Get corpus sources and stats
 */
export async function GET(request: NextRequest) {
  if (!requireAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const sources = await CorpusService.getSources();
    const stats = await CorpusService.getStatistics();

    return NextResponse.json({
      sources,
      statistics: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching corpus:', error);
    return NextResponse.json(
      { error: 'Failed to fetch corpus' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/corpus - Add new source
 */
export async function POST(request: NextRequest) {
  if (!requireAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { source, chunks } = await request.json();

    if (!source || !chunks) {
      return NextResponse.json(
        { error: 'Missing source or chunks' },
        { status: 400 }
      );
    }

    // Insert source
    const sourceId = await CorpusService.insertSource(source);

    // Insert chunks
    const inserted = await CorpusService.insertChunks(sourceId, chunks);

    return NextResponse.json({
      success: true,
      sourceId,
      chunksInserted: inserted,
    });
  } catch (error) {
    console.error('Error adding corpus source:', error);
    return NextResponse.json(
      { error: 'Failed to add corpus source' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/corpus - Delete source
 */
export async function DELETE(request: NextRequest) {
  if (!requireAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const sourceId = searchParams.get('sourceId');

    if (!sourceId) {
      return NextResponse.json(
        { error: 'Missing sourceId' },
        { status: 400 }
      );
    }

    await CorpusService.deleteSource(sourceId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting source:', error);
    return NextResponse.json(
      { error: 'Failed to delete source' },
      { status: 500 }
    );
  }
}
