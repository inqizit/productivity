import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeConfig, ThemeContextType } from './types';
import { defaultThemes } from './defaultThemes';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(defaultThemes[0]);
  const [customThemes, setCustomThemes] = useState<ThemeConfig[]>([]);

  // Load saved theme and custom themes on mount
  useEffect(() => {
    const savedThemeId = localStorage.getItem('productivity-app-theme');
    const savedCustomThemes = localStorage.getItem('productivity-app-custom-themes');
    
    let loadedCustomThemes: ThemeConfig[] = [];
    if (savedCustomThemes) {
      try {
        loadedCustomThemes = JSON.parse(savedCustomThemes);
        setCustomThemes(loadedCustomThemes);
      } catch (error) {
        console.error('Failed to parse custom themes:', error);
      }
    }

    if (savedThemeId) {
      const allThemes = [...defaultThemes, ...loadedCustomThemes];
      const theme = allThemes.find(t => t.id === savedThemeId);
      if (theme) {
        setCurrentTheme(theme);
      }
    }
  }, []); // Remove dependency to avoid infinite loop

  // Apply theme CSS variables when theme changes
  useEffect(() => {
    const root = document.documentElement;
    const colors = currentTheme.colors;

    // Set CSS custom properties
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-primary-dark', colors.primaryDark);
    root.style.setProperty('--color-secondary', colors.secondary);
    root.style.setProperty('--color-background', colors.background);
    root.style.setProperty('--color-background-secondary', colors.backgroundSecondary);
    root.style.setProperty('--color-surface', colors.surface);
    root.style.setProperty('--color-surface-secondary', colors.surfaceSecondary);
    root.style.setProperty('--color-text', colors.text);
    root.style.setProperty('--color-text-secondary', colors.textSecondary);
    root.style.setProperty('--color-text-muted', colors.textMuted);
    root.style.setProperty('--color-border', colors.border);
    root.style.setProperty('--color-border-light', colors.borderLight);
    root.style.setProperty('--color-success', colors.success);
    root.style.setProperty('--color-warning', colors.warning);
    root.style.setProperty('--color-error', colors.error);
    root.style.setProperty('--color-info', colors.info);

    // Apply background gradient directly to body and app containers
    const appElements = document.querySelectorAll('.homepage, .exercise-app, .schedule-app, .countdown-app, .todo-app, .pomodoro-app, .chat-app');
    appElements.forEach(element => {
      (element as HTMLElement).style.background = colors.background;
    });

    // Save current theme
    localStorage.setItem('productivity-app-theme', currentTheme.id);
  }, [currentTheme]);

  // Save custom themes when they change
  useEffect(() => {
    localStorage.setItem('productivity-app-custom-themes', JSON.stringify(customThemes));
  }, [customThemes]);

  const availableThemes = [...defaultThemes, ...customThemes];

  const switchTheme = (themeId: string) => {
    const theme = availableThemes.find(t => t.id === themeId);
    if (theme) {
      setCurrentTheme(theme);
    }
  };

  const createCustomTheme = (themeData: Omit<ThemeConfig, 'id' | 'createdAt'>): string => {
    const newTheme: ThemeConfig = {
      ...themeData,
      id: `custom-${Date.now()}`,
      isCustom: true,
      createdAt: new Date().toISOString()
    };
    setCustomThemes(prev => [...prev, newTheme]);
    return newTheme.id;
  };

  const deleteCustomTheme = (themeId: string) => {
    setCustomThemes(prev => prev.filter(t => t.id !== themeId));
    // If deleting current theme, switch to default
    if (currentTheme.id === themeId) {
      setCurrentTheme(defaultThemes[0]);
    }
  };

  const updateCustomTheme = (themeId: string, updates: Partial<ThemeConfig>) => {
    setCustomThemes(prev => prev.map(theme => 
      theme.id === themeId ? { ...theme, ...updates } : theme
    ));
    // If updating current theme, update current theme state
    if (currentTheme.id === themeId) {
      setCurrentTheme(prev => ({ ...prev, ...updates }));
    }
  };

  return (
    <ThemeContext.Provider value={{
      currentTheme,
      availableThemes,
      switchTheme,
      createCustomTheme,
      deleteCustomTheme,
      updateCustomTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
