'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type AdminTheme = 'light' | 'dark' | 'system';

interface AdminThemeContextType {
  theme: AdminTheme;
  setTheme: (theme: AdminTheme) => void;
  resolvedTheme: 'light' | 'dark';
}

const AdminThemeContext = createContext<AdminThemeContextType | undefined>(undefined);

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<AdminTheme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const stored = localStorage.getItem('admin-theme') as AdminTheme;
    if (stored) {
      setTheme(stored);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('admin-theme', theme);
    
    const root = document.documentElement;
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      setResolvedTheme(systemTheme);
      root.classList.toggle('admin-dark', systemTheme === 'dark');
    } else {
      setResolvedTheme(theme);
      root.classList.toggle('admin-dark', theme === 'dark');
    }
  }, [theme]);

  return (
    <AdminThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  const context = useContext(AdminThemeContext);
  if (!context) {
    throw new Error('useAdminTheme must be used within AdminThemeProvider');
  }
  return context;
}