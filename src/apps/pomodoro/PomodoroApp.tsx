import React, { useState, useEffect, useCallback, useRef } from 'react';
import './PomodoroApp.css';

interface PomodoroSettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;
  soundEnabled: boolean;
  autoStartBreaks: boolean;
  autoStartWork: boolean;
}

interface PomodoroSession {
  id: number;
  type: 'work' | 'shortBreak' | 'longBreak';
  duration: number;
  completedAt: string;
}

type TimerState = 'idle' | 'running' | 'paused' | 'completed';
type SessionType = 'work' | 'shortBreak' | 'longBreak';

const DEFAULT_SETTINGS: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsUntilLongBreak: 4,
  soundEnabled: true,
  autoStartBreaks: false,
  autoStartWork: false,
};

const PomodoroApp: React.FC = () => {
  const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT_SETTINGS);
  const [currentSessionType, setCurrentSessionType] = useState<SessionType>('work');
  const [timeLeft, setTimeLeft] = useState<number>(DEFAULT_SETTINGS.workDuration * 60);
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [sessionCount, setSessionCount] = useState<number>(0);

  // Refs for timer and audio
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Storage keys
  const SETTINGS_KEY = 'pomodoro-settings';
  const SESSIONS_KEY = 'pomodoro-sessions';

  // Load settings and sessions from localStorage
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(SETTINGS_KEY);
      if (savedSettings) {
        const parsedSettings: PomodoroSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
        setTimeLeft(parsedSettings.workDuration * 60);
      }

      const savedSessions = localStorage.getItem(SESSIONS_KEY);
      if (savedSessions) {
        const parsedSessions: PomodoroSession[] = JSON.parse(savedSessions);
        setSessions(parsedSessions);
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = useCallback((newSettings: PomodoroSettings): void => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }, []);

  // Save sessions to localStorage
  const saveSessions = useCallback((newSessions: PomodoroSession[]): void => {
    try {
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(newSessions));
    } catch (error) {
      console.error('Error saving sessions:', error);
    }
  }, []);

  // Play notification sound using Web Audio API
  const playNotificationSound = useCallback((): void => {
    if (!settings.soundEnabled) return;

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const audioContext = audioContextRef.current;
      
      // Create a simple beep sound
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }, [settings.soundEnabled]);

  // Get duration for session types (defined before tick to avoid hoisting issues)
  const getSessionDuration = useCallback((sessionType: SessionType): number => {
    switch (sessionType) {
      case 'work':
        return settings.workDuration;
      case 'shortBreak':
        return settings.shortBreakDuration;
      case 'longBreak':
        return settings.longBreakDuration;
      default:
        return settings.workDuration;
    }
  }, [settings]);

  const getCurrentSessionDuration = useCallback((): number => {
    return getSessionDuration(currentSessionType);
  }, [currentSessionType, getSessionDuration]);

  // Timer tick function
  const tick = useCallback((): void => {
    setTimeLeft(prevTime => {
      if (prevTime <= 1) {
        // Timer completed
        setTimerState('completed');
        playNotificationSound();
        
        // Add completed session to history
        const completedSession: PomodoroSession = {
          id: Date.now(),
          type: currentSessionType,
          duration: getCurrentSessionDuration(),
          completedAt: new Date().toISOString()
        };

        setSessions(prevSessions => {
          const newSessions = [completedSession, ...prevSessions];
          saveSessions(newSessions);
          return newSessions;
        });

        // Determine next session type
        let nextSessionType: SessionType;
        if (currentSessionType === 'work') {
          const newSessionCount = sessionCount + 1;
          setSessionCount(newSessionCount);
          
          if (newSessionCount % settings.sessionsUntilLongBreak === 0) {
            nextSessionType = 'longBreak';
          } else {
            nextSessionType = 'shortBreak';
          }
        } else {
          nextSessionType = 'work';
        }

        // Auto-start next session if enabled
        const shouldAutoStart = 
          (nextSessionType !== 'work' && settings.autoStartBreaks) ||
          (nextSessionType === 'work' && settings.autoStartWork);

        setTimeout(() => {
          setCurrentSessionType(nextSessionType);
          setTimeLeft(getSessionDuration(nextSessionType) * 60);
          setTimerState(shouldAutoStart ? 'running' : 'idle');
        }, 1000);

        return 0;
      }
      return prevTime - 1;
    });
  }, [currentSessionType, sessionCount, settings, playNotificationSound, saveSessions, getCurrentSessionDuration, getSessionDuration]);

  // Start/stop timer
  useEffect(() => {
    if (timerState === 'running') {
      intervalRef.current = setInterval(tick, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerState, tick]);



  // Timer controls
  const startTimer = (): void => {
    setTimerState('running');
  };

  const pauseTimer = (): void => {
    setTimerState('paused');
  };

  const resetTimer = (): void => {
    setTimerState('idle');
    setTimeLeft(getCurrentSessionDuration() * 60);
  };

  const skipSession = (): void => {
    setTimerState('idle');
    
    let nextSessionType: SessionType;
    if (currentSessionType === 'work') {
      const newSessionCount = sessionCount + 1;
      setSessionCount(newSessionCount);
      
      if (newSessionCount % settings.sessionsUntilLongBreak === 0) {
        nextSessionType = 'longBreak';
      } else {
        nextSessionType = 'shortBreak';
      }
    } else {
      nextSessionType = 'work';
    }

    setCurrentSessionType(nextSessionType);
    setTimeLeft(getSessionDuration(nextSessionType) * 60);
  };

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const getProgress = (): number => {
    const totalDuration = getCurrentSessionDuration() * 60;
    return ((totalDuration - timeLeft) / totalDuration) * 100;
  };

  // Settings handlers
  const updateSettings = (newSettings: PomodoroSettings): void => {
    setSettings(newSettings);
    saveSettings(newSettings);
    
    // Reset timer if idle
    if (timerState === 'idle') {
      setTimeLeft(getSessionDuration(currentSessionType) * 60);
    }
  };

  const clearAllSessions = (): void => {
    setSessions([]);
    saveSessions([]);
    setSessionCount(0);
  };

  // Get session type info
  const getSessionInfo = () => {
    switch (currentSessionType) {
      case 'work':
        return { emoji: '💼', label: 'Work Session', color: '#e74c3c' };
      case 'shortBreak':
        return { emoji: '☕', label: 'Short Break', color: '#2ecc71' };
      case 'longBreak':
        return { emoji: '🏖️', label: 'Long Break', color: '#3498db' };
      default:
        return { emoji: '💼', label: 'Work Session', color: '#e74c3c' };
    }
  };

  const sessionInfo = getSessionInfo();

  return (
    <div className="pomodoro-app">
      <div className="pomodoro-container">
        <div className="pomodoro-header">
          <h1>⏱️ Pomodoro Timer</h1>
          <p>Stay focused with the Pomodoro Technique</p>
        </div>

        <div className="timer-section">
          <div className="session-type" style={{ borderColor: sessionInfo.color }}>
            <span className="session-emoji">{sessionInfo.emoji}</span>
            <span className="session-label">{sessionInfo.label}</span>
          </div>

          <div className="timer-display">
            <div 
              className="timer-circle" 
              style={{ 
                background: `conic-gradient(${sessionInfo.color} ${getProgress()}%, #f0f0f0 ${getProgress()}%)` 
              }}
            >
              <div className="timer-inner">
                <div className="time-display">{formatTime(timeLeft)}</div>
                <div className="time-label">
                  {timerState === 'running' ? 'Running' : 
                   timerState === 'paused' ? 'Paused' : 
                   timerState === 'completed' ? 'Completed!' : 'Ready'}
                </div>
              </div>
            </div>
          </div>

          <div className="timer-controls">
            {timerState === 'idle' || timerState === 'completed' ? (
              <button className="control-button start" onClick={startTimer}>
                ▶️ Start
              </button>
            ) : timerState === 'running' ? (
              <button className="control-button pause" onClick={pauseTimer}>
                ⏸️ Pause
              </button>
            ) : (
              <button className="control-button resume" onClick={startTimer}>
                ▶️ Resume
              </button>
            )}
            
            <button className="control-button reset" onClick={resetTimer}>
              🔄 Reset
            </button>
            
            <button className="control-button skip" onClick={skipSession}>
              ⏭️ Skip
            </button>
          </div>
        </div>

        <div className="stats-section">
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">{sessionCount}</span>
              <span className="stat-label">Work Sessions</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{sessions.length}</span>
              <span className="stat-label">Total Completed</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {Math.floor(sessions.reduce((total, session) => total + session.duration, 0) / 60)}
              </span>
              <span className="stat-label">Minutes Focused</span>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <button 
            className="action-button settings" 
            onClick={() => setShowSettings(true)}
          >
            ⚙️ Settings
          </button>
          
          {sessions.length > 0 && (
            <button 
              className="action-button clear" 
              onClick={clearAllSessions}
            >
              🧹 Clear History
            </button>
          )}
        </div>

        {sessions.length > 0 && (
          <div className="recent-sessions">
            <h3>Recent Sessions</h3>
            <div className="sessions-list">
              {sessions.slice(0, 5).map(session => (
                <div key={session.id} className="session-item">
                  <span className="session-type-indicator">
                    {session.type === 'work' ? '💼' : 
                     session.type === 'shortBreak' ? '☕' : '🏖️'}
                  </span>
                  <span className="session-duration">{session.duration}m</span>
                  <span className="session-time">
                    {new Date(session.completedAt).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showSettings && (
        <SettingsModal 
          settings={settings}
          onSave={updateSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
};

// Settings Modal Component
interface SettingsModalProps {
  settings: PomodoroSettings;
  onSave: (settings: PomodoroSettings) => void;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onSave, onClose }) => {
  const [localSettings, setLocalSettings] = useState<PomodoroSettings>(settings);

  const handleSave = (): void => {
    onSave(localSettings);
    onClose();
  };

  const updateSetting = <K extends keyof PomodoroSettings>(
    key: K,
    value: PomodoroSettings[K]
  ): void => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="settings-overlay">
      <div className="settings-modal">
        <div className="settings-header">
          <h2>⚙️ Pomodoro Settings</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="settings-content">
          <div className="setting-group">
            <label>Work Duration (minutes)</label>
            <input
              type="number"
              min="1"
              max="60"
              value={localSettings.workDuration}
              onChange={(e) => updateSetting('workDuration', parseInt(e.target.value) || 25)}
            />
          </div>

          <div className="setting-group">
            <label>Short Break Duration (minutes)</label>
            <input
              type="number"
              min="1"
              max="30"
              value={localSettings.shortBreakDuration}
              onChange={(e) => updateSetting('shortBreakDuration', parseInt(e.target.value) || 5)}
            />
          </div>

          <div className="setting-group">
            <label>Long Break Duration (minutes)</label>
            <input
              type="number"
              min="1"
              max="60"
              value={localSettings.longBreakDuration}
              onChange={(e) => updateSetting('longBreakDuration', parseInt(e.target.value) || 15)}
            />
          </div>

          <div className="setting-group">
            <label>Work Sessions Until Long Break</label>
            <input
              type="number"
              min="2"
              max="10"
              value={localSettings.sessionsUntilLongBreak}
              onChange={(e) => updateSetting('sessionsUntilLongBreak', parseInt(e.target.value) || 4)}
            />
          </div>

          <div className="setting-group checkbox">
            <label>
              <input
                type="checkbox"
                checked={localSettings.soundEnabled}
                onChange={(e) => updateSetting('soundEnabled', e.target.checked)}
              />
              Enable Sound Notifications
            </label>
          </div>

          <div className="setting-group checkbox">
            <label>
              <input
                type="checkbox"
                checked={localSettings.autoStartBreaks}
                onChange={(e) => updateSetting('autoStartBreaks', e.target.checked)}
              />
              Auto-start Break Sessions
            </label>
          </div>

          <div className="setting-group checkbox">
            <label>
              <input
                type="checkbox"
                checked={localSettings.autoStartWork}
                onChange={(e) => updateSetting('autoStartWork', e.target.checked)}
              />
              Auto-start Work Sessions
            </label>
          </div>
        </div>

        <div className="settings-actions">
          <button className="settings-button cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="settings-button save" onClick={handleSave}>
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default PomodoroApp;
