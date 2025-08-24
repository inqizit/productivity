import React, { useState, useEffect, useCallback } from 'react';
import './TodoApp.css';

function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, completed

  // Storage key
  const STORAGE_KEY = 'productivity-todos';

  // Load todos from localStorage
  const loadTodos = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedTodos = JSON.parse(stored);
        setTodos(parsedTodos);
      }
    } catch (error) {
      console.error('Error loading todos:', error);
    }
  }, [STORAGE_KEY]);

  // Save todos to localStorage
  const saveTodos = useCallback((todosToSave) => {
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
  const addTodo = (e) => {
    e.preventDefault();
    if (newTodo.trim()) {
      const todo = {
        id: Date.now(),
        text: newTodo.trim(),
        completed: false,
        createdAt: new Date().toISOString()
      };
      setTodos(prev => [todo, ...prev]);
      setNewTodo('');
    }
  };

  // Toggle todo completion
  const toggleTodo = (id) => {
    setTodos(prev => 
      prev.map(todo => 
        todo.id === id 
          ? { ...todo, completed: !todo.completed }
          : todo
      )
    );
  };

  // Delete todo
  const deleteTodo = (id) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  // Clear completed todos
  const clearCompleted = () => {
    setTodos(prev => prev.filter(todo => !todo.completed));
  };

  // Filter todos
  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true; // 'all'
  });

  // Stats
  const totalTodos = todos.length;
  const completedTodos = todos.filter(todo => todo.completed).length;
  const activeTodos = totalTodos - completedTodos;

  return (
    <div className="todo-app">
      <div className="todo-container">
        <div className="todo-header">
          <h1 className="todo-title">📝 Todo Manager</h1>
          <p className="todo-subtitle">
            {totalTodos > 0 
              ? `${activeTodos} active, ${completedTodos} completed`
              : 'Add your first task!'
            }
          </p>
        </div>

        <form onSubmit={addTodo} className="todo-form">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="What needs to be done?"
            className="todo-input"
            maxLength="200"
          />
          <button type="submit" className="add-button">
            ➕ Add
          </button>
        </form>

        {totalTodos > 0 && (
          <>
            <div className="todo-filters">
              <button 
                className={filter === 'all' ? 'filter-button active' : 'filter-button'}
                onClick={() => setFilter('all')}
              >
                All ({totalTodos})
              </button>
              <button 
                className={filter === 'active' ? 'filter-button active' : 'filter-button'}
                onClick={() => setFilter('active')}
              >
                Active ({activeTodos})
              </button>
              <button 
                className={filter === 'completed' ? 'filter-button active' : 'filter-button'}
                onClick={() => setFilter('completed')}
              >
                Done ({completedTodos})
              </button>
            </div>

            <div className="todo-list">
              {filteredTodos.map(todo => (
                <div 
                  key={todo.id} 
                  className={`todo-item ${todo.completed ? 'completed' : ''}`}
                >
                  <button
                    className="toggle-button"
                    onClick={() => toggleTodo(todo.id)}
                  >
                    {todo.completed ? '✅' : '⭕'}
                  </button>
                  
                  <span className="todo-text">
                    {todo.text}
                  </span>
                  
                  <button
                    className="delete-button"
                    onClick={() => deleteTodo(todo.id)}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>

            {completedTodos > 0 && (
              <div className="todo-actions">
                <button 
                  className="clear-button"
                  onClick={clearCompleted}
                >
                  🧹 Clear Completed ({completedTodos})
                </button>
              </div>
            )}

            <div className="storage-info">
              <p>💾 Data saved locally - works offline!</p>
              <p>📊 Using {((JSON.stringify(todos).length / 1024)).toFixed(1)}KB storage</p>
            </div>
          </>
        )}

        {totalTodos === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <p>No tasks yet. Add one above to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TodoApp;
