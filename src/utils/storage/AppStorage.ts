import { storageManager } from './StorageManager';

// Generic app storage interface
export abstract class AppStorage {
  protected appName: string;
  protected tableName: string;
  protected initialized = false;

  constructor(appName: string, tableName: string) {
    this.appName = appName;
    this.tableName = tableName;
  }

  abstract getSchema(): string;
  
  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    await storageManager.initialize();
    await storageManager.initializeAppTables(this.appName, this.getSchema());
    this.initialized = true;
  }

  protected async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  async getStorageInfo() {
    return await storageManager.getStorageInfo();
  }
}

// Todo Storage
export interface Todo {
  id?: number;
  text: string;
  completed: boolean;
  created_at: string;
  updated_at?: string;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  due_date?: string;
}

export class TodoStorage extends AppStorage {
  constructor() {
    super('todo', 'todos');
  }

  getSchema(): string {
    return `
      CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        created_at TEXT NOT NULL,
        updated_at TEXT,
        priority TEXT DEFAULT 'medium',
        category TEXT,
        due_date TEXT
      );
      
      CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(completed);
      CREATE INDEX IF NOT EXISTS idx_todos_created_at ON todos(created_at);
      CREATE INDEX IF NOT EXISTS idx_todos_priority ON todos(priority);
    `;
  }

  async addTodo(todo: Omit<Todo, 'id'>): Promise<number> {
    await this.ensureInitialized();
    
    const result = await storageManager.execute(`
      INSERT INTO todos (text, completed, created_at, priority, category, due_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      todo.text,
      todo.completed ? 1 : 0,
      todo.created_at,
      todo.priority || 'medium',
      todo.category || null,
      todo.due_date || null
    ]);

    return result.lastInsertRowid;
  }

  async getTodos(filter: 'all' | 'active' | 'completed' = 'all'): Promise<Todo[]> {
    await this.ensureInitialized();

    let query = 'SELECT * FROM todos';
    const params: any[] = [];

    if (filter === 'active') {
      query += ' WHERE completed = ?';
      params.push(0);
    } else if (filter === 'completed') {
      query += ' WHERE completed = ?';
      params.push(1);
    }

    query += ' ORDER BY created_at DESC';

    const rows = await storageManager.query(query, params);
    return rows.map(row => ({
      ...row,
      completed: Boolean(row.completed)
    }));
  }

  async updateTodo(id: number, updates: Partial<Todo>): Promise<boolean> {
    await this.ensureInitialized();

    const setClause: string[] = [];
    const params: any[] = [];

    if (updates.text !== undefined) {
      setClause.push('text = ?');
      params.push(updates.text);
    }
    if (updates.completed !== undefined) {
      setClause.push('completed = ?');
      params.push(updates.completed ? 1 : 0);
    }
    if (updates.priority !== undefined) {
      setClause.push('priority = ?');
      params.push(updates.priority);
    }
    if (updates.category !== undefined) {
      setClause.push('category = ?');
      params.push(updates.category);
    }
    if (updates.due_date !== undefined) {
      setClause.push('due_date = ?');
      params.push(updates.due_date);
    }

    setClause.push('updated_at = ?');
    params.push(new Date().toISOString());
    params.push(id);

    const result = await storageManager.execute(`
      UPDATE todos SET ${setClause.join(', ')} WHERE id = ?
    `, params);

    return result.changes > 0;
  }

  async deleteTodo(id: number): Promise<boolean> {
    await this.ensureInitialized();

    const result = await storageManager.execute('DELETE FROM todos WHERE id = ?', [id]);
    return result.changes > 0;
  }

  async clearCompleted(): Promise<number> {
    await this.ensureInitialized();

    const result = await storageManager.execute('DELETE FROM todos WHERE completed = 1');
    return result.changes;
  }

  async getStats(): Promise<{ total: number; active: number; completed: number }> {
    await this.ensureInitialized();

    const stats = await storageManager.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN completed = 0 THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed
      FROM todos
    `);

    return stats[0] || { total: 0, active: 0, completed: 0 };
  }
}

// Pomodoro Storage
export interface PomodoroSession {
  id?: number;
  type: 'work' | 'shortBreak' | 'longBreak';
  duration: number; // minutes
  completed_at: string;
  interruptions?: number;
  notes?: string;
}

export interface PomodoroSettings {
  work_duration: number;
  short_break_duration: number;
  long_break_duration: number;
  sessions_until_long_break: number;
  sound_enabled: boolean;
  auto_start_breaks: boolean;
  auto_start_work: boolean;
}

