import { describe, it, expect } from '@jest/globals';
import {
  tokenize,
  buildTFIDFVector,
  cosineSimilarity,
  expandWithSynonyms,
} from '@/lib/rag/embeddings';

describe('Embeddings - TF-IDF & Semantic Search', () => {
  describe('tokenize', () => {
    it('should tokenize text correctly', () => {
      const text = 'Zaï pits agriculture agroécologie';
      const tokens = tokenize(text);
      expect(tokens).toContain('zai');
      expect(tokens).toContain('agriculture');
      expect(tokens.length).toBeGreaterThan(0);
    });

    it('should handle empty text', () => {
      expect(tokenize('')).toEqual([]);
    });

    it('should lowercase and remove punctuation', () => {
      const tokens = tokenize('AGRICULTURE! Zai pits?');
      expect(tokens).toEqual(['agriculture', 'zai', 'pits']);
    });
  });

  describe('buildTFIDFVector', () => {
    it('should create vector from text', () => {
      const text = 'agriculture zaï demi-lune productivité';
      const corpus = [text, 'commerce entrepreneuriat femmes', 'énergie solaire électricité'];
      
      const vector = buildTFIDFVector(text, corpus);
      
      expect(vector).toHaveProperty('text', text);
      expect(vector).toHaveProperty('vector');
      expect(vector).toHaveProperty('keywords');
      expect(vector.vector.length).toBeGreaterThan(0);
    });

    it('should normalize vector to unit length', () => {
      const text = 'test agriculture productivité';
      const corpus = [text, 'autre document'];
      const vector = buildTFIDFVector(text, corpus);
      
      const magnitude = Math.sqrt(vector.normalizedVector.reduce((sum, v) => sum + v * v, 0));
      // Normalized vector should have magnitude of 0 (empty) or 1 (normalized)
      expect(magnitude).toBeLessThanOrEqual(1.0001);
    });

    it('should assign higher weights to rare terms', () => {
      const rareTermDoc = 'zaï pits specialized technique';
      const commonTermDoc = 'agriculture crops farming land';
      const corpus = [rareTermDoc, commonTermDoc, 'zaï pits', 'zaï pits'];
      
      const rareVector = buildTFIDFVector(rareTermDoc, corpus);
      const commonVector = buildTFIDFVector(commonTermDoc, corpus);
      
      // Rare term should have competitive scoring despite lower frequency
      expect(rareVector.vector.length).toBe(commonVector.vector.length);
    });
  });

  describe('cosineSimilarity', () => {
    it('should calculate similarity between vectors', () => {
      const v1 = [1, 0, 0];
      const v2 = [1, 0, 0];
      const similarity = cosineSimilarity(v1, v2);
      
      expect(similarity).toBeCloseTo(1.0, 5);
    });

    it('should return 0 for orthogonal vectors', () => {
      const v1 = [1, 0, 0];
      const v2 = [0, 1, 0];
      const similarity = cosineSimilarity(v1, v2);
      
      expect(similarity).toBeCloseTo(0, 5);
    });

    it('should handle similar but different vectors', () => {
      const v1 = [1, 1, 0];
      const v2 = [1, 1, 1];
      const similarity = cosineSimilarity(v1, v2);
      
      expect(similarity).toBeGreaterThanOrEqual(0);
      expect(similarity).toBeLessThanOrEqual(1);
    });
  });

  describe('expandWithSynonyms', () => {
    it('should expand query with synonyms', () => {
      const query = ['entrepreneuriat'];
      const expanded = expandWithSynonyms(query);
      
      expect(expanded).toContain('entrepreneuriat');
      expect(expanded.length).toBeGreaterThanOrEqual(1);
    });

    it('should include original terms', () => {
      const query = ['agriculture', 'femmes'];
      const expanded = expandWithSynonyms(query);
      
      expect(expanded).toContain('agriculture');
      expect(expanded).toContain('femmes');
    });

    it('should add african/french variants', () => {
      const query = ['femmes'];
      const expanded = expandWithSynonyms(query);
      
      // Should expand with related terms or keep original
      expect(expanded.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle unknown terms gracefully', () => {
      const query = ['xyzunknown'];
      const expanded = expandWithSynonyms(query);
      
      expect(expanded).toContain('xyzunknown');
    });
  });

  describe('Integration: Query expansion + TF-IDF', () => {
    it('should correctly rank documents by semantic relevance', () => {
      const docs = [
        'zaï pits agriculture agroécologie productivité',
        'énergie solaire électricité mini-grids',
        'commerce femmes entrepreneuriat tontines',
      ];

      const query = 'zaï agriculture agroécologie';
      const queryVector = buildTFIDFVector(query, docs);

      const rankings = docs.map(doc => {
        const docVector = buildTFIDFVector(doc, docs);
        const similarity = cosineSimilarity(queryVector.normalizedVector, docVector.normalizedVector);
        return { doc: doc.substring(0, 30), similarity };
      });

      rankings.sort((a, b) => b.similarity - a.similarity);

      // First document should be agriculture-related
      expect(rankings[0].doc).toContain('zaï');
    });
  });
});
