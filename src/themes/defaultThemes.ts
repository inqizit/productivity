import { ThemeConfig } from './types';

export const defaultThemes: ThemeConfig[] = [
  {
    id: 'default',
    name: '🌊 Ocean Blue',
    description: 'Clean blue theme with modern gradients',
    colors: {
      primary: '#667eea',
      primaryDark: '#764ba2',
      secondary: '#f093fb',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      backgroundSecondary: '#f7fafc',
      surface: '#ffffff',
      surfaceSecondary: '#f7fafc',
      text: '#2d3748',
      textSecondary: '#4a5568',
      textMuted: '#718096',
      border: '#e2e8f0',
      borderLight: '#f7fafc',
      success: '#48bb78',
      warning: '#ed8936',
      error: '#f56565',
      info: '#4299e1'
    }
  },
  {
    id: 'dark',
    name: '🌙 Dark Mode',
    description: 'Sleek dark theme for night work',
    colors: {
      primary: '#6366f1',
      primaryDark: '#4f46e5',
      secondary: '#ec4899',
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      backgroundSecondary: '#1e293b',
      surface: '#334155',
      surfaceSecondary: '#475569',
      text: '#f1f5f9',
      textSecondary: '#cbd5e1',
      textMuted: '#94a3b8',
      border: '#475569',
      borderLight: '#64748b',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    }
  },
  {
    id: 'forest',
    name: '🌲 Forest Green',
    description: 'Natural green theme for focus',
    colors: {
      primary: '#059669',
      primaryDark: '#047857',
      secondary: '#84cc16',
      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
      backgroundSecondary: '#f0fdf4',
      surface: '#ffffff',
      surfaceSecondary: '#f0fdf4',
      text: '#064e3b',
      textSecondary: '#065f46',
      textMuted: '#6b7280',
      border: '#d1fae5',
      borderLight: '#ecfdf5',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#06b6d4'
    }
  },
  {
    id: 'sunset',
    name: '🌅 Sunset Orange',
    description: 'Warm orange theme for creativity',
    colors: {
      primary: '#ea580c',
      primaryDark: '#c2410c',
      secondary: '#f97316',
      background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
      backgroundSecondary: '#fff7ed',
      surface: '#ffffff',
      surfaceSecondary: '#fff7ed',
      text: '#9a3412',
      textSecondary: '#c2410c',
      textMuted: '#6b7280',
      border: '#fed7aa',
      borderLight: '#ffedd5',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    }
  },
  {
    id: 'purple',
    name: '💜 Royal Purple',
    description: 'Elegant purple theme for sophistication',
    colors: {
      primary: '#8b5cf6',
      primaryDark: '#7c3aed',
      secondary: '#a855f7',
      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      backgroundSecondary: '#faf5ff',
      surface: '#ffffff',
      surfaceSecondary: '#faf5ff',
      text: '#581c87',
      textSecondary: '#6b21a8',
      textMuted: '#6b7280',
      border: '#e9d5ff',
      borderLight: '#f3e8ff',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    }
  },
  {
    id: 'minimal',
    name: '⚪ Minimal Gray',
    description: 'Clean monochromatic theme',
    colors: {
      primary: '#374151',
      primaryDark: '#1f2937',
      secondary: '#6b7280',
      background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
      backgroundSecondary: '#f9fafb',
      surface: '#ffffff',
      surfaceSecondary: '#f9fafb',
      text: '#111827',
      textSecondary: '#374151',
      textMuted: '#6b7280',
      border: '#e5e7eb',
      borderLight: '#f3f4f6',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    }
  }
];
