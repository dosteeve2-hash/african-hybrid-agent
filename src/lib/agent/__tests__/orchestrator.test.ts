import { describe, it, expect, beforeAll } from '@jest/globals';
import { runAgentTurn } from '@/lib/agent/orchestrator';
import type { ChatMessage } from '@/lib/types/chat';

describe('Agent Orchestrator', () => {
  describe('runAgentTurn', () => {
    it('should process chat messages', async () => {
      const messages: ChatMessage[] = [
        {
          role: 'user',
          content: 'Parlez-moi de l\'agriculture agroécologique en Afrique',
        },
      ];

      const response = await runAgentTurn({ messages, mode: 'general' });

      expect(response).toBeDefined();
      expect(response).toHaveProperty('reply');
      expect(response).toHaveProperty('citations');
      expect(typeof response.reply).toBe('string');
      expect(response.reply.length).toBeGreaterThan(0);
    });

    it('should retrieve relevant chunks', async () => {
      const messages: ChatMessage[] = [
        {
          role: 'user',
          content: 'Quelles sont les techniques zaï et demi-lune?',
        },
      ];

      const response = await runAgentTurn({
        messages,
        mode: 'general',
        options: { searchMode: 'semantic' },
      });

      expect(response.citations).toBeDefined();
      expect(Array.isArray(response.citations)).toBe(true);
    });

    it('should include citations from sources', async () => {
      const messages: ChatMessage[] = [
        {
          role: 'user',
          content: 'Agriculture zaï productivité',
        },
      ];

      const response = await runAgentTurn({
        messages,
        mode: 'research',
        options: { maxCitations: 3 },
      });

      expect(response.citations).toBeDefined();
    });

    it('should handle research mode vs general mode', async () => {
      const messages: ChatMessage[] = [
        {
          role: 'user',
          content: 'Emploi jeunesse Africa',
        },
      ];

      const researchResponse = await runAgentTurn({
        messages,
        mode: 'research',
      });

      const generalResponse = await runAgentTurn({
        messages,
        mode: 'general',
      });

      expect(researchResponse.reply).toBeDefined();
      expect(generalResponse.reply).toBeDefined();
      // Research mode may include more citations/details
      expect(researchResponse.citations?.length).toBeGreaterThanOrEqual(
        generalResponse.citations?.length || 0
      );
    });

    it('should support geographic boost', async () => {
      const messages: ChatMessage[] = [
        {
          role: 'user',
          content: 'Initiatives locales Burkina',
        },
      ];

      const response = await runAgentTurn({
        messages,
        mode: 'general',
        options: { boostRegion: 'BF' },
      });

      expect(response).toBeDefined();
      expect(response.response.length).toBeGreaterThan(0);
    });

    it('should handle conversation history', async () => {
      const messages: ChatMessage[] = [
        {
          role: 'user',
          content: 'Parlez de l\'agriculture',
        },
        {
          role: 'assistant',
          content: 'L\'agriculture africaine...',
        },
        {
          role: 'user',
          content: 'Plus de détails sur les techniques modernes',
        },
      ];

      const response = await runAgentTurn({
        messages,
        mode: 'general',
      });

      expect(response).toBeDefined();
      expect(response.reply.length).toBeGreaterThan(0);
    });

    it('should perform well under different search modes', async () => {
      const messages: ChatMessage[] = [
        {
          role: 'user',
          content: 'Énergie renouvelable solutions',
        },
      ];

      const semanticResponse = await runAgentTurn({
        messages,
        mode: 'general',
        options: { searchMode: 'semantic' },
      });

      const fastResponse = await runAgentTurn({
        messages,
        mode: 'general',
        options: { searchMode: 'fast' },
      });

      expect(semanticResponse.reply).toBeDefined();
      expect(fastResponse.reply).toBeDefined();
    });

    it('should respect max citations limit', async () => {
      const messages: ChatMessage[] = [
        {
          role: 'user',
          content: 'Détails complets entrepreneuriat femmes',
        },
      ];

      const response = await runAgentTurn({
        messages,
        mode: 'research',
        options: { maxCitations: 2 },
      });

      const citationCount = response.citations?.length || 0;
      expect(citationCount).toBeLessThanOrEqual(2);
    });
  });

  describe('Error handling', () => {
    it('should handle empty messages gracefully', async () => {
      const messages: ChatMessage[] = [];

      const response = await runAgentTurn({
        messages,
        mode: 'general',
      });

      expect(response).toBeDefined();
    });

    it('should handle malformed input', async () => {
      const messages: ChatMessage[] = [
        {
          role: 'user' as const,
          content: '',
        },
      ];

      const response = await runAgentTurn({
        messages,
        mode: 'general',
      });

      expect(response).toBeDefined();
      expect(response.response).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('should respond within reasonable time', async () => {
      const messages: ChatMessage[] = [
        {
          role: 'user',
          content: 'Santé éducation Africa',
        },
      ];

      const start = Date.now();
      const response = await runAgentTurn(messages, {
        mode: 'general',
        searchMode: 'fast',
      });
      const duration = Date.now() - start;

      expect(response).toBeDefined();
      // Should complete within 5 seconds typically
      expect(duration).toBeLessThan(5000);
    });
  });
});
