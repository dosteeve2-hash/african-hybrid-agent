import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * POST /api/admin/generate-embeddings
 * Generate embeddings for all corpus documents
 */

interface CorpusChunk {
  id: string;
  sourceFile: string;
  title: string;
  region: string;
  credibilityTier: string;
  content: string;
  chunkIndex: number;
}

// Simple TF-IDF based on buildTFIDFVector logic
function buildSimpleEmbedding(text: string, vocabulary: Set<string>): number[] {
  const tokens = text
    .toLowerCase()
    .split(/[^a-z0-9àâäéèêëïîôùûüœæ]+/i)
    .filter((w) => w.length >= 3);

  const vector: number[] = Array.from(vocabulary).map((term) => {
    return tokens.filter((t) => t === term).length;
  });

  // L2 normalization
  const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
  return magnitude > 0 ? vector.map((v) => v / magnitude) : vector;
}

export async function POST(request: NextRequest) {
  try {
    // Security check - dev only
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
    }

    const apiKey = request.headers.get('x-api-key');
    if (apiKey !== process.env.AGENT_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🚀 Starting embeddings generation...');

    const corpusDir = path.join(process.cwd(), 'data', 'corpus');
    if (!fs.existsSync(corpusDir)) {
      return NextResponse.json({ error: 'Corpus directory not found' }, { status: 404 });
    }

    const files = fs.readdirSync(corpusDir).filter((f) => f.endsWith('.md'));
    const chunks: CorpusChunk[] = [];
    const allTexts: string[] = [];

    // Phase 1: Load chunks
    for (const file of files) {
      const filePath = path.join(corpusDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');

      // Parse YAML frontmatter
      const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
      const metadata: Record<string, string> = {};
      let body = content;

      if (match) {
        const yamlContent = match[1];
        for (const line of yamlContent.split('\n')) {
          const [key, ...valueParts] = line.split(':');
          if (key) {
            metadata[key.trim()] = valueParts.join(':').trim();
          }
        }
        body = match[2];
      }

      // Split into chunks by paragraph
      const paragraphs = body
        .split(/\n\n+/)
        .map((p) => p.trim())
        .filter((p) => p.length >= 50);

      for (let i = 0; i < paragraphs.length; i++) {
        allTexts.push(paragraphs[i]);
        chunks.push({
          id: `${file}-chunk-${i}`,
          sourceFile: file,
          title: metadata.title || file,
          region: metadata.region || 'UNKNOWN',
          credibilityTier: metadata.credibilityTier || 'low',
          content: paragraphs[i],
          chunkIndex: i,
        });
      }
    }

    console.log(`📁 Loaded ${files.length} files, ${chunks.length} chunks`);

    // Phase 2: Build vocabulary
    const vocabulary = new Set<string>();
    for (const text of allTexts) {
      text
        .toLowerCase()
        .split(/[^a-z0-9àâäéèêëïîôùûüœæ]+/i)
        .filter((w) => w.length >= 3)
        .forEach((w) => vocabulary.add(w));
    }

    console.log(`🧠 Vocabulary size: ${vocabulary.size} terms`);

    // Phase 3: Generate embeddings and save
    const embeddings = chunks.map((chunk) => ({
      ...chunk,
      embedding: buildSimpleEmbedding(chunk.content, vocabulary),
    }));

    const outputDir = path.join(process.cwd(), 'data', 'embeddings');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const result = {
      timestamp: new Date().toISOString(),
      totalFiles: files.length,
      totalChunks: chunks.length,
      totalEmbeddings: embeddings.length,
      vocabularySize: vocabulary.size,
      embeddingDimensions: Array.from(vocabulary).length,
      chunks: embeddings,
    };

    const outputPath = path.join(outputDir, 'embeddings.json');
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));

    console.log(`✅ Generated ${embeddings.length} embeddings`);

    return NextResponse.json({
      success: true,
      message: 'Embeddings generated successfully',
      stats: {
        filesProcessed: files.length,
        chunksCreated: chunks.length,
        embeddingsGenerated: embeddings.length,
        vocabularySize: vocabulary.size,
        savedTo: outputPath,
      },
    });
  } catch (error) {
    console.error('❌ Error generating embeddings:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
