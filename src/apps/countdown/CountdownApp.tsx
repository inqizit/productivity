import React, { useState, useEffect, useCallback } from 'react';
import './CountdownApp.css';

interface CountdownResults {
  daysLeft: string;
  hoursLeft: string;
  minutesLeft: string;
  secondsLeft: string;
  progressPercentage: number;
  currentAge: string;
  targetAge: number;
  // Realistic/productive time
  productiveHoursLeft?: string;
  productiveMinutesLeft?: string;
  productiveSecondsLeft?: string;
}

interface CountdownSettings {
  dob: string;
  age: string;
  showRealisticTime?: boolean;
  dailyUnavailableHours?: number;
}

interface ProgressBarProps {
  progress: number;
}

const CountdownApp: React.FC = () => {
  const [results, setResults] = useState<CountdownResults | null>(null);
  const [error, setError] = useState<string>('');
  const [showSetup, setShowSetup] = useState<boolean>(false);
  const [formDob, setFormDob] = useState<string>('');
  const [formAge, setFormAge] = useState<string>('');
  const [formShowRealisticTime, setFormShowRealisticTime] = useState<boolean>(false);
  const [formDailyUnavailableHours, setFormDailyUnavailableHours] = useState<number>(15);
  const [dateOfBirth, setDateOfBirth] = useState<string>('');
  const [targetAge, setTargetAge] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Realistic time settings
  const [showRealisticTime, setShowRealisticTime] = useState<boolean>(false);
  const [dailyUnavailableHours, setDailyUnavailableHours] = useState<number>(15); // Default 15 hours

  // Storage key
  const STORAGE_KEY = 'countdown-settings';

  // Load saved settings on component mount
  useEffect(() => {
    const loadSavedSettings = (): void => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const settings: CountdownSettings = JSON.parse(saved);
          if (settings.dob && settings.age) {
            setDateOfBirth(settings.dob);
            setTargetAge(settings.age);
            // Load realistic time settings
            if (settings.showRealisticTime !== undefined) {
              setShowRealisticTime(settings.showRealisticTime);
            }
            if (settings.dailyUnavailableHours !== undefined) {
              setDailyUnavailableHours(settings.dailyUnavailableHours);
            }
            setIsLoading(false);
            return;
          }
        }
      } catch (error) {
        console.error('Error loading saved settings:', error);
      }
      
      // No valid saved settings found - show setup
      setShowSetup(true);
      setIsLoading(false);
    };

    loadSavedSettings();
  }, []);

  const calculateCountdown = useCallback((): void => {
    // Clear previous errors
    setError('');

    if (!targetAge || parseInt(targetAge) <= 0) {
      setError('⚠️ Invalid target age. Please update your settings.');
      setResults(null);
      return;
    }

    if (!dateOfBirth) {
      setError('⚠️ Missing date of birth. Please set up your countdown.');
      setResults(null);
      return;
    }

    const now = new Date();
    const birth = new Date(dateOfBirth);
    
    if (isNaN(birth.getTime())) {
      setError('⚠️ Invalid date format. Please update your settings.');
      setResults(null);
      return;
    }

    const target = new Date(birth);
    target.setFullYear(birth.getFullYear() + parseInt(targetAge));

    // Calculate current age
    const currentAge = (now.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    
    if (currentAge >= parseInt(targetAge)) {
      setError('🎉 You have already reached or passed the target age!');
      setResults(null);
      return;
    }

    const timeLeft = target.getTime() - now.getTime();
    
    // Calculate totals
    const totalDaysLeft = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const totalHoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
    const totalMinutesLeft = Math.floor(timeLeft / (1000 * 60));
    const totalSecondsLeft = Math.floor(timeLeft / 1000);

    // Calculate progress
    const totalTime = target.getTime() - birth.getTime();
    const timePassed = now.getTime() - birth.getTime();
    const progressPercentage = (timePassed / totalTime) * 100;

    // Calculate productive/realistic time
    let productiveResults: Partial<CountdownResults> = {};
    if (showRealisticTime) {
      const availableHoursPerDay = 24 - dailyUnavailableHours;
      const productiveTotalHours = totalDaysLeft * availableHoursPerDay;
      const productiveTotalMinutes = productiveTotalHours * 60;
      const productiveTotalSeconds = productiveTotalMinutes * 60;

      productiveResults = {
        productiveHoursLeft: Math.floor(productiveTotalHours).toLocaleString(),
        productiveMinutesLeft: Math.floor(productiveTotalMinutes).toLocaleString(),
        productiveSecondsLeft: Math.floor(productiveTotalSeconds).toLocaleString(),
      };
    }

    setResults({
      daysLeft: totalDaysLeft.toLocaleString(),
      hoursLeft: totalHoursLeft.toLocaleString(),
      minutesLeft: totalMinutesLeft.toLocaleString(),
      secondsLeft: totalSecondsLeft.toLocaleString(),
      progressPercentage: Math.min(progressPercentage, 100),
      currentAge: currentAge.toFixed(1),
      targetAge: parseInt(targetAge),
      ...productiveResults
    });
  }, [dateOfBirth, targetAge, showRealisticTime, dailyUnavailableHours]);

  // Save settings to localStorage
  const saveSettings = useCallback((dob: string, age: string): void => {
    try {
      const settings: CountdownSettings = { 
        dob, 
        age,
        showRealisticTime,
        dailyUnavailableHours
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      console.log('Saved countdown settings:', settings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }, [STORAGE_KEY, showRealisticTime, dailyUnavailableHours]);

  // Handle setup form submission
  const handleSetupSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (formDob && formAge) {
      // Update state
      setDateOfBirth(formDob);
      setTargetAge(formAge);
      setShowRealisticTime(formShowRealisticTime);
      setDailyUnavailableHours(formDailyUnavailableHours);
      setShowSetup(false);
      // Clear form
      setFormDob('');
      setFormAge('');
      setFormShowRealisticTime(false);
      setFormDailyUnavailableHours(15);
    }
  };

  // Handle changing settings
  const handleChangeSettings = (): void => {
    setFormDob(dateOfBirth);
    setFormAge(targetAge);
    setFormShowRealisticTime(showRealisticTime);
    setFormDailyUnavailableHours(dailyUnavailableHours);
    setShowSetup(true);
  };

  // Auto-save settings when they change
  useEffect(() => {
    if (dateOfBirth && targetAge) {
      saveSettings(dateOfBirth, targetAge);
    }
  }, [dateOfBirth, targetAge, showRealisticTime, dailyUnavailableHours, saveSettings]);

  // Auto-calculate when settings are loaded
  useEffect(() => {
    if (dateOfBirth && targetAge && !isLoading) {
      calculateCountdown();
    }
  }, [calculateCountdown, dateOfBirth, targetAge, isLoading]);

  // Update countdown every second for real-time display
  useEffect(() => {
    if (dateOfBirth && targetAge && results) {
      const interval = setInterval(() => {
        calculateCountdown();
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [dateOfBirth, targetAge, results, calculateCountdown]);

  const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => (
    <div className="progress-container">
      <div className="progress-background">
        <div 
          className="progress-fill" 
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="progress-text">{progress.toFixed(1)}%</div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="countdown-app">
        <div className="loading-message">
          <div className="loading-spinner">⏳</div>
          <p>Loading your countdown...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="countdown-app">
      {showSetup && (
        <div className="setup-overlay">
          <div className="setup-form">
            <h2>🎯 Setup Your Countdown</h2>
            <p>Set your date of birth and target age to get started!</p>
            <form onSubmit={handleSetupSubmit}>
              <div className="setup-field">
                <label>📅 Date of Birth</label>
                <input
                  type="date"
                  value={formDob}
                  onChange={(e) => setFormDob(e.target.value)}
                  required
                />
              </div>
              <div className="setup-field">
                <label>🎯 Target Age</label>
                <input
                  type="number"
                  value={formAge}
                  onChange={(e) => setFormAge(e.target.value)}
                  placeholder="e.g., 80"
                  min="1"
                  max="150"
                  required
                />
              </div>

              <div className="setup-field realistic-time-section">
                <div className="realistic-time-header">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formShowRealisticTime}
                      onChange={(e) => setFormShowRealisticTime(e.target.checked)}
                    />
                    <span className="checkbox-text">⏱️ Show Realistic Time</span>
                  </label>
                  <span className="feature-description">Shows productive hours after subtracting sleep, chores, etc.</span>
                </div>
                
                {formShowRealisticTime && (
                  <div className="realistic-time-config">
                    <label>Daily Unavailable Hours</label>
                    <div className="hours-input-group">
                      <input
                        type="number"
                        value={formDailyUnavailableHours}
                        onChange={(e) => setFormDailyUnavailableHours(Number(e.target.value))}
                        min="8"
                        max="20"
                        step="0.5"
                      />
                      <span className="hours-unit">hours/day</span>
                    </div>
                    <div className="time-breakdown">
                      <p>🛏️ Sleep: ~8h • 🍽️ Eating: ~2h • 🚿 Hygiene: ~1h</p>
                      <p>🚗 Commute: ~1.5h • 🧹 Chores: ~1.5h • 🚽 Basic: ~1h</p>
                      <p className="available-time">
                        ✨ Available: <strong>{24 - formDailyUnavailableHours} hours/day</strong>
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <button type="submit" className="setup-button">
                {dateOfBirth && targetAge ? 'Update Settings ⚙️' : 'Start Countdown ⏰'}
              </button>
            </form>
            <p className="storage-note">
              💾 Your settings will be saved locally and remembered!
            </p>
          </div>
        </div>
      )}

      {!showSetup && error && (
        <div className="error-message">
          {error}
          <button 
            onClick={() => {
              setFormDob('');
              setFormAge('');
              setShowSetup(true);
            }} 
            className="setup-link"
          >
            Click here to set up your countdown
          </button>
        </div>
      )}

      {!showSetup && results && (
        <div className="countdown-container">
          <div className="countdown-item progress-top">
            <ProgressBar progress={results.progressPercentage} />
            <div className="progress-info">
              <span className="current-age">Current Age: {results.currentAge}</span>
              <span className="target-age">Target: {results.targetAge}</span>
            </div>
          </div>
          
          <div className="countdown-item days-highlight">
            <div className="countdown-content">
              <div className="main-metric">
                <div className="countdown-number">{results.daysLeft}</div>
                <div className="countdown-label">Total Days</div>
              </div>
            </div>
          </div>
          
          <div className="countdown-item">
            <div className="countdown-content">
              <div className="main-metric">
                <div className="countdown-number">{results.hoursLeft}</div>
                <div className="countdown-label">Total Hours</div>
              </div>
              {showRealisticTime && results.productiveHoursLeft && (
                <div className="secondary-metric">
                  <div className="realistic-number">{results.productiveHoursLeft}</div>
                  <div className="realistic-label">Productive Hours</div>
                </div>
              )}
            </div>
          </div>
          
          <div className="countdown-item">
            <div className="countdown-content">
              <div className="main-metric">
                <div className="countdown-number">{results.minutesLeft}</div>
                <div className="countdown-label">Total Minutes</div>
              </div>
              {showRealisticTime && results.productiveMinutesLeft && (
                <div className="secondary-metric">
                  <div className="realistic-number">{results.productiveMinutesLeft}</div>
                  <div className="realistic-label">Productive Minutes</div>
                </div>
              )}
            </div>
          </div>
          
          <div className="countdown-item">
            <div className="countdown-content">
              <div className="main-metric">
                <div className="countdown-number">{results.secondsLeft}</div>
                <div className="countdown-label">Total Seconds</div>
              </div>
              {showRealisticTime && results.productiveSecondsLeft && (
                <div className="secondary-metric">
                  <div className="realistic-number">{results.productiveSecondsLeft}</div>
                  <div className="realistic-label">Productive Seconds</div>
                </div>
              )}
            </div>
          </div>
          
          <div className="countdown-item settings-card">
            <div className="countdown-content settings-content">
              <div className="settings-actions">
                <button 
                  onClick={handleChangeSettings}
                  className="change-settings"
                >
                  ⚙️ Change Settings
                </button>
              </div>
              <div className="settings-info">
                <p>📅 {new Date(dateOfBirth).toLocaleDateString()}</p>
                <p>🎯 Target: {targetAge} years old</p>
                {showRealisticTime && (
                  <p>⏱️ Realistic Time: {24 - dailyUnavailableHours}h available/day</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CountdownApp;
