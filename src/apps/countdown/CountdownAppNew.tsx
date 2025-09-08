import React, { useState, useEffect, useCallback } from 'react';
import './CountdownApp.css';

interface CountdownResults {
  daysLeft: string;
  hoursLeft: string;
  minutesLeft: string;
  secondsLeft: string;
  progressPercentage: number;
  timeElapsed: string;
  totalDuration: string;
  productiveHoursLeft?: string;
  productiveMinutesLeft?: string;
  productiveSecondsLeft?: string;
}

interface CountdownInstance {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  endTime?: string; // HH:MM format for time precision
  showRealisticTime?: boolean;
  dailyUnavailableHours?: number;
  createdAt: string;
  updatedAt: string;
}

interface CountdownSettings {
  instances: CountdownInstance[];
  activeInstanceId: string | null;
}

interface ProgressBarProps {
  progress: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => (
  <div className="progress-container">
    <div className="progress-background">
      <div 
        className="progress-fill" 
        style={{ width: `${Math.min(progress, 100)}%` }}
      />
    </div>
    <div className="progress-text">
      {progress.toFixed(1)}% Complete
    </div>
  </div>
);

const CountdownApp: React.FC = () => {
  const [results, setResults] = useState<CountdownResults | null>(null);
  const [error, setError] = useState<string>('');
  const [showSetup, setShowSetup] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Multiple countdown instances
  const [instances, setInstances] = useState<CountdownInstance[]>([]);
  const [activeInstanceId, setActiveInstanceId] = useState<string | null>(null);
  const [currentInstance, setCurrentInstance] = useState<CountdownInstance | null>(null);
  
  // Form state for creating/editing countdowns
  const [formTitle, setFormTitle] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formStartDate, setFormStartDate] = useState<string>('');
  const [formEndDate, setFormEndDate] = useState<string>('');
  const [formEndTime, setFormEndTime] = useState<string>('23:59');
  const [formShowRealisticTime, setFormShowRealisticTime] = useState<boolean>(false);
  const [formDailyUnavailableHours, setFormDailyUnavailableHours] = useState<number>(15);
  const [editingInstanceId, setEditingInstanceId] = useState<string | null>(null);

  const STORAGE_KEY = 'productivity-countdown-instances';

  // Load saved instances on component mount
  useEffect(() => {
    const loadSavedInstances = (): void => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const settings: CountdownSettings = JSON.parse(saved);
          if (settings.instances && settings.instances.length > 0) {
            setInstances(settings.instances);
            const activeId = settings.activeInstanceId || settings.instances[0].id;
            setActiveInstanceId(activeId);
            const activeInstance = settings.instances.find(i => i.id === activeId);
            setCurrentInstance(activeInstance || null);
            setIsLoading(false);
            return;
          }
        }
      } catch (error) {
        console.error('Error loading saved instances:', error);
      }
      
