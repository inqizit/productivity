import React, { useState, useEffect, useCallback } from 'react';
import './TodoApp.css';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  createdAt: string;
}

type FilterType = 'all' | 'active' | 'completed';

const TodoApp: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState<string>('');
  const [filter, setFilter] = useState<FilterType>('all');

  // Storage key
  const STORAGE_KEY = 'productivity-todos';

  // Load todos from localStorage
  const loadTodos = useCallback((): void => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedTodos: Todo[] = JSON.parse(stored);
        setTodos(parsedTodos);
      }
    } catch (error) {
      console.error('Error loading todos:', error);
    }
  }, [STORAGE_KEY]);

  // Save todos to localStorage
  const saveTodos = useCallback((todosToSave: Todo[]): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todosToSave));
    } catch (error) {
      console.error('Error saving todos:', error);
    }
  }, [STORAGE_KEY]);

  // Load todos on component mount
  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  // Save todos whenever todos array changes
  useEffect(() => {
    if (todos.length > 0) {
      saveTodos(todos);
    }
  }, [todos, saveTodos]);

  // Add new todo
  const addTodo = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (newTodo.trim()) {
      const todo: Todo = {
        id: Date.now(),
        text: newTodo.trim(),
        completed: false,
        createdAt: new Date().toISOString()
      };
      setTodos(prevTodos => [todo, ...prevTodos]);
      setNewTodo('');
    }
  };

  // Toggle todo completion
  const toggleTodo = (id: number): void => {
    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  // Delete todo
  const deleteTodo = (id: number): void => {
    setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
  };

  // Clear completed todos
  const clearCompleted = (): void => {
    setTodos(prevTodos => prevTodos.filter(todo => !todo.completed));
  };

  // Filter todos based on current filter
  const filteredTodos = todos.filter(todo => {
    switch (filter) {
      case 'active':
        return !todo.completed;
      case 'completed':
        return todo.completed;
      default:
        return true;
    }
  });

  // Calculate stats
  const totalTodos = todos.length;
  const activeTodos = todos.filter(todo => !todo.completed).length;
  const completedTodos = todos.filter(todo => todo.completed).length;

  // Calculate storage usage
  const getStorageUsage = (): string => {
    try {
      const data = localStorage.getItem(STORAGE_KEY) || '';
      const bytes = new Blob([data]).size;
      return `${(bytes / 1024).toFixed(2)} KB`;
    } catch {
      return 'Unknown';
    }
  };

  return (
    <div className="todo-app">
      <div className="todo-container">
        <div className="todo-header">
          <h1>📝 Todo Manager</h1>
          <p>Simple and effective task management</p>
        </div>

        <form onSubmit={addTodo} className="todo-form">
          <div className="input-group">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Add a new task..."
              className="todo-input"
              maxLength={200}
            />
            <button type="submit" className="add-button" disabled={!newTodo.trim()}>
              ➕ Add
            </button>
          </div>
        </form>

        <div className="todo-filters">
          <button
            className={`filter-button ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({totalTodos})
          </button>
          <button
            className={`filter-button ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Active ({activeTodos})
          </button>
          <button
            className={`filter-button ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed ({completedTodos})
          </button>
        </div>

        <div className="todo-list">
          {filteredTodos.length === 0 ? (
            <div className="empty-state">
              {filter === 'all' && <p>🎯 No tasks yet. Add one above!</p>}
              {filter === 'active' && <p>✅ No active tasks. Great job!</p>}
              {filter === 'completed' && <p>📋 No completed tasks yet.</p>}
            </div>
          ) : (
            filteredTodos.map(todo => (
              <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                <div className="todo-content">
                  <button
                    className="toggle-button"
                    onClick={() => toggleTodo(todo.id)}
                    aria-label={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
                  >
                    {todo.completed ? '✅' : '⭕'}
                  </button>
                  <span className="todo-text">{todo.text}</span>
                </div>
                <div className="todo-actions">
                  <span className="todo-date">
                    {new Date(todo.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    className="delete-button"
                    onClick={() => deleteTodo(todo.id)}
                    aria-label="Delete task"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {completedTodos > 0 && (
          <div className="todo-actions-bar">
            <button onClick={clearCompleted} className="clear-button">
              🧹 Clear Completed ({completedTodos})
            </button>
          </div>
        )}

        <div className="todo-stats">
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">{totalTodos}</span>
              <span className="stat-label">Total Tasks</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{activeTodos}</span>
              <span className="stat-label">Active</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{completedTodos}</span>
              <span className="stat-label">Completed</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{getStorageUsage()}</span>
              <span className="stat-label">Storage Used</span>
            </div>
          </div>
          <p className="storage-info">
            💾 Data saved locally in your browser • Works offline
          </p>
        </div>
      </div>
    </div>
  );
};

export default TodoApp;
