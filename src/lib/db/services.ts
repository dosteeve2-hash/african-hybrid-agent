import { query, transaction, PoolClient } from './client';
import type { ChatMessage } from '@/lib/types/chat';

export interface CorpusSource {
  id: string;
  title: string;
  filename: string;
  source_type: string;
  regions: string;
  credibility_tier: string;
  description?: string;
  tags?: string;
  created_at?: Date;
  updated_at?: Date;
  is_active?: boolean;
}

export interface CorpusChunk {
  id: string;
  source_id: string;
  chunk_index: number;
  text: string;
  keywords?: string;
  created_at?: Date;
}

export class CorpusService {
  /**
   * Insert corpus source
   */
  static async insertSource(source: Omit<CorpusSource, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    const result = await query(
      `INSERT INTO corpus_sources (title, filename, source_type, regions, credibility_tier, description, tags, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true)
       RETURNING id`,
      [source.title, source.filename, source.source_type, source.regions, source.credibility_tier, source.description, source.tags]
    );
    return result.rows[0].id;
  }

  /**
   * Insert corpus chunks in batch
   */
  static async insertChunks(sourceId: string, chunks: Omit<CorpusChunk, 'id' | 'source_id' | 'created_at'>[]): Promise<number> {
    return transaction(async (client: PoolClient) => {
      let inserted = 0;
      for (const [index, chunk] of chunks.entries()) {
        await client.query(
          `INSERT INTO corpus_chunks (source_id, chunk_index, text, keywords)
           VALUES ($1, $2, $3, $4)`,
          [sourceId, index, chunk.text, chunk.keywords]
        );
        inserted++;
      }
      return inserted;
    });
  }

  /**
   * Get all active sources
   */
  static async getSources(): Promise<CorpusSource[]> {
    const result = await query('SELECT * FROM corpus_sources WHERE is_active = true ORDER BY created_at DESC');
    return result.rows;
  }

  /**
   * Get source by filename
   */
  static async getSourceByFilename(filename: string): Promise<CorpusSource | null> {
    const result = await query('SELECT * FROM corpus_sources WHERE filename = $1', [filename]);
    return result.rows[0] || null;
  }

  /**
   * Get chunks for source
   */
  static async getChunks(sourceId: string, limit = 100): Promise<CorpusChunk[]> {
    const result = await query(
      'SELECT * FROM corpus_chunks WHERE source_id = $1 ORDER BY chunk_index LIMIT $2',
      [sourceId, limit]
    );
    return result.rows;
  }

  /**
   * Search chunks
   */
  static async searchChunks(query_text: string, limit = 10): Promise<CorpusChunk[]> {
    const result = await query(
      `SELECT cc.* FROM corpus_chunks cc
       JOIN corpus_sources cs ON cc.source_id = cs.id
       WHERE to_tsvector('french', cc.text) @@ plainto_tsquery('french', $1)
       AND cs.is_active = true
       LIMIT $2`,
      [query_text, limit]
    );
    return result.rows;
  }

  /**
   * Delete source (soft delete)
   */
  static async deleteSource(sourceId: string): Promise<void> {
    await query('UPDATE corpus_sources SET is_active = false WHERE id = $1', [sourceId]);
  }

  /**
   * Get corpus statistics
   */
  static async getStatistics(): Promise<{
    total_sources: number;
    total_chunks: number;
    regions: string;
    credibility_distribution: Record<string, number>;
  }> {
    const sources = await query('SELECT COUNT(*) as count FROM corpus_sources WHERE is_active = true');
    const chunks = await query('SELECT COUNT(*) as count FROM corpus_chunks');
    const credibility = await query(
      `SELECT credibility_tier, COUNT(*) as count FROM corpus_sources WHERE is_active = true GROUP BY credibility_tier`
    );

    return {
      total_sources: sources.rows[0].count,
      total_chunks: chunks.rows[0].count,
      regions: 'Sub-Saharan Africa',
      credibility_distribution: credibility.rows.reduce((acc: any, row: any) => {
        acc[row.credibility_tier] = row.count;
        return acc;
      }, {}),
    };
  }
}

export class ChatService {
  /**
   * Create chat session
   */
  static async createSession(userId?: string): Promise<string> {
    const result = await query(
      'INSERT INTO chat_sessions (user_id) VALUES ($1) RETURNING id',
      [userId]
    );
    return result.rows[0].id;
  }

  /**
   * Add message to session
   */
  static async addMessage(
    sessionId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    retrievedChunks?: any
  ): Promise<string> {
    const result = await query(
      'INSERT INTO chat_messages (session_id, role, content, retrieved_chunks) VALUES ($1, $2, $3, $4) RETURNING id',
      [sessionId, role, content, retrievedChunks ? JSON.stringify(retrievedChunks) : null]
    );
    return result.rows[0].id;
  }

  /**
   * Get session history
   */
  static async getSessionHistory(sessionId: string): Promise<ChatMessage[]> {
    const result = await query(
      'SELECT role, content FROM chat_messages WHERE session_id = $1 ORDER BY created_at ASC',
      [sessionId]
    );
    return result.rows.map((row: any) => ({
      role: row.role as 'user' | 'assistant' | 'system',
      content: row.content,
    }));
  }
}

export class AuditService {
  /**
   * Log audit entry
   */
  static async log(
    component: string,
    action: string,
    level: 'info' | 'warning' | 'error' | 'trace',
    data?: any
  ): Promise<void> {
    await query(
      'INSERT INTO audit_logs (component, action, level, data) VALUES ($1, $2, $3, $4)',
      [component, action, level, data ? JSON.stringify(data) : null]
    );
  }

  /**
   * Get recent logs
   */
  static async getLogs(component?: string, level?: string, limit = 100): Promise<any[]> {
    let sql = 'SELECT * FROM audit_logs WHERE 1=1';
    const params: any[] = [];

    if (component) {
      sql += ' AND component = $' + (params.length + 1);
      params.push(component);
    }
    if (level) {
      sql += ' AND level = $' + (params.length + 1);
      params.push(level);
    }

    sql += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1);
    params.push(limit);

    const result = await query(sql, params);
    return result.rows;
  }
}

export default {
  CorpusService,
  ChatService,
  AuditService,
};
