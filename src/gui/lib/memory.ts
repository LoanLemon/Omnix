export interface MemoryEntry {
  id: string;
  text: string;
  embedding: number[];
  timestamp: number;
  metadata?: any;
}

export class VectorStore {
  private dbName = "transformers-playground-memory";
  private storeName = "memories";
  private db: IDBDatabase | null = null;
  private isFallbackMode = false;
  private memoryCache: MemoryEntry[] = [];

  async init() {
    return new Promise<void>((resolve) => {
      try {
        if (typeof indexedDB === "undefined") {
          console.warn("IndexedDB is not available in this environment. Falling back to in-memory store.");
          this.isFallbackMode = true;
          resolve();
          return;
        }

        const request = indexedDB.open(this.dbName, 1);
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(this.storeName)) {
            db.createObjectStore(this.storeName, { keyPath: "id" });
          }
        };
        request.onsuccess = () => {
          this.db = request.result;
          resolve();
        };
        request.onerror = (e) => {
          console.warn("Failed to open IndexedDB. Falling back to in-memory store.", e);
          this.isFallbackMode = true;
          resolve();
        };
      } catch (err) {
        console.warn("IndexedDB initialization threw an exception. Falling back to in-memory store.", err);
        this.isFallbackMode = true;
        resolve();
      }
    });
  }

  async add(entry: MemoryEntry) {
    if (this.isFallbackMode) {
      this.memoryCache = this.memoryCache.filter(m => m.id !== entry.id);
      this.memoryCache.push(entry);
      return;
    }
    try {
      if (!this.db) await this.init();
      if (this.isFallbackMode) {
        this.memoryCache = this.memoryCache.filter(m => m.id !== entry.id);
        this.memoryCache.push(entry);
        return;
      }
      return new Promise<void>((resolve, reject) => {
        const transaction = this.db!.transaction(this.storeName, "readwrite");
        const store = transaction.objectStore(this.storeName);
        const request = store.put(entry);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.warn("Failed to add to IndexedDB, switching to in-memory fallback", e);
      this.isFallbackMode = true;
      this.memoryCache = this.memoryCache.filter(m => m.id !== entry.id);
      this.memoryCache.push(entry);
    }
  }

  async getAll(): Promise<MemoryEntry[]> {
    if (this.isFallbackMode) {
      return [...this.memoryCache];
    }
    try {
      if (!this.db) await this.init();
      if (this.isFallbackMode) return [...this.memoryCache];
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction(this.storeName, "readonly");
        const store = transaction.objectStore(this.storeName);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result as MemoryEntry[]);
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.warn("Failed to getAll from IndexedDB, switching to in-memory fallback", e);
      this.isFallbackMode = true;
      return [...this.memoryCache];
    }
  }

  async search(queryEmbedding: number[], topK = 3, threshold = 0.5): Promise<MemoryEntry[]> {
    if (this.isFallbackMode) {
      const scored = this.memoryCache.map(entry => ({
        entry,
        score: this.cosineSimilarity(queryEmbedding, entry.embedding)
      }));
      return scored
        .filter(s => s.score >= threshold)
        .sort((a, b) => b.score - a.score)
        .slice(0, topK)
        .map(s => s.entry);
    }
    try {
      if (!this.db) await this.init();
      if (this.isFallbackMode) {
        const scored = this.memoryCache.map(entry => ({
          entry,
          score: this.cosineSimilarity(queryEmbedding, entry.embedding)
        }));
        return scored
          .filter(s => s.score >= threshold)
          .sort((a, b) => b.score - a.score)
          .slice(0, topK)
          .map(s => s.entry);
      }
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction(this.storeName, "readonly");
        const store = transaction.objectStore(this.storeName);
        const request = store.getAll();

        request.onsuccess = () => {
          const all = request.result as MemoryEntry[];
          const scored = all.map(entry => ({
            entry,
            score: this.cosineSimilarity(queryEmbedding, entry.embedding)
          }));
          
          // Filter by confidence threshold and sort
          const results = scored
            .filter(s => s.score >= threshold)
            .sort((a, b) => b.score - a.score)
            .slice(0, topK)
            .map(s => s.entry);

          resolve(results);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.warn("Failed to search in IndexedDB, switching to in-memory fallback", e);
      this.isFallbackMode = true;
      const scored = this.memoryCache.map(entry => ({
        entry,
        score: this.cosineSimilarity(queryEmbedding, entry.embedding)
      }));
      return scored
        .filter(s => s.score >= threshold)
        .sort((a, b) => b.score - a.score)
        .slice(0, topK)
        .map(s => s.entry);
    }
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let mA = 0;
    let mB = 0;
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      mA += a[i] * a[i];
      mB += b[i] * b[i];
    }
    return dotProduct / (Math.sqrt(mA) * Math.sqrt(mB));
  }

  async clear() {
    if (this.isFallbackMode) {
      this.memoryCache = [];
      return;
    }
    try {
      if (!this.db) await this.init();
      if (this.isFallbackMode) {
        this.memoryCache = [];
        return;
      }
      const transaction = this.db!.transaction(this.storeName, "readwrite");
      transaction.objectStore(this.storeName).clear();
    } catch (e) {
      console.warn("Failed to clear IndexedDB, falling back to in-memory clear", e);
      this.isFallbackMode = true;
      this.memoryCache = [];
    }
  }

  async count(): Promise<number> {
    if (this.isFallbackMode) {
      return this.memoryCache.length;
    }
    try {
      if (!this.db) await this.init();
      if (this.isFallbackMode) return this.memoryCache.length;
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction(this.storeName, "readonly");
        const store = transaction.objectStore(this.storeName);
        const request = store.count();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.warn("Failed to count IndexedDB entries, falling back to in-memory count", e);
      this.isFallbackMode = true;
      return this.memoryCache.length;
    }
  }
}

