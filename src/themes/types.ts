// Theme System Types
export interface ColorPalette {
  primary: string;
  primaryDark: string;
  secondary: string;
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceSecondary: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderLight: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  colors: ColorPalette;
  isCustom?: boolean;
  createdAt?: string;
}

export interface ThemeContextType {
  currentTheme: ThemeConfig;
  availableThemes: ThemeConfig[];
  switchTheme: (themeId: string) => void;
  createCustomTheme: (theme: Omit<ThemeConfig, 'id' | 'createdAt'>) => string;
  deleteCustomTheme: (themeId: string) => void;
  updateCustomTheme: (themeId: string, updates: Partial<ThemeConfig>) => void;
}
