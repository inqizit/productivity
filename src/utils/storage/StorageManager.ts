import initSqlJs from 'sql.js';
import { indexedDBManager, StorageQuota } from './IndexedDBManager';

// File System Access API types
interface FileSystemDirectoryHandle {
  name: string;
  kind: 'directory';
  getFileHandle(name: string, options?: { create?: boolean }): Promise<FileSystemFileHandle>;
  getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<FileSystemDirectoryHandle>;
  values(): AsyncIterableIterator<FileSystemDirectoryHandle | FileSystemFileHandle>;
  keys(): AsyncIterableIterator<string>;
  entries(): AsyncIterableIterator<[string, FileSystemDirectoryHandle | FileSystemFileHandle]>;
}

interface FileSystemFileHandle {
  name: string;
  kind: 'file';
  getFile(): Promise<File>;
  createWritable(): Promise<FileSystemWritableFileStream>;
}

interface FileSystemWritableFileStream extends WritableStream {
  write(data: BufferSource | Blob | string): Promise<void>;
  seek(position: number): Promise<void>;
  truncate(size: number): Promise<void>;
  close(): Promise<void>;
}

// Extend Window interface for File System Access API
declare global {
  interface Window {
    showDirectoryPicker?: (options?: {
      mode?: 'read' | 'readwrite';
      startIn?: 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos';
    }) => Promise<FileSystemDirectoryHandle>;
  }
}

// Storage configuration
interface StorageConfig {
  appName: string;
  version: string;
  maxRetries: number;
}

// Storage types
export type StorageType = 'indexedDB' | 'localStorage' | 'fileSystem';

export class StorageManager {
  private static instance: StorageManager;
  private sql: any = null;
  private db: any = null;
  private dirHandle: FileSystemDirectoryHandle | null = null;
  private config: StorageConfig;
  private initialized = false;
  private currentStorage: StorageType = 'localStorage';

  private constructor(config: StorageConfig) {
    this.config = config;
  }