export const memoryStore = new VectorStore();

export type MemoryClassification = "@rules" | "@knowledge" | "@instructions" | "@general";

export function classifyChunk(text: string): MemoryClassification {
  const lower = text.toLowerCase().trim();

  // 1. Rules: "Do NOT [action]", "Never ", "Always " and "Sometimes "
  if (
    lower.includes("do not") ||
    /\bnever\b/.test(lower) ||
    /\balways\b/.test(lower) ||
    /\bsometimes\b/.test(lower)
  ) {
    return "@rules";
  }

  // 2. Instructions: "you must ", "you need ", "want you to ", "do x", "please "
  if (
    lower.includes("you must") ||
    lower.includes("you need") ||
    lower.includes("want you to") ||
    lower.startsWith("do ") ||
    /\bdo\s+[a-z]+/.test(lower) ||
    /\bplease\b/.test(lower)
  ) {
    return "@instructions";
  }

  // 3. Knowledge: "x is y", "x are y" etc.
  if (
    /\b\w+\s+is\s+/.test(lower) ||
    /\b\w+\s+are\s+/.test(lower) ||
    /\b\w+\s+was\s+/.test(lower) ||
    /\b\w+\s+were\s+/.test(lower) ||
    lower.includes(" is ") ||
    lower.includes(" are ")
  ) {
    return "@knowledge";
  }

  return "@general";
}

export function chunkBySentences(text: string): string[] {
  if (!text) return [];
  const sentenceEndRegex = /[.!?\n]/;
  const chunks: string[] = [];
  let currentText = text;

  let match = currentText.match(sentenceEndRegex);
  while (match && match.index !== undefined) {
    const chunkEndIndex = match.index + 1;
    const chunk = currentText.slice(0, chunkEndIndex).trim();
    if (chunk && chunk.length >= 2) {
      chunks.push(chunk);
    }
    currentText = currentText.slice(chunkEndIndex);
    match = currentText.match(sentenceEndRegex);
  }
  const remaining = currentText.trim();
  if (remaining && remaining.length >= 2) {
    chunks.push(remaining);
  }
  return chunks;
}

