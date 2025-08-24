import React, { useState, useEffect, useCallback } from 'react';
import './CountdownApp.css';

function CountdownApp() {
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [showSetup, setShowSetup] = useState(false);
  const [formDob, setFormDob] = useState('');
  const [formAge, setFormAge] = useState('');
  
  // State for actual working values
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [targetAge, setTargetAge] = useState('');
  
  // Check if PWA
  const isPWA = window.location.search.includes('source=pwa') || window.matchMedia('(display-mode: standalone)').matches;
  
  // Initialize values on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    let urlDob = urlParams.get('dob') || '';
    let urlAge = urlParams.get('age') || '';
    
    if (urlDob && urlAge) {
      // URL parameters available
      setDateOfBirth(urlDob);
      setTargetAge(urlAge);
    } else if (isPWA) {
      // PWA mode - try localStorage
      const saved = localStorage.getItem('countdown-params');
      if (saved) {
        try {
          const params = JSON.parse(saved);
          if (params.dob && params.age) {
            setDateOfBirth(params.dob);
            setTargetAge(params.age);
          } else {
            setShowSetup(true);
          }
        } catch (error) {
          console.error('Error parsing saved params:', error);
          setShowSetup(true);
        }
      } else {
        setShowSetup(true);
      }
    }
  }, [isPWA]);

  const calculateCountdown = useCallback(() => {
    // Clear previous errors
    setError('');

    if (!targetAge || targetAge <= 0) {
      setError('⚠️ Missing target age. Add ?age=30 to the URL');
      setResults(null);
      return;
    }

    if (!dateOfBirth) {
      setError('⚠️ Missing date of birth. Add ?dob=1990-01-15 to the URL');
      setResults(null);
      return;
    }

    const now = new Date();
    const birth = new Date(dateOfBirth);
    
    if (isNaN(birth.getTime())) {
      setError('⚠️ Invalid date format. Use YYYY-MM-DD format in URL');
      setResults(null);
      return;
    }

    const target = new Date(birth);
    target.setFullYear(birth.getFullYear() + parseInt(targetAge));

    // Calculate current age
    const currentAge = (now - birth) / (365.25 * 24 * 60 * 60 * 1000);

    if (currentAge >= parseInt(targetAge)) {
      setError('🎉 You have already reached or passed the target age!');
      setResults(null);
      return;
    }

    // Calculate remaining time - total for each unit
    const timeLeft = target - now;
    const totalDaysLeft = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const totalHoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
    const totalMinutesLeft = Math.floor(timeLeft / (1000 * 60));
    const totalSecondsLeft = Math.floor(timeLeft / 1000);

    // Calculate progress
    const totalTime = target - birth;
    const timePassed = now - birth;
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

  // Save parameters for PWA users
  const saveParams = useCallback((dob, age) => {
    const params = { dob, age };
    localStorage.setItem('countdown-params', JSON.stringify(params));
    console.log('Saved countdown params:', params, 'isPWA:', isPWA);
  }, [isPWA]);

  // Handle setup form submission
  const handleSetupSubmit = (e) => {
    e.preventDefault();
    if (formDob && formAge) {
      // Save to localStorage
      saveParams(formDob, formAge);
      // Update state
      setDateOfBirth(formDob);
      setTargetAge(formAge);
      setShowSetup(false);
      // Clear form
      setFormDob('');
      setFormAge('');
    }
  };

  // Auto-calculate on load
  useEffect(() => {
    if (dateOfBirth && targetAge) {
      saveParams(dateOfBirth, targetAge);
      calculateCountdown();
    }
  }, [calculateCountdown, dateOfBirth, targetAge, saveParams]);

  // Update countdown every second for real-time display
  useEffect(() => {
    if (dateOfBirth && targetAge) {
      const interval = setInterval(() => {
        calculateCountdown();
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [dateOfBirth, targetAge, calculateCountdown]);

  const ProgressBar = ({ progress }) => (
    <div className="progress-container">
      <div className="progress-background">
        <div 
          className="progress-fill"
          style={{ width: `${Math.max(0, Math.min(progress, 100))}%` }}
        />
      </div>
      <div className="progress-text">{progress.toFixed(1)}%</div>
    </div>
  );

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
                Start Countdown ⏰
              </button>
            </form>
            {isPWA && (
              <p className="pwa-note">
                💾 Your settings will be saved for future app launches!
              </p>
            )}
          </div>
        </div>
      )}

      {!showSetup && error && (
        <div className="error-message">
          {error}
          <div className="url-example">
            <p>Example: ?dob=1990-01-15&age=30</p>
          </div>
          {isPWA && (
            <button 
              onClick={() => {
                setFormDob('');
                setFormAge('');
                setShowSetup(true);
              }} 
              className="setup-link"
            >
              Or click here to set up your countdown
            </button>
          )}
        </div>
      )}

      {!showSetup && results && (
        <div className="countdown-container">
          <div className="countdown-item progress-top">
            <ProgressBar progress={results.progressPercentage} />
            <div className="progress-info">
              From birth to age {results.targetAge} • Current: {results.currentAge} years
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
          
          {isPWA && (
            <div className="countdown-item">
              <button 
                onClick={() => {
                  setFormDob(dateOfBirth);
                  setFormAge(targetAge);
                  setShowSetup(true);
                }} 
                className="change-settings"
              >
                ⚙️ Change Settings
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CountdownApp;