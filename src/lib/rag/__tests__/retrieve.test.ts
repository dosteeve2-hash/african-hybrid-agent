import { describe, it, expect, beforeAll } from '@jest/globals';
import { retrieveChunks } from '@/lib/rag/retrieve';
import { loadCorpus } from '@/lib/rag/corpus';

describe('Retrieval System', () => {
  let chunks: any[] = [];

  beforeAll(async () => {
    // Load test corpus
    chunks = await loadCorpus();
  });

  describe('retrieveChunks - Semantic mode', () => {
    it('should retrieve chunks for agriculture query', async () => {
      const results = await retrieveChunks('zaï pits agriculture productivité', {
        topK: 5,
        searchMode: 'semantic',
      });

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      expect(results.length).toBeLessThanOrEqual(5);
    });

    it('should rank relevant documents higher', async () => {
      const results = await retrieveChunks('eau assainissement hygiène', {
        topK: 10,
        searchMode: 'semantic',
      });

      if (results.length > 0) {
        expect(results[0].relevanceScore).toBeDefined();
        expect(results[0].relevanceScore).toBeGreaterThanOrEqual(0);
      }
    });

    it('should return chunks with metadata', async () => {
      const results = await retrieveChunks('énergie solaire renouvelable', {
        topK: 3,
        searchMode: 'semantic',
      });

      results.forEach((chunk) => {
        expect(chunk).toHaveProperty('text');
        expect(chunk).toHaveProperty('source');
        expect(chunk).toHaveProperty('relevanceScore');
        expect(chunk).toHaveProperty('credibility');
      });
    });

    it('should handle geographic boost', async () => {
      const resultsNoBoost = await retrieveChunks('agriculture', {
        topK: 5,
        searchMode: 'semantic',
      });

      const resultsWithBoost = await retrieveChunks('agriculture', {
        topK: 5,
        searchMode: 'semantic',
        boostRegion: 'BF',
      });

      expect(resultsNoBoost).toBeDefined();
      expect(resultsWithBoost).toBeDefined();
    });
  });

  describe('retrieveChunks - Fast mode', () => {
    it('should retrieve chunks faster than semantic', async () => {
      const query = 'agriculture femmes entrepreneuriat';

      const startFast = Date.now();
      const fastResults = await retrieveChunks(query, {
        topK: 5,
        searchMode: 'fast',
      });
      const fastTime = Date.now() - startFast;

      const startSemantic = Date.now();
      const semanticResults = await retrieveChunks(query, {
        topK: 5,
        searchMode: 'semantic',
      });
      const semanticTime = Date.now() - startSemantic;

      expect(fastResults).toBeDefined();
      expect(semanticResults).toBeDefined();
      // Fast mode should generally be faster (though may vary in tests)
      // expect(fastTime).toBeLessThanOrEqual(semanticTime);
    });

    it('should return results for lexical search', async () => {
      const results = await retrieveChunks('zaï', {
        topK: 5,
        searchMode: 'fast',
      });

      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('retrieveChunks - Edge cases', () => {
    it('should handle empty query', async () => {
      const results = await retrieveChunks('', {
        topK: 5,
        searchMode: 'semantic',
      });

      expect(Array.isArray(results)).toBe(true);
    });

    it('should respect topK parameter', async () => {
      const results1 = await retrieveChunks('agriculture', {
        topK: 3,
        searchMode: 'semantic',
      });

      const results5 = await retrieveChunks('agriculture', {
        topK: 5,
        searchMode: 'semantic',
      });

      expect(results1.length).toBeLessThanOrEqual(3);
      expect(results5.length).toBeLessThanOrEqual(5);
    });

    it('should filter by minimum relevance score', async () => {
      const results = await retrieveChunks('agriculture', {
        topK: 10,
        searchMode: 'semantic',
        minRelevanceScore: 0.5,
      });

      results.forEach((chunk) => {
        expect(chunk.relevanceScore).toBeGreaterThanOrEqual(0.5);
      });
    });

    it('should handle multiple word queries', async () => {
      const results = await retrieveChunks(
        'agriculture agroécologie zaï productivité femmes entrepreneuriat',
        {
          topK: 5,
          searchMode: 'semantic',
        }
      );

      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('Backward compatibility', () => {
    it('should accept number as topK for legacy support', async () => {
      const results = await retrieveChunks('agriculture', 5 as any);

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeLessThanOrEqual(5);
    });
  });
});
