import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { SourceSeedItem } from "@/lib/source-utils";

const AI_CACHE_DIR = path.join(process.cwd(), "data", "ai-cache");
const DEFAULT_TTL_MS = 1000 * 60 * 60 * 24 * 7;

export type AICacheValue = {
  absurdity_score: number;
  categories?: string[];
  dimensions?: Record<string, number>;
  comment?: string;
  reason?: string;
  cached_at: string;
};

function cacheKey(seed: SourceSeedItem) {
  const hash = createHash("sha1");
  hash.update(JSON.stringify({ title: seed.title, source: seed.source }));
  return hash.digest("hex");
}

function cachePath(seed: SourceSeedItem) {
  return path.join(AI_CACHE_DIR, `${cacheKey(seed)}.json`);
}

export async function loadAICache(seed: SourceSeedItem): Promise<AICacheValue | null> {
  try {
    const raw = await readFile(cachePath(seed), "utf8");
    const parsed = JSON.parse(raw) as AICacheValue;
    const ttl = Number(process.env.AI_SCORING_CACHE_TTL_MS || DEFAULT_TTL_MS);
    const age = Date.now() - new Date(parsed.cached_at).getTime();
    if (age > ttl) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function saveAICache(seed: SourceSeedItem, value: Omit<AICacheValue, "cached_at">) {
  await mkdir(AI_CACHE_DIR, { recursive: true });
  const payload: AICacheValue = {
    ...value,
    cached_at: new Date().toISOString(),
  };
  await writeFile(cachePath(seed), JSON.stringify(payload, null, 2), "utf8");
}
