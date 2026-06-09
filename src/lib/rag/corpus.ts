import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

export type CorpusMeta = {
  title?: string;
  sourceType?: string;
  region?: string;
  regions?: string[];
  credibilityTier?: "official" | "high" | "medium" | "low";
  language?: string;
  tags?: string[];
  topics?: string[];
  organization?: string;
  publicationYear?: number;
  url?: string;
};

export type CorpusChunk = {
  id: string;
  sourceFile: string;
  chunkIndex: number;
  meta: CorpusMeta;
  text: string;
  charOffset: number;
};

// ── YAML frontmatter parser ───────────────────────────────────────────────────

function parseYAMLValue(raw: string): string | string[] | number {
  const v = raw.trim().replace(/^["']|["']$/g, "");
  // Array: [a, b, c] or comma list
  if (v.startsWith("[")) {
    return v
      .slice(1, -1)
      .split(",")
      .map((s) => s.trim().replace(/^["']|["']$/g, ""))
      .filter(Boolean);
  }
  const n = Number(v);
  if (!isNaN(n) && v !== "") return n;
  return v;
}

function splitFrontmatter(raw: string): { meta: CorpusMeta; body: string } {
  const trimmed = raw.trim();
  if (!trimmed.startsWith("---")) return { meta: {}, body: trimmed };

  const end = trimmed.indexOf("\n---", 3);
  if (end === -1) return { meta: {}, body: trimmed };

  const yamlBlock = trimmed.slice(3, end).trim();
  const body = trimmed.slice(end + 4).trim();
  const meta: CorpusMeta = {};

  for (const line of yamlBlock.split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const raw = line.slice(idx + 1);
    const value = parseYAMLValue(raw);

    switch (key) {
      case "title":        meta.title = String(value); break;
      case "sourceType":   meta.sourceType = String(value); break;
      case "region":       meta.region = String(value); break;
      case "regions":      meta.regions = Array.isArray(value) ? value.map(String) : [String(value)]; break;
      case "credibilityTier": {
        const v = String(value) as CorpusMeta["credibilityTier"];
        if (["official","high","medium","low"].includes(v as string)) meta.credibilityTier = v;
        break;
      }
      case "language":     meta.language = String(value); break;
      case "tags":         meta.tags = Array.isArray(value) ? value.map(String) : [String(value)]; break;
      case "topics":       meta.topics = Array.isArray(value) ? value.map(String) : [String(value)]; break;
      case "organization": meta.organization = String(value); break;
      case "publicationYear": meta.publicationYear = Number(value); break;
      case "url":          meta.url = String(value); break;
    }
  }

  // Unify regions
  if (!meta.regions && meta.region) {
    meta.regions = meta.region.includes(",")
      ? meta.region.split(",").map((s) => s.trim())
      : [meta.region];
  }

  return { meta, body };
}

// ── Sliding-window chunker ────────────────────────────────────────────────────
// Splits on section headers (##) first, then applies sliding window within large sections.

const CHUNK_TARGET = 700;    // target chars per chunk
const CHUNK_OVERLAP = 120;   // overlap between consecutive chunks

function chunkSection(text: string): Array<{ text: string; offset: number }> {
  if (text.length <= CHUNK_TARGET) return [{ text: text.trim(), offset: 0 }];

  const chunks: Array<{ text: string; offset: number }> = [];
  let pos = 0;
  while (pos < text.length) {
    const end = pos + CHUNK_TARGET;
    // Extend to next sentence boundary if close
    let boundary = end;
    if (boundary < text.length) {
      const nextDot = text.indexOf(".", boundary);
      const nextNl = text.indexOf("\n", boundary);
      const nearest = [nextDot, nextNl].filter((i) => i !== -1 && i < end + 200);
      if (nearest.length > 0) boundary = Math.min(...nearest) + 1;
    }
    const slice = text.slice(pos, Math.min(boundary, text.length)).trim();
    if (slice.length > 30) chunks.push({ text: slice, offset: pos });
    pos = boundary - CHUNK_OVERLAP;
    if (pos <= chunks[chunks.length - 1]?.offset) pos = boundary; // avoid infinite loop
  }
  return chunks;
}

function chunkBody(body: string): Array<{ text: string; charOffset: number }> {
  const out: Array<{ text: string; charOffset: number }> = [];
  // Split by markdown section headers
  const sections = body.split(/(?=^#{1,3} )/m);
  let globalOffset = 0;

  for (const section of sections) {
    const trimmed = section.trim();
    if (!trimmed) { globalOffset += section.length; continue; }

    const sub = chunkSection(trimmed);
    for (const { text, offset } of sub) {
      if (text.length > 20) {
        out.push({ text, charOffset: globalOffset + offset });
      }
    }
    globalOffset += section.length;
  }

  return out;
}

function slugify(name: string): string {
  return name.replace(/\.md$/i, "").replace(/\s+/g, "-").toLowerCase();
}

// ── Corpus loader with in-memory cache ───────────────────────────────────────

let cache: CorpusChunk[] | null = null;

export async function loadCorpus(): Promise<CorpusChunk[]> {
  if (cache) return cache;

  const dir = path.join(process.cwd(), "data", "corpus");
  let files: string[] = [];
  try {
    files = await readdir(dir);
  } catch {
    cache = [];
    return cache;
  }

  const chunks: CorpusChunk[] = [];

  for (const file of files.filter((f) => f.endsWith(".md")).sort()) {
    const full = path.join(dir, file);
    const raw = await readFile(full, "utf-8");
    const { meta, body } = splitFrontmatter(raw);
    const slug = slugify(file);
    const parts = chunkBody(body);

    parts.forEach(({ text, charOffset }, i) => {
      chunks.push({
        id: `${slug}-${i}`,
        sourceFile: file,
        chunkIndex: i,
        meta,
        text,
        charOffset,
      });
    });
  }

  cache = chunks;
  return cache;
}

export function clearCorpusCache(): void {
  cache = null;
}
