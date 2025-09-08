/**
 * IndexedDB Storage Manager for Productivity Suite
 * Provides much larger storage limits than localStorage (GBs vs MBs)
 */

export interface StorageQuota {
  quota: number;
  usage: number;
  available: number;
  percentage: number;
}

export interface DatabaseSchema {
  name: string;
  version: number;
  stores: ObjectStoreSchema[];
}

export interface ObjectStoreSchema {
  name: string;
  keyPath: string;
  autoIncrement?: boolean;
  indexes?: IndexSchema[];
}

export interface IndexSchema {
  name: string;
  keyPath: string;
  unique?: boolean;
}

export class IndexedDBManager {
  private db: IDBDatabase | null = null;
  private dbName: string;
  private version: number;
  private schema: DatabaseSchema;

  constructor(dbName: string = 'ProductivitySuite', version: number = 1) {
    this.dbName = dbName;
    this.version = version;
    this.schema = this.getDefaultSchema();
  }

  /**
   * Get default database schema for productivity apps
   */
  private getDefaultSchema(): DatabaseSchema {
    return {
      name: this.dbName,
      version: this.version,
      stores: [
        // Countdown App
        {
          name: 'countdown_settings',
          keyPath: 'id',
          autoIncrement: true,
          indexes: [
            { name: 'dob', keyPath: 'dob', unique: false },
            { name: 'created_at', keyPath: 'created_at', unique: false }
          ]
        },
        
        // Todo App
        {
          name: 'todos',
          keyPath: 'id',
          autoIncrement: true,
          indexes: [
            { name: 'completed', keyPath: 'completed', unique: false },
            { name: 'created_at', keyPath: 'created_at', unique: false },
            { name: 'priority', keyPath: 'priority', unique: false },
            { name: 'category', keyPath: 'category', unique: false }
          ]
        },
        
        // Pomodoro App  
        {
          name: 'pomodoro_sessions',
          keyPath: 'id',
          autoIncrement: true,
          indexes: [
            { name: 'date', keyPath: 'date', unique: false },
            { name: 'type', keyPath: 'type', unique: false },
            { name: 'completed', keyPath: 'completed', unique: false }
          ]
        },
        {
          name: 'pomodoro_settings',
          keyPath: 'id',
          autoIncrement: true
        },
        
        // Chat App
        {
          name: 'chat_conversations',
          keyPath: 'id',
          autoIncrement: true,
          indexes: [
            { name: 'created_at', keyPath: 'created_at', unique: false },
            { name: 'updated_at', keyPath: 'updated_at', unique: false }
          ]
        },
        {
          name: 'chat_messages',
          keyPath: 'id',
          autoIncrement: true,
          indexes: [
            { name: 'conversation_id', keyPath: 'conversation_id', unique: false },
            { name: 'timestamp', keyPath: 'timestamp', unique: false },
            { name: 'role', keyPath: 'role', unique: false }
          ]
        },
        
        // General metadata
        {
          name: 'app_metadata',
          keyPath: 'key',
          indexes: [
            { name: 'updated_at', keyPath: 'updated_at', unique: false }
          ]
        }
      ]
    };
  }