      // No valid saved instances found - show setup
      setShowSetup(true);
      setIsLoading(false);
    };

    loadSavedInstances();
  }, []);

  // Calculate countdown for current instance
  const calculateCountdown = useCallback((): void => {
    if (!currentInstance) {
      setResults(null);
      return;
    }

    setError('');

    try {
      const now = new Date();
      const start = new Date(currentInstance.startDate);
      
      // Combine end date with end time
      let end = new Date(currentInstance.endDate);
      if (currentInstance.endTime) {
        const [hours, minutes] = currentInstance.endTime.split(':').map(Number);
        end.setHours(hours, minutes, 0, 0);
      }

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        setError('⚠️ Invalid date format. Please check your dates.');
        setResults(null);
        return;
      }

      if (start >= end) {
        setError('⚠️ Start date must be before end date.');
        setResults(null);
        return;
      }

      // Check if countdown has ended
      if (now >= end) {
        setError('🎉 This countdown has ended!');
        setResults(null);
        return;
      }

      const timeLeft = end.getTime() - now.getTime();
      const totalTime = end.getTime() - start.getTime();
      const timePassed = now.getTime() - start.getTime();

      // Calculate totals
      const totalDaysLeft = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
      const totalHoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
      const totalMinutesLeft = Math.floor(timeLeft / (1000 * 60));
      const totalSecondsLeft = Math.floor(timeLeft / 1000);

      // Calculate progress
      const progressPercentage = Math.max(0, (timePassed / totalTime) * 100);

      // Calculate elapsed and total duration
      const timeElapsedMs = Math.max(0, timePassed);
      const timeElapsedDays = Math.floor(timeElapsedMs / (1000 * 60 * 60 * 24));
      const totalDurationDays = Math.floor(totalTime / (1000 * 60 * 60 * 24));

      // Calculate productive/realistic time
      let productiveResults: Partial<CountdownResults> = {};
      if (currentInstance.showRealisticTime) {
        const availableHoursPerDay = 24 - (currentInstance.dailyUnavailableHours || 15);
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
        timeElapsed: `${timeElapsedDays} days`,
        totalDuration: `${totalDurationDays} days`,
        ...productiveResults
      });
    } catch (error) {
      console.error('Error calculating countdown:', error);
      setError('⚠️ Error calculating countdown. Please check your settings.');
      setResults(null);
    }
  }, [currentInstance]);

  // Save instances to localStorage
  const saveInstances = useCallback((newInstances: CountdownInstance[], activeId: string | null): void => {
    try {
      const settings: CountdownSettings = { 
        instances: newInstances, 
        activeInstanceId: activeId
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      console.log('Saved countdown instances:', settings);
    } catch (error) {
      console.error('Error saving instances:', error);
    }
  }, [STORAGE_KEY]);

  // Create new countdown instance
  const createInstance = (instanceData: Omit<CountdownInstance, 'id' | 'createdAt' | 'updatedAt'>): void => {
    const newInstance: CountdownInstance = {
      ...instanceData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newInstances = [...instances, newInstance];
    setInstances(newInstances);
    setActiveInstanceId(newInstance.id);
    setCurrentInstance(newInstance);
    saveInstances(newInstances, newInstance.id);
  };

  // Update existing instance
  const updateInstance = (instanceId: string, updates: Partial<CountdownInstance>): void => {
    const newInstances = instances.map(instance => 
      instance.id === instanceId 
        ? { ...instance, ...updates, updatedAt: new Date().toISOString() }
        : instance
    );
    
    setInstances(newInstances);
    if (activeInstanceId === instanceId) {
      const updatedInstance = newInstances.find(i => i.id === instanceId);
      setCurrentInstance(updatedInstance || null);
    }
    saveInstances(newInstances, activeInstanceId);
  };

  // Delete instance
  const deleteInstance = (instanceId: string): void => {
    const newInstances = instances.filter(instance => instance.id !== instanceId);
    setInstances(newInstances);
    
    if (activeInstanceId === instanceId) {
      const newActiveId = newInstances.length > 0 ? newInstances[0].id : null;
      setActiveInstanceId(newActiveId);
      setCurrentInstance(newInstances.length > 0 ? newInstances[0] : null);
      saveInstances(newInstances, newActiveId);
    } else {
      saveInstances(newInstances, activeInstanceId);
    }

    if (newInstances.length === 0) {
      setShowSetup(true);
    }
  };

  // Switch active instance
  const switchInstance = (instanceId: string): void => {
    const instance = instances.find(i => i.id === instanceId);
    if (instance) {
      setActiveInstanceId(instanceId);
      setCurrentInstance(instance);
      saveInstances(instances, instanceId);
    }
  };

  // Handle setup form submission
  const handleSetupSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (formTitle && formStartDate && formEndDate) {
      const instanceData = {
        title: formTitle,
        description: formDescription || undefined,
        startDate: formStartDate,
        endDate: formEndDate,
        endTime: formEndTime,
        showRealisticTime: formShowRealisticTime,
        dailyUnavailableHours: formDailyUnavailableHours
      };

      if (editingInstanceId) {
        updateInstance(editingInstanceId, instanceData);
        setEditingInstanceId(null);
      } else {
        createInstance(instanceData);
      }

      setShowSetup(false);
      resetForm();
    }
  };

  // Reset form
  const resetForm = (): void => {
    setFormTitle('');
    setFormDescription('');
    setFormStartDate('');
    setFormEndDate('');
    setFormEndTime('23:59');
    setFormShowRealisticTime(false);
    setFormDailyUnavailableHours(15);
    setEditingInstanceId(null);
  };

  // Handle edit instance
  const handleEditInstance = (instance: CountdownInstance): void => {
    setFormTitle(instance.title);
    setFormDescription(instance.description || '');
    setFormStartDate(instance.startDate);
    setFormEndDate(instance.endDate);
    setFormEndTime(instance.endTime || '23:59');
    setFormShowRealisticTime(instance.showRealisticTime || false);
    setFormDailyUnavailableHours(instance.dailyUnavailableHours || 15);
    setEditingInstanceId(instance.id);
    setShowSetup(true);
  };

  // Handle add new instance
  const handleAddInstance = (): void => {
    resetForm();
    setShowSetup(true);
  };

  // Update countdown every second
  useEffect(() => {
    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, [calculateCountdown]);

  // Loading state
  if (isLoading) {
    return (
      <div className="countdown-app">
        <div className="loading-message">
          <div className="loading-spinner">⏰</div>
          <p>Loading countdowns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="countdown-app">
      {/* Setup Form Modal */}
      {showSetup && (
        <div className="setup-overlay">
          <div className="setup-form">
            <h2>{editingInstanceId ? 'Edit Countdown' : 'Create New Countdown'}</h2>
            <p>Set up your countdown with start and end dates</p>
            
            <form onSubmit={handleSetupSubmit}>
              <div className="setup-field">
                <label htmlFor="title">Title *</label>
                <input
                  id="title"
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g., Project Deadline, Vacation, Birthday"
                  required
                />
              </div>

              <div className="setup-field">
                <label htmlFor="description">Description</label>
                <input
                  id="description"
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Optional description"
                />
              </div>

              <div className="setup-field">
                <label htmlFor="startDate">Start Date *</label>
                <input
                  id="startDate"
                  type="date"
                  value={formStartDate}
                  onChange={(e) => setFormStartDate(e.target.value)}
                  required
                />
              </div>

              <div className="setup-field">
                <label htmlFor="endDate">End Date *</label>
                <input
                  id="endDate"
                  type="date"
                  value={formEndDate}
                  onChange={(e) => setFormEndDate(e.target.value)}
                  required
                />
              </div>

              <div className="setup-field">
                <label htmlFor="endTime">End Time</label>
                <input
                  id="endTime"
                  type="time"
                  value={formEndTime}
                  onChange={(e) => setFormEndTime(e.target.value)}
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
                      <p className="available-time">✨ Available: <strong>{24 - formDailyUnavailableHours} hours/day</strong></p>
                    </div>
                  </div>
                )}
              </div>

              <button type="submit" className="setup-button">
                {editingInstanceId ? 'Update Countdown ⚙️' : 'Create Countdown ⏰'}
              </button>
              
              {instances.length > 0 && (
                <button 
                  type="button" 
                  className="setup-button secondary" 
                  onClick={() => setShowSetup(false)}
                >
                  Cancel
                </button>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Tabs for multiple instances */}
      {instances.length > 0 && (
        <div className="countdown-tabs">
          <div className="tabs-container">
            {instances.map((instance) => (
              <div
                key={instance.id}
                className={`countdown-tab ${activeInstanceId === instance.id ? 'active' : ''}`}
                onClick={() => switchInstance(instance.id)}
              >
                <div className="tab-content">
                  <div className="tab-title">{instance.title}</div>
                  {instance.description && (
                    <div className="tab-description">{instance.description}</div>
                  )}
                </div>
                <div className="tab-actions">
                  <button
                    className="tab-edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditInstance(instance);
                    }}
                    title="Edit countdown"
                  >
                    ✏️
                  </button>
                  {instances.length > 1 && (
                    <button
                      className="tab-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteInstance(instance.id);
                      }}
                      title="Delete countdown"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button className="add-tab" onClick={handleAddInstance} title="Add new countdown">
              ➕
            </button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {/* Main Countdown Display */}
      {!showSetup && results && currentInstance && (
        <div className="countdown-container">
          <div className="countdown-item progress-top">
            <ProgressBar progress={results.progressPercentage} />
            <div className="progress-info">
              <span className="current-age">Elapsed: {results.timeElapsed}</span>
              <span className="target-age">Total Duration: {results.totalDuration}</span>
            </div>
          </div>
          
          <div className="countdown-item days-highlight">
            <div className="countdown-content">
              <div className="main-metric">
                <div className="countdown-number">{results.daysLeft}</div>
                <div className="countdown-label">Days Left</div>
              </div>
            </div>
          </div>
          
          <div className="countdown-item">
            <div className="countdown-content">
              <div className="main-metric">
                <div className="countdown-number">{results.hoursLeft}</div>
                <div className="countdown-label">Total Hours</div>
              </div>
              {currentInstance.showRealisticTime && results.productiveHoursLeft && (
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
              {currentInstance.showRealisticTime && results.productiveMinutesLeft && (
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
              {currentInstance.showRealisticTime && results.productiveSecondsLeft && (
                <div className="secondary-metric">
                  <div className="realistic-number">{results.productiveSecondsLeft}</div>
                  <div className="realistic-label">Productive Seconds</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* No instances state */}
      {instances.length === 0 && !showSetup && (
        <div className="no-countdowns">
          <div className="no-countdowns-content">
            <div className="no-countdowns-icon">⏰</div>
            <h3>No Countdowns Yet</h3>
            <p>Create your first countdown to get started!</p>
            <button className="setup-link" onClick={handleAddInstance}>
              ➕ Create Countdown
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CountdownApp;

