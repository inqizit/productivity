import React from 'react';
import { Link } from 'react-router-dom';
import './Homepage.css';

function Homepage() {
  return (
    <div className="homepage">
      <div className="container">
        <h1 className="homepage-title">🎯 Productivity Suite</h1>
        <p className="homepage-subtitle">Collection of useful productivity apps</p>

        <div className="apps-grid">
          <Link to="/countdown?dob=1990-01-15&age=30" className="app-card">
            <div className="app-icon">⏰</div>
            <h3 className="app-title">Age Countdown</h3>
            <p className="app-description">Track your progress to any target age with days, hours, and visual progress</p>
            <div className="app-badge">Available</div>
          </Link>

          <div className="app-card coming-soon">
            <div className="app-icon">📝</div>
            <h3 className="app-title">Todo Manager</h3>
            <p className="app-description">Simple and effective task management with priorities and deadlines</p>
            <div className="app-badge">Coming Soon</div>
          </div>

          <div className="app-card coming-soon">
            <div className="app-icon">📊</div>
            <h3 className="app-title">Habit Tracker</h3>
            <p className="app-description">Build and maintain good habits with visual tracking and streaks</p>
            <div className="app-badge">Coming Soon</div>
          </div>

          <div className="app-card coming-soon">
            <div className="app-icon">⏱️</div>
            <h3 className="app-title">Pomodoro Timer</h3>
            <p className="app-description">Focus and productivity timer with break reminders</p>
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
          <p>🚀 Built with React • Deployed on GitHub Pages</p>
          <p>📱 Mobile-optimized • PWA-ready</p>
        </div>
      </div>
    </div>
  );
}

export default Homepage;