export class PomodoroStorage extends AppStorage {
  constructor() {
    super('pomodoro', 'pomodoro_sessions');
  }

  getSchema(): string {
    return `
      CREATE TABLE IF NOT EXISTS pomodoro_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL CHECK(type IN ('work', 'shortBreak', 'longBreak')),
        duration INTEGER NOT NULL,
        completed_at TEXT NOT NULL,
        interruptions INTEGER DEFAULT 0,
        notes TEXT
      );

      CREATE TABLE IF NOT EXISTS pomodoro_settings (
        id INTEGER PRIMARY KEY CHECK(id = 1),
        work_duration INTEGER DEFAULT 25,
        short_break_duration INTEGER DEFAULT 5,
        long_break_duration INTEGER DEFAULT 15,
        sessions_until_long_break INTEGER DEFAULT 4,
        sound_enabled BOOLEAN DEFAULT TRUE,
        auto_start_breaks BOOLEAN DEFAULT FALSE,
        auto_start_work BOOLEAN DEFAULT FALSE,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_completed_at ON pomodoro_sessions(completed_at);
      CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_type ON pomodoro_sessions(type);

      -- Insert default settings if not exists
      INSERT OR IGNORE INTO pomodoro_settings (id, updated_at) VALUES (1, datetime('now'));
    `;
  }

  async addSession(session: Omit<PomodoroSession, 'id'>): Promise<number> {
    await this.ensureInitialized();

    const result = await storageManager.execute(`
      INSERT INTO pomodoro_sessions (type, duration, completed_at, interruptions, notes)
      VALUES (?, ?, ?, ?, ?)
    `, [
      session.type,
      session.duration,
      session.completed_at,
      session.interruptions || 0,
      session.notes || null
    ]);

    return result.lastInsertRowid;
  }

  async getSessions(limit?: number): Promise<PomodoroSession[]> {
    await this.ensureInitialized();

    let query = 'SELECT * FROM pomodoro_sessions ORDER BY completed_at DESC';
    if (limit) {
      query += ` LIMIT ${limit}`;
    }

    return await storageManager.query(query);
  }

  async getSettings(): Promise<PomodoroSettings> {
    await this.ensureInitialized();

    const settings = await storageManager.query('SELECT * FROM pomodoro_settings WHERE id = 1');
    if (settings.length === 0) {
      throw new Error('Settings not found');
    }

    return {
      work_duration: settings[0].work_duration,
      short_break_duration: settings[0].short_break_duration,
      long_break_duration: settings[0].long_break_duration,
      sessions_until_long_break: settings[0].sessions_until_long_break,
      sound_enabled: Boolean(settings[0].sound_enabled),
      auto_start_breaks: Boolean(settings[0].auto_start_breaks),
      auto_start_work: Boolean(settings[0].auto_start_work),
    };
  }

  async updateSettings(settings: Partial<PomodoroSettings>): Promise<void> {
    await this.ensureInitialized();

    const updates: string[] = [];
    const params: any[] = [];

    Object.entries(settings).forEach(([key, value]) => {
      updates.push(`${key} = ?`);
      params.push(typeof value === 'boolean' ? (value ? 1 : 0) : value);
    });

    updates.push('updated_at = ?');
    params.push(new Date().toISOString());

    await storageManager.execute(`
      UPDATE pomodoro_settings SET ${updates.join(', ')} WHERE id = 1
    `, params);
  }

