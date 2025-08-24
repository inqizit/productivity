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
}

interface CountdownSettings {
  dob: string;
  age: string;
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
  const [dateOfBirth, setDateOfBirth] = useState<string>('');
  const [targetAge, setTargetAge] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

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

    setResults({
      daysLeft: totalDaysLeft.toLocaleString(),
      hoursLeft: totalHoursLeft.toLocaleString(),
      minutesLeft: totalMinutesLeft.toLocaleString(),
      secondsLeft: totalSecondsLeft.toLocaleString(),
      progressPercentage: Math.min(progressPercentage, 100),
      currentAge: currentAge.toFixed(1),
      targetAge: parseInt(targetAge)
    });
  }, [dateOfBirth, targetAge]);

  // Save settings to localStorage
  const saveSettings = useCallback((dob: string, age: string): void => {
    try {
      const settings: CountdownSettings = { dob, age };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      console.log('Saved countdown settings:', settings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }, [STORAGE_KEY]);

  // Handle setup form submission
  const handleSetupSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (formDob && formAge) {
      // Save to localStorage
      saveSettings(formDob, formAge);
      // Update state
      setDateOfBirth(formDob);
      setTargetAge(formAge);
      setShowSetup(false);
      // Clear form
      setFormDob('');
      setFormAge('');
    }
  };

  // Handle changing settings
  const handleChangeSettings = (): void => {
    setFormDob(dateOfBirth);
    setFormAge(targetAge);
    setShowSetup(true);
  };

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
          
          <div className="countdown-item">
            <div className="countdown-number">{results.daysLeft}</div>
            <div className="countdown-label">Total Days</div>
          </div>
          
          <div className="countdown-item">
            <div className="countdown-number">{results.hoursLeft}</div>
            <div className="countdown-label">Total Hours</div>
          </div>
          
          <div className="countdown-item">
            <div className="countdown-number">{results.minutesLeft}</div>
            <div className="countdown-label">Total Minutes</div>
          </div>
          
          <div className="countdown-item">
            <div className="countdown-number">{results.secondsLeft}</div>
            <div className="countdown-label">Total Seconds</div>
          </div>
          
          <div className="countdown-item">
            <button 
              onClick={handleChangeSettings}
              className="change-settings"
            >
              ⚙️ Change Settings
            </button>
            <div className="settings-info">
              <p>📅 {new Date(dateOfBirth).toLocaleDateString()}</p>
              <p>🎯 Target: {targetAge} years old</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CountdownApp;
