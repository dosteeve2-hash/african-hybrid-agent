import fs from 'fs';
import path from 'path';
import { buildTFIDFVector, tokenize } from '../src/lib/rag/embeddings';

interface CorpusChunk {
  id: string;
  sourceFile: string;
  title: string;
  region: string;
  credibilityTier: string;
  content: string;
  chunkIndex: number;
  embedding: number[];
}

interface EmbeddingResult {
  totalFiles: number;
  totalChunks: number;
  totalEmbeddings: number;
  chunks: CorpusChunk[];
  generationTimeMs: number;
}

// Parse YAML frontmatter
function parseFrontmatter(content: string): { metadata: Record<string, string>; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    return { metadata: {}, body: content };
  }

  const metadata: Record<string, string> = {};
  const yamlContent = match[1];
  for (const line of yamlContent.split('\n')) {
    const [key, ...valueParts] = line.split(':');
    if (key) {
      metadata[key.trim()] = valueParts.join(':').trim();
    }
  }

  return { metadata, body: match[2] };
}

// Split content into chunks (by paragraph)
function chunkContent(content: string, minLength = 100): string[] {
  return content
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length >= minLength);
}

async function generateEmbeddings(): Promise<void> {
  console.log('🚀 Starting embeddings generation...\n');

  const startTime = Date.now();
  const corpusDir = path.join(process.cwd(), 'data', 'corpus');
  const files = fs.readdirSync(corpusDir).filter((f) => f.endsWith('.md'));

  console.log(`📁 Found ${files.length} corpus files\n`);

  const allChunks: CorpusChunk[] = [];
  const allTexts: string[] = [];

  // Phase 1: Load and chunk all documents
  console.log('📖 Phase 1: Loading and chunking documents...');
  for (const file of files) {
    const filePath = path.join(corpusDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const { metadata, body } = parseFrontmatter(content);

    const chunks = chunkContent(body);
    console.log(`  ✓ ${file}: ${chunks.length} chunks`);

    for (let i = 0; i < chunks.length; i++) {
      allTexts.push(chunks[i]);
      allChunks.push({
        id: `${file}-chunk-${i}`,
        sourceFile: file,
        title: metadata.title || file,
        region: metadata.region || 'UNKNOWN',
        credibilityTier: metadata.credibilityTier || 'low',
        content: chunks[i],
        chunkIndex: i,
        embedding: [], // Will be populated in phase 2
      });
    }
  }

  console.log(`\n✅ Total chunks loaded: ${allChunks.length}\n`);

  // Phase 2: Generate embeddings
  console.log('🧠 Phase 2: Generating TF-IDF embeddings...');
  for (let i = 0; i < allChunks.length; i++) {
    const chunk = allChunks[i];
    const textVector = buildTFIDFVector(chunk.content, allTexts);
    chunk.embedding = textVector.normalizedVector;

    if ((i + 1) % 50 === 0) {
      console.log(`  ✓ Generated ${i + 1}/${allChunks.length} embeddings`);
    }
  }

  const generationTimeMs = Date.now() - startTime;

  console.log(`\n✅ All embeddings generated in ${generationTimeMs}ms\n`);

  // Phase 3: Save results
  console.log('💾 Phase 3: Saving results...');
  const outputDir = path.join(process.cwd(), 'data', 'embeddings');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const result: EmbeddingResult = {
    totalFiles: files.length,
    totalChunks: allChunks.length,
    totalEmbeddings: allChunks.filter((c) => c.embedding.length > 0).length,
    chunks: allChunks,
    generationTimeMs,
  };

  const outputPath = path.join(outputDir, 'embeddings.json');
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
  console.log(`  ✓ Saved to ${outputPath}`);

  // Phase 4: Print summary
  console.log('\n📊 Summary:');
  console.log(`  Files processed: ${result.totalFiles}`);
  console.log(`  Total chunks: ${result.totalChunks}`);
  console.log(`  Embeddings generated: ${result.totalEmbeddings}`);
  console.log(`  Generation time: ${result.generationTimeMs}ms`);
  console.log(`  Avg time per embedding: ${(result.generationTimeMs / result.totalEmbeddings).toFixed(2)}ms`);

  // Print sample
  console.log('\n🎯 Sample embeddings:');
  for (let i = 0; i < Math.min(3, allChunks.length); i++) {
    const chunk = allChunks[i];
    console.log(`\n  Chunk ${i + 1}:`);
    console.log(`    File: ${chunk.sourceFile}`);
    console.log(`    Region: ${chunk.region}`);
    console.log(`    Content preview: ${chunk.content.substring(0, 80)}...`);
    console.log(`    Vector dimensions: ${chunk.embedding.length}`);
    console.log(`    Sample values: [${chunk.embedding.slice(0, 5).map((v) => v.toFixed(3)).join(', ')}, ...]`);
  }

  console.log('\n🎉 Embeddings generation complete!\n');
}

// Run
generateEmbeddings().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
