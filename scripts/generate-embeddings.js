#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Simple embeddings generation script
 * Generates TF-IDF-based embeddings for corpus documents
 */

function tokenize(text) {
  const stops = new Set([
    'le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'et', 'ou', 'à', 'au', 'aux',
    'pour', 'par', 'sur', 'dans', 'est', 'son', 'sa', 'ses', 'ce', 'cette', 'ces',
    'qui', 'que', 'dont', 'avec', 'sans', 'plus', 'moins', 'très', 'comme',
    'the', 'and', 'or', 'of', 'to', 'a', 'an', 'in', 'on', 'for', 'with', 'is',
  ]);

  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(/[^a-z0-9]+/i)
    .filter((w) => w.length >= 3 && !stops.has(w));
}

function buildFastEmbedding(text) {
  // Simple tokenization
  const tokens = tokenize(text);
  const vocab = Array.from(new Set(tokens)).sort();

  // Simple TF (no IDF cross-document calculation)
  const vector = vocab.map((term) => {
    return tokens.filter((t) => t === term).length;
  });

  // L2 normalization
  const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
  return magnitude > 0 ? vector.map((v) => v / magnitude) : vector;
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    return { metadata: {}, body: content };
  }

  const metadata = {};
  const yamlContent = match[1];
  for (const line of yamlContent.split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx !== -1) {
      const key = line.substring(0, colonIdx).trim();
      const value = line.substring(colonIdx + 1).trim();
      metadata[key] = value;
    }
  }

  return { metadata, body: match[2] };
}

function chunkContent(content, targetWords = 150) {
  const lines = content
    .split('\n')
    .filter((l) => l.trim().length > 0)
    .map((l) => l.trim());

  const chunks = [];
  let currentChunk = [];
  let wordCount = 0;

  for (const line of lines) {
    const words = line.split(/\s+/).length;
    currentChunk.push(line);
    wordCount += words;

    if (wordCount >= targetWords) {
      chunks.push(currentChunk.join('\n'));
      currentChunk = [];
      wordCount = 0;
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join('\n'));
  }

  return chunks.filter((c) => c.length >= 50);
}

async function main() {
  console.log('🚀 Starting embeddings generation...\n');

  const startTime = Date.now();
  const corpusDir = path.join(process.cwd(), 'data', 'corpus');
  const files = fs.readdirSync(corpusDir).filter((f) => f.endsWith('.md'));

  console.log(`📁 Found ${files.length} corpus files\n`);

  const allChunks = [];
  const allTexts = [];

  // Phase 1: Load and chunk
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
      });
    }
  }

  console.log(`\n✅ Total chunks loaded: ${allChunks.length}\n`);

  // Phase 2: Generate embeddings
  console.log('🧠 Phase 2: Generating embeddings...');
  for (let i = 0; i < allChunks.length; i++) {
    const chunk = allChunks[i];
    chunk.embedding = buildFastEmbedding(chunk.content);

    if ((i + 1) % 10 === 0 || i === allChunks.length - 1) {
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

  const result = {
    timestamp: new Date().toISOString(),
    totalFiles: files.length,
    totalChunks: allChunks.length,
    totalEmbeddings: allChunks.filter((c) => c.embedding && c.embedding.length > 0).length,
    generationTimeMs,
    chunks: allChunks.map((c) => ({
      id: c.id,
      sourceFile: c.sourceFile,
      title: c.title,
      region: c.region,
      credibilityTier: c.credibilityTier,
      content: c.content,
      chunkIndex: c.chunkIndex,
      embeddingDimensions: c.embedding ? c.embedding.length : 0,
    })),
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

  console.log('\n🎉 Embeddings generation complete!\n');
}

main().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
