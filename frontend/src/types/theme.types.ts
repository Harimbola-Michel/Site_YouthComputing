export type Theme = 'light' | 'dark' | 'system';

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
  toggleTheme: () => void;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  border: string;
  input: string;
  ring: string;
}

export interface ThemeConfig {
  name: string;
  colors: ThemeColors;
  fonts: {
    primary: string;
    secondary: string;
    accent: string;
  };
}