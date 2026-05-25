import { query, PoolClient, transaction } from './client';
import { buildTFIDFVector } from '@/lib/rag/embeddings';

/**
 * PgVector embeddings service
 * Stores and retrieves vector embeddings from PostgreSQL using pgvector extension
 */

export interface VectorEmbedding {
  id: string;
  chunk_id: string;
  embedding: number[];
  model: string;
  created_at?: Date;
}

export class VectorService {
  /**
   * Initialize pgvector extension (call once on startup)
   */
  static async initializeExtension(): Promise<void> {
    try {
      await query('CREATE EXTENSION IF NOT EXISTS vector');
      console.log('✓ pgvector extension initialized');
    } catch (error) {
      console.warn('⚠️  pgvector extension not available:', error instanceof Error ? error.message : 'unknown error');
    }
  }

  /**
   * Create vector embeddings table
   */
  static async createEmbeddingTable(): Promise<void> {
    await query(`
      CREATE TABLE IF NOT EXISTS chunk_embeddings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        chunk_id UUID NOT NULL REFERENCES corpus_chunks(id) ON DELETE CASCADE,
        embedding vector(1000) NOT NULL,
        model VARCHAR(50) DEFAULT 'tfidf-l2-normalized',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(chunk_id, model)
      );
      
      CREATE INDEX IF NOT EXISTS idx_chunk_embeddings_chunk_id 
        ON chunk_embeddings(chunk_id);
      CREATE INDEX IF NOT EXISTS idx_chunk_embeddings_model 
        ON chunk_embeddings(model);
    `);
    console.log('✓ Embeddings table created');
  }

  /**
   * Store chunk embedding
   */
  static async storeEmbedding(chunkId: string, vector: number[], model = 'tfidf-l2-normalized'): Promise<string> {
    // Ensure vector doesn't exceed pgvector limits (typically up to 1000 dimensions for memory)
    const truncatedVector = vector.slice(0, 1000);

    const result = await query(
      `INSERT INTO chunk_embeddings (chunk_id, embedding, model) 
       VALUES ($1, $2::vector, $3)
       ON CONFLICT (chunk_id, model) DO UPDATE SET embedding = $2::vector
       RETURNING id`,
      [chunkId, `[${truncatedVector.join(',')}]`, model]
    );
    return result.rows[0].id;
  }

  /**
   * Batch store embeddings
   */
  static async storeEmbeddingsBatch(embeddings: Array<{ chunkId: string; vector: number[] }>): Promise<number> {
    return transaction(async (client: PoolClient) => {
      let inserted = 0;
      for (const { chunkId, vector } of embeddings) {
        const truncatedVector = vector.slice(0, 1000);
        await client.query(
          `INSERT INTO chunk_embeddings (chunk_id, embedding, model) 
           VALUES ($1, $2::vector, 'tfidf-l2-normalized')
           ON CONFLICT (chunk_id, model) DO UPDATE SET embedding = $2::vector`,
          [chunkId, `[${truncatedVector.join(',')}]`]
        );
        inserted++;
      }
      return inserted;
    });
  }

  /**
   * Vector similarity search (cosine distance)
   */
  static async searchSimilar(queryVector: number[], limit = 10, minDistance = 0.3): Promise<any[]> {
    const truncatedVector = queryVector.slice(0, 1000);

    const result = await query(
      `SELECT 
         ce.id, 
         ce.chunk_id,
         cc.text,
         cc.keywords,
         cs.title,
         cs.source_type,
         cs.credibility_tier,
         1 - (ce.embedding <=> $1::vector) as similarity_score
       FROM chunk_embeddings ce
       JOIN corpus_chunks cc ON ce.chunk_id = cc.id
       JOIN corpus_sources cs ON cc.source_id = cs.id
       WHERE cs.is_active = true
       AND (1 - (ce.embedding <=> $1::vector)) >= $2
       ORDER BY ce.embedding <=> $1::vector
       LIMIT $3`,
      [`[${truncatedVector.join(',')}]`, minDistance, limit]
    );

    return result.rows.map((row: any) => ({
      id: row.chunk_id,
      text: row.text,
      similarity: row.similarity_score,
      source: row.title,
      sourceType: row.source_type,
      credibilityTier: row.credibility_tier,
      keywords: row.keywords,
    }));
  }

