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

  async init() {
    return new Promise<void>((resolve, reject) => {
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
      request.onerror = () => reject(request.error);
    });
  }

  async add(entry: MemoryEntry) {
    if (!this.db) await this.init();
    return new Promise<void>((resolve, reject) => {
      const transaction = this.db!.transaction(this.storeName, "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.put(entry);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async search(queryEmbedding: number[], topK = 3, threshold = 0.5): Promise<MemoryEntry[]> {
    if (!this.db) await this.init();
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
    if (!this.db) await this.init();
    const transaction = this.db!.transaction(this.storeName, "readwrite");
    transaction.objectStore(this.storeName).clear();
  }
}

export const memoryStore = new VectorStore();
