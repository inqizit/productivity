import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import StorageSettings from './storage/StorageSettings';
import './Homepage.css';

// Import package.json to get version
const packageInfo = require('../../package.json');

const Homepage: React.FC = () => {
  const [showStorageSettings, setShowStorageSettings] = useState(false);

  return (
    <div className="homepage">
      <div className="container">
        <div className="homepage-header">
          <div>
            <h1 className="homepage-title">🎯 Productivity Suite</h1>
            <p className="homepage-subtitle">Collection of useful productivity apps with advanced storage</p>
          </div>
          <button 
            className="storage-settings-button"
            onClick={() => setShowStorageSettings(true)}
            title="Manage your data storage"
          >
            💾 Storage
          </button>
        </div>

        <div className="apps-grid">
          <Link to="/countdown" className="app-card">
            <div className="app-icon">⏰</div>
            <h3 className="app-title">Age Countdown</h3>
            <p className="app-description">Track your progress to any target age with days, hours, and visual progress. Settings saved automatically!</p>
            <div className="app-badge">Available</div>
          </Link>

          <Link to="/todo" className="app-card">
            <div className="app-icon">📝</div>
            <h3 className="app-title">Todo Manager</h3>
            <p className="app-description">Simple and effective task management with localStorage persistence. Works offline!</p>
            <div className="app-badge">Available</div>
          </Link>

          <Link to="/pomodoro" className="app-card">
            <div className="app-icon">⏱️</div>
            <h3 className="app-title">Pomodoro Timer</h3>
            <p className="app-description">Focus and productivity timer with break reminders and sound notifications</p>
            <div className="app-badge">Available</div>
          </Link>

          <Link to="/chat" className="app-card">
            <div className="app-icon">🤖</div>
            <h3 className="app-title">AI Chat</h3>
            <p className="app-description">Chat with local AI models running entirely in your browser. Private, fast, and offline-capable!</p>
            <div className="app-badge">Available</div>
          </Link>

          <div className="app-card coming-soon">
            <div className="app-icon">📊</div>
            <h3 className="app-title">Habit Tracker</h3>
            <p className="app-description">Build and maintain good habits with visual tracking and streaks</p>
            <div className="app-badge">Coming Soon</div>
          </div>

          <div className="app-card coming-soon">
            <div className="app-icon">📈</div>
            <h3 className="app-title">Goal Tracker</h3>
            <p className="app-description">Set, track, and achieve your personal and professional goals</p>
            <div className="app-badge">Coming Soon</div>
          </div>

          <div className="app-card coming-soon">
            <div className="app-icon">💰</div>
            <h3 className="app-title">Expense Tracker</h3>
            <p className="app-description">Monitor your spending and manage your budget effectively</p>
            <div className="app-badge">Coming Soon</div>
          </div>
        </div>

        <div className="footer-info">
          <p>🚀 Built with React + TypeScript • SQLite Storage • Local AI • Deployed on GitHub Pages</p>
          <p>📱 Mobile-optimized • PWA-ready • File System Support</p>
          <div className="version-info">
            <span className="version-badge">v{packageInfo.version}</span>
            <span className="build-time">{new Date().toISOString().split('T')[0]}</span>
          </div>
        </div>
      </div>

      <StorageSettings 
        isOpen={showStorageSettings}
        onClose={() => setShowStorageSettings(false)}
      />
    </div>
  );
};

export default Homepage;