  /**
   * Hybrid search: combine vector similarity + keyword matching
   */
  static async hybridSearch(
    queryVector: number[],
    queryText: string,
    limit = 10,
    vectorWeight = 0.6,
    textWeight = 0.4
  ): Promise<any[]> {
    const truncatedVector = queryVector.slice(0, 1000);

    const result = await query(
      `WITH vector_results AS (
        SELECT 
          ce.chunk_id,
          1 - (ce.embedding <=> $1::vector) as vector_sim,
          cc.text,
          cc.keywords,
          cs.title,
          cs.source_type,
          cs.credibility_tier
        FROM chunk_embeddings ce
        JOIN corpus_chunks cc ON ce.chunk_id = cc.id
        JOIN corpus_sources cs ON cc.source_id = cs.id
        WHERE cs.is_active = true
      ),
      text_results AS (
        SELECT 
          cc.id as chunk_id,
          ts_rank(to_tsvector('french', cc.text), plainto_tsquery('french', $2)) as text_rank,
          cc.text,
          cc.keywords,
          cs.title,
          cs.source_type,
          cs.credibility_tier
        FROM corpus_chunks cc
        JOIN corpus_sources cs ON cc.source_id = cs.id
        WHERE cs.is_active = true
        AND to_tsvector('french', cc.text) @@ plainto_tsquery('french', $2)
      )
      SELECT DISTINCT
        COALESCE(vr.chunk_id, tr.chunk_id) as chunk_id,
        COALESCE(vr.vector_sim, 0) as vector_sim,
        COALESCE(tr.text_rank, 0) as text_rank,
        COALESCE(vr.text, tr.text) as text,
        COALESCE(vr.keywords, tr.keywords) as keywords,
        COALESCE(vr.title, tr.title) as title,
        COALESCE(vr.source_type, tr.source_type) as source_type,
        COALESCE(vr.credibility_tier, tr.credibility_tier) as credibility_tier,
        ($3::float * COALESCE(vr.vector_sim, 0) + $4::float * COALESCE(tr.text_rank, 0)) as combined_score
      FROM vector_results vr
      FULL OUTER JOIN text_results tr ON vr.chunk_id = tr.chunk_id
      ORDER BY combined_score DESC
      LIMIT $5`,
      [`[${truncatedVector.join(',')}]`, queryText, vectorWeight, textWeight, limit]
    );

    return result.rows.map((row: any) => ({
      id: row.chunk_id,
      text: row.text,
      vectorSimilarity: row.vector_sim,
      textRelevance: row.text_rank,
      combinedScore: row.combined_score,
      source: row.title,
      sourceType: row.source_type,
      credibilityTier: row.credibility_tier,
      keywords: row.keywords,
    }));
  }

  /**
   * Get or create embedding for text
   */
  static async getOrCreateEmbedding(chunkId: string, text: string, corpus: string[]): Promise<VectorEmbedding | null> {
    // Check if embedding exists
    const existing = await query('SELECT * FROM chunk_embeddings WHERE chunk_id = $1', [chunkId]);
    if (existing.rows.length > 0) {
      return existing.rows[0];
    }

    // Generate new embedding
    const tfidfVector = buildTFIDFVector(text, corpus);
    await this.storeEmbedding(chunkId, tfidfVector.normalizedVector);

    return {
      id: '', // Will be assigned by DB
      chunk_id: chunkId,
      embedding: tfidfVector.normalizedVector,
      model: 'tfidf-l2-normalized',
    };
  }

  /**
   * Delete embeddings for a source
   */
  static async deleteSourceEmbeddings(sourceId: string): Promise<number> {
    const result = await query(
      `DELETE FROM chunk_embeddings 
       WHERE chunk_id IN (
         SELECT id FROM corpus_chunks WHERE source_id = $1
       )`,
      [sourceId]
    );
    return result.rowCount || 0;
  }

  /**
   * Get embedding statistics
   */
  static async getStatistics(): Promise<{
    total_embeddings: number;
    models: Record<string, number>;
    avg_dimension: number;
  }> {
    const result = await query(`
      SELECT 
        COUNT(*) as total,
        model,
        AVG(array_length(embedding::text::text[], ',')) as avg_dims
      FROM chunk_embeddings
      GROUP BY model
    `);

    const stats = {
      total_embeddings: 0,
      models: {} as Record<string, number>,
      avg_dimension: 0,
    };

    for (const row of result.rows) {
      stats.total_embeddings += row.total;
      stats.models[row.model] = row.total;
      if (row.avg_dims) stats.avg_dimension = Math.round(row.avg_dims);
    }

    return stats;
  }
}

export default VectorService;