  static getInstance(config?: StorageConfig): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager(config || {
        appName: 'productivity-suite',
        version: '1.0.0',
        maxRetries: 3
      });
    }
    return StorageManager.instance;
  }

  /**
   * Check if File System Access API is supported
   */
  static isFileSystemAccessSupported(): boolean {
    return 'showDirectoryPicker' in window && typeof window.showDirectoryPicker === 'function';
  }

  /**
   * Initialize storage system
   */
  async initialize(preferredStorage?: StorageType): Promise<void> {
    if (this.initialized) return;

    try {
      // Priority order: IndexedDB > File System > localStorage
      const storageOrder: StorageType[] = preferredStorage 
        ? [preferredStorage, 'indexedDB', 'fileSystem', 'localStorage']
        : ['indexedDB', 'fileSystem', 'localStorage'];

      for (const storageType of storageOrder) {
        try {
          if (await this.tryInitializeStorage(storageType)) {
            this.currentStorage = storageType;
            this.initialized = true;
            console.log(`✅ Storage initialized with ${this.currentStorage} backend`);
            return;
          }
        } catch (error) {
          console.warn(`Failed to initialize ${storageType}:`, error);
          continue;
        }
      }

      throw new Error('All storage methods failed');
    } catch (error) {
      console.error('❌ Failed to initialize any storage method:', error);
      // Ultimate fallback to localStorage without IndexedDB
      this.currentStorage = 'localStorage';
      this.initialized = true;
    }
  }

  /**
   * Try to initialize a specific storage type
   */
  private async tryInitializeStorage(storageType: StorageType): Promise<boolean> {
    switch (storageType) {
      case 'indexedDB':
        await indexedDBManager.initialize();
        return true;

      case 'fileSystem':
        if (!StorageManager.isFileSystemAccessSupported()) {
          return false;
        }
        await this.tryRestoreDirectoryHandle();
        if (this.dirHandle) {
          // Initialize SQL.js for file system storage
          this.sql = await initSqlJs({
            locateFile: (file) => `https://sql.js.org/dist/${file}`
          });
          await this.initializeSQLiteFromFile();
          return true;
        }
        return false;

      case 'localStorage':
        // Initialize SQL.js for localStorage backup
        this.sql = await initSqlJs({
          locateFile: (file) => `https://sql.js.org/dist/${file}`
        });
        await this.initializeSQLiteInMemory();
        return true;

      default:
        return false;
    }
  }

  /**
   * Select storage directory
   */
  async selectStorageDirectory(): Promise<boolean> {
    if (!StorageManager.isFileSystemAccessSupported()) {
      throw new Error('File System Access API not supported');
    }

    try {
      this.dirHandle = await window.showDirectoryPicker!({
        mode: 'readwrite',
        startIn: 'documents'
      });

      // Save directory handle reference
      await this.saveDirectoryHandle();

      // Reinitialize with file system
      await this.initializeSQLiteFromFile();
      this.currentStorage = 'fileSystem';

      console.log(`✅ Storage directory selected: ${this.dirHandle.name}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to select directory:', error);
      return false;
    }
  }

  /**
   * Get current storage type
   */
  getStorageType(): StorageType {
    return this.currentStorage;
  }

  /**
   * Get storage info
   */
  async getStorageInfo(): Promise<{
    type: StorageType;
    location: string;
    size: string;
    available: boolean;
    quota?: StorageQuota;
  }> {
    const info = {
      type: this.currentStorage,
      location: '',
      size: '0 KB',
      available: true,
      quota: undefined as StorageQuota | undefined
    };

    try {
      if (this.currentStorage === 'indexedDB') {
        info.location = 'Browser IndexedDB';
        const quota = await indexedDBManager.getStorageQuota();
        info.quota = quota;
        
        if (quota.quota > 0) {
          const usedGB = quota.usage / (1024 * 1024 * 1024);
          const quotaGB = quota.quota / (1024 * 1024 * 1024);
          
          if (usedGB < 1) {
            info.size = `${(quota.usage / (1024 * 1024)).toFixed(2)} MB of ${quotaGB.toFixed(1)} GB (${quota.percentage.toFixed(1)}%)`;
          } else {
            info.size = `${usedGB.toFixed(2)} GB of ${quotaGB.toFixed(1)} GB (${quota.percentage.toFixed(1)}%)`;
          }
        } else {
          info.size = 'Quota unavailable';
        }
        
      } else if (this.currentStorage === 'fileSystem' && this.dirHandle) {
        info.location = this.dirHandle.name;
        // Try to estimate size by database file
        try {
          const fileHandle = await this.dirHandle.getFileHandle(`${this.config.appName}.db`);
          const file = await fileHandle.getFile();
          info.size = `${(file.size / 1024).toFixed(2)} KB`;
        } catch {
          info.size = 'New database';
        }
      } else {
        info.location = 'Browser localStorage';
        // Estimate localStorage usage
        let totalSize = 0;
        for (const key in localStorage) {
          if (key.startsWith(this.config.appName)) {
            totalSize += localStorage[key].length;
          }
        }
        info.size = `${(totalSize / 1024).toFixed(2)} KB of ~5-10MB (${((totalSize / (5 * 1024 * 1024)) * 100).toFixed(1)}%)`;
      }
    } catch (error) {
      console.error('Error getting storage info:', error);
      info.available = false;
    }

    return info;
  }

  /**
   * Execute SQL query
   */
  async query(sql: string, params: any[] = []): Promise<any[]> {
    await this.ensureInitialized();

    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      const stmt = this.db.prepare(sql);
      const result: any[] = [];
      
      stmt.bind(params);
      while (stmt.step()) {
        const row = stmt.getAsObject();
        result.push(row);
      }
      stmt.free();

      // Auto-save if using file system
      if (this.currentStorage === 'fileSystem') {
        await this.saveDatabase();
      }

      return result;
    } catch (error) {
      console.error('❌ SQL query error:', error);
      throw error;
    }
  }

  /**
   * Execute SQL with no return data (INSERT, UPDATE, DELETE)
   */
  async execute(sql: string, params: any[] = []): Promise<{ changes: number; lastInsertRowid: number }> {
    await this.ensureInitialized();

    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      const stmt = this.db.prepare(sql);
      stmt.run(params);
      const changes = this.db.getRowsModified();
      const lastInsertRowid = this.db.exec("SELECT last_insert_rowid() as id")[0]?.values[0]?.[0] || 0;
      stmt.free();

      // Auto-save if using file system
      if (this.currentStorage === 'fileSystem') {
        await this.saveDatabase();
      }

      return { changes, lastInsertRowid };
    } catch (error) {
      console.error('❌ SQL execute error:', error);
      throw error;
    }
  }

  /**
   * Initialize tables for an app
   */
  async initializeAppTables(appName: string, schema: string): Promise<void> {
    await this.ensureInitialized();
    await this.execute(schema);
    console.log(`✅ Initialized tables for ${appName}`);
  }

  /**
   * Export data as SQL dump
   */
  async exportData(): Promise<string> {
    await this.ensureInitialized();

    if (!this.db) {
      throw new Error('Database not initialized');
    }

    // Get all table names
    const tables = await this.query(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `);

    let exportSQL = '-- Productivity Suite Data Export\n';
    exportSQL += `-- Exported: ${new Date().toISOString()}\n\n`;

    for (const table of tables) {
      const tableName = table.name;
      
      // Get table schema
      const schema = await this.query(`
        SELECT sql FROM sqlite_master 
        WHERE type='table' AND name=?
      `, [tableName]);
      
      if (schema[0]) {
        exportSQL += `${schema[0].sql};\n\n`;
      }

      // Get table data
      const rows = await this.query(`SELECT * FROM ${tableName}`);
      
      if (rows.length > 0) {
        const columns = Object.keys(rows[0]);
        exportSQL += `-- Data for table ${tableName}\n`;
        
        for (const row of rows) {
          const values = columns.map(col => {
            const val = row[col];
            if (val === null) return 'NULL';
            if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
            return val;
          });
          
          exportSQL += `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
        }
        exportSQL += '\n';
      }
    }

    return exportSQL;
  }

  /**
   * Import data from SQL dump
   */
  async importData(sqlDump: string): Promise<void> {
    await this.ensureInitialized();

    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      // Split SQL commands and execute them
      const commands = sqlDump.split(';').filter(cmd => cmd.trim() && !cmd.trim().startsWith('--'));
      
      for (const command of commands) {
        if (command.trim()) {
          await this.execute(command.trim());
        }
      }

      console.log('✅ Data imported successfully');
    } catch (error) {
      console.error('❌ Failed to import data:', error);
      throw error;
    }
  }

  // Private methods

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  private async initializeSQLiteInMemory(): Promise<void> {
    if (!this.sql) {
      throw new Error('SQL.js not initialized');
    }

    this.db = new this.sql.Database();
    console.log('📝 Initialized in-memory SQLite database');
  }

  private async initializeSQLiteFromFile(): Promise<void> {
    if (!this.sql || !this.dirHandle) {
      throw new Error('SQL.js or directory handle not available');
    }

    try {
      // Try to load existing database
      const fileHandle = await this.dirHandle.getFileHandle(`${this.config.appName}.db`);
      const file = await fileHandle.getFile();
      const buffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(buffer);
      this.db = new this.sql.Database(uint8Array);
      console.log('📂 Loaded existing SQLite database from file system');
    } catch (error) {
      // Create new database
      this.db = new this.sql.Database();
      await this.saveDatabase();
      console.log('🆕 Created new SQLite database in file system');
    }
  }

  private async saveDatabase(): Promise<void> {
    if (!this.db || !this.dirHandle) {
      return;
    }

    try {
      const data = this.db.export();
      const fileHandle = await this.dirHandle.getFileHandle(`${this.config.appName}.db`, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(data);
      await writable.close();
    } catch (error) {
      console.error('❌ Failed to save database:', error);
    }
  }

  private async saveDirectoryHandle(): Promise<void> {
    if (!this.dirHandle) return;

    try {
      // We can't actually save the handle, but we can save a reference
      // The user will need to re-select on page reload
      localStorage.setItem(`${this.config.appName}-has-directory`, 'true');
      localStorage.setItem(`${this.config.appName}-directory-name`, this.dirHandle.name);
    } catch (error) {
      console.error('Failed to save directory reference:', error);
    }
  }

  private async tryRestoreDirectoryHandle(): Promise<void> {
    // Unfortunately, we can't restore FileSystemDirectoryHandle from localStorage
    // The user needs to re-select the directory each session
    const hasDirectory = localStorage.getItem(`${this.config.appName}-has-directory`);
    const directoryName = localStorage.getItem(`${this.config.appName}-directory-name`);

    if (hasDirectory && directoryName) {
      console.log(`📁 Previous directory was: ${directoryName} (needs re-selection)`);
    }
  }
}

// Export singleton instance
export const storageManager = StorageManager.getInstance();