export function extractSignificantKeywords(text: string): string[] {
  const words = text.split(/[^a-zA-Z0-9]+/).filter(Boolean);
  const stopWords = new Set([
    "my", "name", "is", "a", "the", "an", "in", "on", "at", "to", "for", "of", "and", "or", "but", 
    "you", "your", "he", "she", "they", "we", "i", "it", "this", "that", "these", "those", "am", "are", "was", "were", "been",
    "do", "not", "never", "always", "sometimes", "you", "must", "need", "want", "please", "rules", "knowledge", "instructions"
  ]);
  return words.filter(w => {
    const lower = w.toLowerCase();
    return w.length > 2 && !stopWords.has(lower);
  });
}

export function prioritizeAndClassifyMemories(
  matches: MemoryEntry[],
  allEntries: MemoryEntry[],
  limit: number = 5
): { prioritized: MemoryEntry[]; debugLogs: string[] } {
  const debugLogs: string[] = [];

  const classifiedMatches = matches.map(m => {
    const classification = m.metadata?.classification || classifyChunk(m.text);
    return { ...m, metadata: { ...m.metadata, classification } };
  });

  const rules = classifiedMatches.filter(m => m.metadata?.classification === "@rules");
  const knowledge = classifiedMatches.filter(m => m.metadata?.classification === "@knowledge");

  const selected: MemoryEntry[] = [];
  const selectedIds = new Set<string>();

  // 1. Prioritize at least 1 rule
  if (rules.length > 0) {
    const topRule = rules[0];
    selected.push(topRule);
    selectedIds.add(topRule.id);
    debugLogs.push(`Prioritized rule memory: "${topRule.text}"`);
  } else {
    debugLogs.push(`No matching rule memory found.`);
  }

  // 2. Prioritize at least 1 knowledge
  let topKnowledge: any = null;
  if (knowledge.length > 0) {
    topKnowledge = knowledge[0];
    selected.push(topKnowledge);
    selectedIds.add(topKnowledge.id);
    debugLogs.push(`Prioritized knowledge memory: "${topKnowledge.text}"`);
  } else {
    debugLogs.push(`No matching knowledge memory found.`);
  }

  // If we pulled a top knowledge, extract keywords and get an additional context result
  if (topKnowledge) {
    const keywords = extractSignificantKeywords(topKnowledge.text);
    if (keywords.length > 0) {
      debugLogs.push(`Extracted keywords from top knowledge: [${keywords.join(", ")}]`);

      let contextMatch: MemoryEntry | null = null;

      // Check among existing similarity matches first
      for (const m of classifiedMatches) {
        if (selectedIds.has(m.id)) continue;
        const textLower = m.text.toLowerCase();
        if (keywords.some(kw => textLower.includes(kw.toLowerCase()))) {
          contextMatch = m;
          break;
        }
      }

      // Check among all entries in the DB if not found in similarity matches
      if (!contextMatch && allEntries) {
        const matchingDbEntries: { entry: MemoryEntry; score: number }[] = [];
        allEntries.forEach(dbEntry => {
          if (selectedIds.has(dbEntry.id)) return;
          const textLower = dbEntry.text.toLowerCase();
          if (keywords.some(kw => textLower.includes(kw.toLowerCase()))) {
            matchingDbEntries.push({ entry: dbEntry, score: dbEntry.timestamp });
          }
        });

        if (matchingDbEntries.length > 0) {
          matchingDbEntries.sort((a, b) => b.score - a.score);
          contextMatch = matchingDbEntries[0].entry;
        }
      }

      if (contextMatch) {
        const cl = contextMatch.metadata?.classification || classifyChunk(contextMatch.text);
        const classifiedContextMatch = {
          ...contextMatch,
          metadata: { ...contextMatch.metadata, classification: cl }
        };
        selected.push(classifiedContextMatch);
        selectedIds.add(classifiedContextMatch.id);
        debugLogs.push(`Retrieved additional context memory around "${keywords.join(", ")}": "${classifiedContextMatch.text}"`);
      }
    }
  }

  // 3. Fill the remaining slots up to the limit
  for (const m of classifiedMatches) {
    if (selected.length >= limit) break;
    if (!selectedIds.has(m.id)) {
      selected.push(m);
      selectedIds.add(m.id);
      debugLogs.push(`Added matching memory: "${m.text}" (Type: ${m.metadata?.classification})`);
    }
  }

  return { prioritized: selected, debugLogs };
}
