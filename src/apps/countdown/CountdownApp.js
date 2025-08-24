import React, { useState, useEffect } from 'react';
import './CountdownApp.css';

function CountdownApp() {
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  
  // Get query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const dateOfBirth = urlParams.get('dob') || '';
  const targetAge = urlParams.get('age') || '';

  const calculateCountdown = () => {
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
  };

  // Auto-calculate on load
  useEffect(() => {
    calculateCountdown();
  }, []);

  // Update countdown every second for real-time display
  useEffect(() => {
    if (dateOfBirth && targetAge) {
      const interval = setInterval(() => {
        calculateCountdown();
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [dateOfBirth, targetAge]);

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
      {error && (
        <div className="error-message">
          {error}
          <div className="url-example">
            <p>Example: ?dob=1990-01-15&age=30</p>
          </div>
        </div>
      )}

      {results && (
        <div className="countdown-container">
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
            <ProgressBar progress={results.progressPercentage} />
          </div>
        </div>
      )}
    </div>
  );
}

export default CountdownApp;