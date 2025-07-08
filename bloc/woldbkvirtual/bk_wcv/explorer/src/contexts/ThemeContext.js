import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true); // Por defecto modo oscuro

  // Cargar tema desde localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('woldpbvirtual-theme');
    if (savedTheme) {
      setIsDark(savedTheme === 'dark');
    } else {
      // Detectar preferencia del sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(prefersDark);
    }
  }, []);

  // Guardar tema en localStorage
  useEffect(() => {
    localStorage.setItem('woldpbvirtual-theme', isDark ? 'dark' : 'light');
    
    // Aplicar tema al documento
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Función para cambiar tema
  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  // Función para establecer tema específico
  const setTheme = (theme) => {
    setIsDark(theme === 'dark');
  };

  const value = {
    isDark,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}; 