import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

export type CorpusMeta = {
  title?: string;
  sourceType?: string;
  region?: string;
  credibilityTier?: "official" | "high" | "medium" | "low";
};

export type CorpusChunk = {
  id: string;
  sourceFile: string;
  meta: CorpusMeta;
  text: string;
};

function slugify(name: string): string {
  return name.replace(/\.md$/i, "").replace(/\s+/g, "-").toLowerCase();
}

function splitFrontmatter(raw: string): { meta: CorpusMeta; body: string } {
  const trimmed = raw.trim();
  if (!trimmed.startsWith("---")) {
    return { meta: {}, body: trimmed };
  }
  const end = trimmed.indexOf("\n---", 3);
  if (end === -1) {
    return { meta: {}, body: trimmed };
  }
  const yamlBlock = trimmed.slice(3, end).trim();
  const body = trimmed.slice(end + 4).trim();
  const meta: CorpusMeta = {};
  for (const line of yamlBlock.split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    if (key === "title") meta.title = value;
    if (key === "sourceType") meta.sourceType = value;
    if (key === "region") meta.region = value;
    if (key === "credibilityTier") {
      const v = value as CorpusMeta["credibilityTier"];
      if (v === "official" || v === "high" || v === "medium" || v === "low") {
        meta.credibilityTier = v;
      }
    }
  }
  return { meta, body };
}

function chunkText(body: string, maxLen = 900): string[] {
  const paragraphs = body.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  const out: string[] = [];
  for (const p of paragraphs) {
    if (p.length <= maxLen) {
      out.push(p);
      continue;
    }
    for (let i = 0; i < p.length; i += maxLen) {
      out.push(p.slice(i, i + maxLen));
    }
  }
  return out;
}

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
  for (const file of files.filter((f) => f.endsWith(".md"))) {
    const full = path.join(dir, file);
    const raw = await readFile(full, "utf-8");
    const { meta, body } = splitFrontmatter(raw);
    const slug = slugify(file);
    const parts = chunkText(body);
    parts.forEach((text, i) => {
      chunks.push({
        id: `${slug}-${i}`,
        sourceFile: file,
        meta,
        text,
      });
    });
  }
  cache = chunks;
  return cache;
}

export function clearCorpusCache(): void {
  cache = null;
}
