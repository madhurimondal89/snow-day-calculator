'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { LocationInfo } from '@/lib/weather/types/weather';

export type TemperatureUnit = 'c' | 'f';
export type ThemeMode = 'dark' | 'light';

interface WeatherPreferencesContextType {
  unit: TemperatureUnit;
  setUnit: (unit: TemperatureUnit) => void;
  toggleUnit: () => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  favorites: LocationInfo[];
  addFavorite: (location: LocationInfo) => void;
  removeFavorite: (slugOrName: string) => void;
  isFavorite: (slugOrName: string) => boolean;
  recentSearches: LocationInfo[];
  addRecentSearch: (location: LocationInfo) => void;
  clearRecentSearches: () => void;
}

const WeatherPreferencesContext = createContext<WeatherPreferencesContextType | undefined>(undefined);

const FAVORITES_STORAGE_KEY = 'weatherhub_favorites';
const RECENT_SEARCHES_STORAGE_KEY = 'weatherhub_recent_searches';
const UNIT_STORAGE_KEY = 'weatherhub_temp_unit';
const THEME_STORAGE_KEY = 'weatherhub_theme';

export const WeatherPreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unit, setUnitState] = useState<TemperatureUnit>('c');
  const [theme, setThemeState] = useState<ThemeMode>('dark');
  const [favorites, setFavorites] = useState<LocationInfo[]>([]);
  const [recentSearches, setRecentSearches] = useState<LocationInfo[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const savedUnit = localStorage.getItem(UNIT_STORAGE_KEY) as TemperatureUnit;
      if (savedUnit === 'c' || savedUnit === 'f') {
        setUnitState(savedUnit);
      }

      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode;
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setThemeState(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialTheme = prefersDark ? 'dark' : 'light';
        setThemeState(initialTheme);
        document.documentElement.setAttribute('data-theme', initialTheme);
      }

      const savedFavs = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (savedFavs) {
        setFavorites(JSON.parse(savedFavs));
      }

      const savedRecent = localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY);
      if (savedRecent) {
        setRecentSearches(JSON.parse(savedRecent));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const setUnit = (newUnit: TemperatureUnit) => {
    setUnitState(newUnit);
    try {
      localStorage.setItem(UNIT_STORAGE_KEY, newUnit);
    } catch {
      // Ignore
    }
  };

  const toggleUnit = () => {
    setUnit(unit === 'c' ? 'f' : 'c');
  };

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch {
      // Ignore
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const addFavorite = (loc: LocationInfo) => {
    setFavorites((prev) => {
      const exists = prev.some((f) => (f.slug && f.slug === loc.slug) || f.name.toLowerCase() === loc.name.toLowerCase());
      if (exists) return prev;
      const updated = [loc, ...prev].slice(0, 20);
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  };

  const removeFavorite = (slugOrName: string) => {
    setFavorites((prev) => {
      const updated = prev.filter(
        (f) => f.slug !== slugOrName && f.name.toLowerCase() !== slugOrName.toLowerCase()
      );
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  };

  const isFavorite = (slugOrName: string) => {
    return favorites.some(
      (f) => f.slug === slugOrName || f.name.toLowerCase() === slugOrName.toLowerCase()
    );
  };

  const addRecentSearch = (loc: LocationInfo) => {
    setRecentSearches((prev) => {
      const filtered = prev.filter(
        (item) => (item.slug && item.slug !== loc.slug) || item.name.toLowerCase() !== loc.name.toLowerCase()
      );
      const updated = [loc, ...filtered].slice(0, 10);
      try {
        localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  return (
    <WeatherPreferencesContext.Provider
      value={{
        unit,
        setUnit,
        toggleUnit,
        theme,
        setTheme,
        toggleTheme,
        favorites,
        addFavorite,
        removeFavorite,
        isFavorite,
        recentSearches,
        addRecentSearch,
        clearRecentSearches,
      }}
    >
      {children}
    </WeatherPreferencesContext.Provider>
  );
};

export const useWeatherPreferences = () => {
  const context = useContext(WeatherPreferencesContext);
  if (!context) {
    throw new Error('useWeatherPreferences must be used within a WeatherPreferencesProvider');
  }
  return context;
};
