import { describe, it, expect } from "@jest/globals";
import {
  tokenize,
  buildTFIDFVector,
  cosineSimilarity,
  expandWithSynonyms,
  buildBM25Index,
  bm25Score,
  credibilityBoost,
  geoBoost,
} from "@/lib/rag/embeddings";

describe("tokenize", () => {
  it("tokenizes text correctly", () => {
    const tokens = tokenize("Zaï pits agriculture agroécologie");
    expect(tokens).toContain("zai");
    expect(tokens).toContain("agriculture");
    expect(tokens.length).toBeGreaterThan(0);
  });

  it("handles empty text", () => {
    expect(tokenize("")).toEqual([]);
  });

  it("lowercases and removes punctuation", () => {
    const tokens = tokenize("AGRICULTURE! Zai pits?");
    expect(tokens).toContain("agriculture");
    expect(tokens).toContain("zai");
    expect(tokens).toContain("pits");
  });

  it("filters stop words", () => {
    const tokens = tokenize("le la les des agriculture");
    expect(tokens).not.toContain("le");
    expect(tokens).not.toContain("la");
    expect(tokens).toContain("agriculture");
  });
});

describe("buildTFIDFVector (legacy)", () => {
  it("creates vector from text", () => {
    const text = "agriculture zaï demi-lune productivité";
    const corpus = [text, "commerce entrepreneuriat femmes", "énergie solaire électricité"];
    const vector = buildTFIDFVector(text, corpus);
    expect(vector).toHaveProperty("text", text);
    expect(vector).toHaveProperty("vector");
    expect(vector).toHaveProperty("keywords");
    expect(vector.vector.length).toBeGreaterThan(0);
  });

  it("normalizes vector to unit length", () => {
    const text = "test agriculture productivité";
    const corpus = [text, "autre document"];
    const vector = buildTFIDFVector(text, corpus);
    const magnitude = Math.sqrt(vector.normalizedVector.reduce((s: number, v: number) => s + v * v, 0));
    expect(magnitude).toBeLessThanOrEqual(1.0001);
  });
});

describe("cosineSimilarity", () => {
  it("returns 1 for identical vectors", () => {
    expect(cosineSimilarity([1, 0, 0], [1, 0, 0])).toBeCloseTo(1.0, 5);
  });

  it("returns 0 for orthogonal vectors", () => {
    expect(cosineSimilarity([1, 0, 0], [0, 1, 0])).toBeCloseTo(0, 5);
  });

  it("handles similar vectors", () => {
    const sim = cosineSimilarity([1, 1, 0], [1, 1, 1]);
    expect(sim).toBeGreaterThanOrEqual(0);
    expect(sim).toBeLessThanOrEqual(1);
  });

  it("works with Map inputs", () => {
    const a = new Map([["x", 1], ["y", 0]]);
    const b = new Map([["x", 1], ["y", 0]]);
    expect(cosineSimilarity(a, b)).toBeCloseTo(1.0, 5);
  });
});

describe("expandWithSynonyms", () => {
  it("expands query with synonyms", () => {
    const expanded = expandWithSynonyms(["entrepreneuriat"]);
    expect(expanded).toContain("entrepreneuriat");
    expect(expanded.length).toBeGreaterThan(1);
  });

  it("includes original terms", () => {
    const expanded = expandWithSynonyms(["agriculture", "femmes"]);
    expect(expanded).toContain("agriculture");
    expect(expanded).toContain("femmes");
  });

  it("handles unknown terms gracefully", () => {
    const expanded = expandWithSynonyms(["xyzunknown"]);
    expect(expanded).toContain("xyzunknown");
  });
});

describe("BM25 index", () => {
  const docs = [
    { id: "doc1", text: "agriculture zaï demi-lune productivité sahel" },
    { id: "doc2", text: "énergie solaire électricité mini-grids panneaux" },
    { id: "doc3", text: "commerce femmes entrepreneuriat tontines financement" },
  ];

  it("builds index with correct document count", () => {
    const index = buildBM25Index(docs);
    expect(index.N).toBe(3);
    expect(index.documents.length).toBe(3);
  });

  it("computes positive BM25 scores for matching queries", () => {
    const index = buildBM25Index(docs);
    const queryTokens = tokenize("agriculture zaï");
    const score = bm25Score(queryTokens, index.documents[0], index);
    expect(score).toBeGreaterThan(0);
  });

  it("ranks agriculture doc highest for agriculture query", () => {
    const index = buildBM25Index(docs);
    const queryTokens = expandWithSynonyms(tokenize("agriculture zaï"));
    const scores = index.documents.map((doc) => ({
      id: doc.id,
      score: bm25Score(queryTokens, doc, index),
    }));
    scores.sort((a, b) => b.score - a.score);
    expect(scores[0].id).toBe("doc1");
  });
});

describe("credibilityBoost", () => {
  it("official has highest boost", () => {
    expect(credibilityBoost("official")).toBeGreaterThan(credibilityBoost("high"));
    expect(credibilityBoost("high")).toBeGreaterThan(credibilityBoost("medium"));
    expect(credibilityBoost("medium")).toBeGreaterThan(credibilityBoost("low"));
  });
});

describe("geoBoost", () => {
  it("exact region match gives highest boost", () => {
    expect(geoBoost(["BF"], "BF")).toBeGreaterThan(geoBoost(["ML"], "BF"));
  });

  it("sub-region gives intermediate boost", () => {
    const westBoost = geoBoost(["ML"], "BF"); // both West Africa
    const noBoost = geoBoost([], "BF");
    expect(westBoost).toBeGreaterThanOrEqual(noBoost);
  });
});