  /**
   * Initialize IndexedDB connection
   */
  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        reject(new Error(`Failed to open IndexedDB: ${request.error}`));
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log(`✅ IndexedDB initialized: ${this.dbName} v${this.version}`);
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.setupSchema(db);
      };
    });
  }

  /**
   * Setup database schema during upgrade
   */
  private setupSchema(db: IDBDatabase): void {
    console.log('🔧 Setting up IndexedDB schema...');

    for (const storeSchema of this.schema.stores) {
      // Delete existing store if it exists (for upgrades)
      if (db.objectStoreNames.contains(storeSchema.name)) {
        db.deleteObjectStore(storeSchema.name);
      }

      // Create object store
      const store = db.createObjectStore(storeSchema.name, {
        keyPath: storeSchema.keyPath,
        autoIncrement: storeSchema.autoIncrement || false
      });

      // Create indexes
      if (storeSchema.indexes) {
        for (const indexSchema of storeSchema.indexes) {
          store.createIndex(indexSchema.name, indexSchema.keyPath, {
            unique: indexSchema.unique || false
          });
        }
      }

      console.log(`📋 Created object store: ${storeSchema.name}`);
    }
  }

  /**
   * Get storage quota information
   */
  async getStorageQuota(): Promise<StorageQuota> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const quota = estimate.quota || 0;
      const usage = estimate.usage || 0;
      const available = quota - usage;
      const percentage = quota > 0 ? (usage / quota) * 100 : 0;

      return {
        quota,
        usage,
        available,
        percentage
      };
    }

    // Fallback for browsers without Storage API
    return {
      quota: 0,
      usage: 0,
      available: 0,
      percentage: 0
    };
  }

  /**
   * Add data to object store
   */
  async add<T>(storeName: string, data: T): Promise<number> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);

      request.onsuccess = () => {
        resolve(request.result as number);
      };

      request.onerror = () => {
        reject(new Error(`Failed to add data to ${storeName}: ${request.error}`));
      };
    });
  }

  /**
   * Update data in object store
   */
  async update<T>(storeName: string, data: T): Promise<void> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error(`Failed to update data in ${storeName}: ${request.error}`));
      };
    });
  }

  /**
   * Get data by key
   */
  async get<T>(storeName: string, key: any): Promise<T | null> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        reject(new Error(`Failed to get data from ${storeName}: ${request.error}`));
      };
    });
  }

  /**
   * Get all data from object store
   */
  async getAll<T>(storeName: string): Promise<T[]> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(new Error(`Failed to get all data from ${storeName}: ${request.error}`));
      };
    });
  }

  /**
   * Delete data by key
   */
  async delete(storeName: string, key: any): Promise<void> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error(`Failed to delete data from ${storeName}: ${request.error}`));
      };
    });
  }

  /**
   * Clear all data from object store
   */
  async clear(storeName: string): Promise<void> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error(`Failed to clear ${storeName}: ${request.error}`));
      };
    });
  }

  /**
   * Query data using index
   */
  async query<T>(storeName: string, indexName: string, value: any): Promise<T[]> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(new Error(`Failed to query ${storeName} by ${indexName}: ${request.error}`));
      };
    });
  }

  /**
   * Count records in object store
   */
  async count(storeName: string): Promise<number> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.count();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(new Error(`Failed to count records in ${storeName}: ${request.error}`));
      };
    });
  }

  /**
   * Export all data for backup
   */
  async exportData(): Promise<any> {
    await this.ensureInitialized();
    
    const exportData: any = {
      version: this.version,
      timestamp: new Date().toISOString(),
      stores: {}
    };

    for (const storeSchema of this.schema.stores) {
      const storeName = storeSchema.name;
      exportData.stores[storeName] = await this.getAll(storeName);
    }

    return exportData;
  }

  /**
   * Import data from backup
   */
  async importData(data: any): Promise<void> {
    await this.ensureInitialized();
    
    if (!data.stores) {
      throw new Error('Invalid import data format');
    }

    // Clear existing data
    for (const storeName of Object.keys(data.stores)) {
      await this.clear(storeName);
    }

    // Import new data
    for (const [storeName, storeData] of Object.entries(data.stores)) {
      if (Array.isArray(storeData)) {
        for (const item of storeData as any[]) {
          await this.add(storeName, item);
        }
      }
    }

    console.log('✅ Data imported successfully');
  }

  /**
   * Get storage usage statistics
   */
  async getUsageStats(): Promise<any> {
    const quota = await this.getStorageQuota();
    const stats: any = {
      quota,
      stores: {}
    };

    for (const storeSchema of this.schema.stores) {
      const storeName = storeSchema.name;
      const count = await this.count(storeName);
      stats.stores[storeName] = { count };
    }

    return stats;
  }

  /**
   * Ensure database is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }
  }

  /**
   * Close database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      console.log('📦 IndexedDB connection closed');
    }
  }
}

// Export singleton instance
export const indexedDBManager = new IndexedDBManager();