  async getSessionStats(days: number = 30): Promise<{
    totalSessions: number;
    workSessions: number;
    totalMinutes: number;
    averageSessionsPerDay: number;
    streak: number;
  }> {
    await this.ensureInitialized();

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const stats = await storageManager.query(`
      SELECT 
        COUNT(*) as totalSessions,
        SUM(CASE WHEN type = 'work' THEN 1 ELSE 0 END) as workSessions,
        SUM(duration) as totalMinutes
      FROM pomodoro_sessions 
      WHERE completed_at >= ?
    `, [cutoffDate.toISOString()]);

    const averageSessionsPerDay = days > 0 ? (stats[0].totalSessions || 0) / days : 0;

    // Calculate streak (consecutive days with at least one work session)
    const streakQuery = await storageManager.query(`
      SELECT DATE(completed_at) as date
      FROM pomodoro_sessions 
      WHERE type = 'work'
      GROUP BY DATE(completed_at)
      ORDER BY DATE(completed_at) DESC
    `);

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const row of streakQuery) {
      const sessionDate = new Date(row.date);
      sessionDate.setHours(0, 0, 0, 0);
      
      if (sessionDate.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (sessionDate.getTime() === currentDate.getTime() + 24 * 60 * 60 * 1000) {
        // Yesterday
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return {
      totalSessions: stats[0].totalSessions || 0,
      workSessions: stats[0].workSessions || 0,
      totalMinutes: stats[0].totalMinutes || 0,
      averageSessionsPerDay,
      streak
    };
  }
}

// Countdown Storage
export interface CountdownSettings {
  id?: number;
  date_of_birth: string;
  target_age: number;
  created_at: string;
  updated_at?: string;
}

export class CountdownStorage extends AppStorage {
  constructor() {
    super('countdown', 'countdown_settings');
  }

  getSchema(): string {
    return `
      CREATE TABLE IF NOT EXISTS countdown_settings (
        id INTEGER PRIMARY KEY CHECK(id = 1),
        date_of_birth TEXT NOT NULL,
        target_age INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT
      );
    `;
  }

  async saveSettings(dateOfBirth: string, targetAge: number): Promise<void> {
    await this.ensureInitialized();

    const now = new Date().toISOString();

    await storageManager.execute(`
      INSERT OR REPLACE INTO countdown_settings (id, date_of_birth, target_age, created_at, updated_at)
      VALUES (1, ?, ?, COALESCE((SELECT created_at FROM countdown_settings WHERE id = 1), ?), ?)
    `, [dateOfBirth, targetAge, now, now]);
  }

  async getSettings(): Promise<CountdownSettings | null> {
    await this.ensureInitialized();

    const settings = await storageManager.query('SELECT * FROM countdown_settings WHERE id = 1');
    return settings.length > 0 ? settings[0] : null;
  }
}

// Chat Storage
export interface ChatMessage {
  id?: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  conversation_id: string;
  tokens_used?: number;
  model?: string;
}

export interface ChatConversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export class ChatStorage extends AppStorage {
  constructor() {
    super('chat', 'chat_messages');
  }

  getSchema(): string {
    return `
      CREATE TABLE IF NOT EXISTS chat_conversations (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        message_count INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_id TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
        content TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        tokens_used INTEGER,
        model TEXT,
        FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages(conversation_id);
      CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(timestamp);
      CREATE INDEX IF NOT EXISTS idx_chat_conversations_updated ON chat_conversations(updated_at);
    `;
  }

  async createConversation(title: string): Promise<string> {
    await this.ensureInitialized();

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await storageManager.execute(`
      INSERT INTO chat_conversations (id, title, created_at, updated_at, message_count)
      VALUES (?, ?, ?, ?, 0)
    `, [id, title, now, now]);

    return id;
  }

  async getConversations(): Promise<ChatConversation[]> {
    await this.ensureInitialized();

    return await storageManager.query(`
      SELECT * FROM chat_conversations 
      ORDER BY updated_at DESC
    `);
  }

  async addMessage(message: Omit<ChatMessage, 'id'>): Promise<number> {
    await this.ensureInitialized();

    const result = await storageManager.execute(`
      INSERT INTO chat_messages (conversation_id, role, content, timestamp, tokens_used, model)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      message.conversation_id,
      message.role,
      message.content,
      message.timestamp,
      message.tokens_used || null,
      message.model || null
    ]);

    // Update conversation message count and updated_at
    await storageManager.execute(`
      UPDATE chat_conversations 
      SET message_count = message_count + 1, updated_at = ?
      WHERE id = ?
    `, [message.timestamp, message.conversation_id]);

    return result.lastInsertRowid;
  }

  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    await this.ensureInitialized();

    return await storageManager.query(`
      SELECT * FROM chat_messages 
      WHERE conversation_id = ?
      ORDER BY timestamp ASC
    `, [conversationId]);
  }

  async deleteConversation(conversationId: string): Promise<boolean> {
    await this.ensureInitialized();

    const result = await storageManager.execute(`
      DELETE FROM chat_conversations WHERE id = ?
    `, [conversationId]);

    return result.changes > 0;
  }
}

// Export storage instances
export const todoStorage = new TodoStorage();
export const pomodoroStorage = new PomodoroStorage();
export const countdownStorage = new CountdownStorage();
export const chatStorage = new ChatStorage();
