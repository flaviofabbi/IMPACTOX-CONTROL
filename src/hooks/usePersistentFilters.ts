
import { useState, useEffect } from 'react';

export function usePersistentFilters<T>(key: string, initialValue: T) {
  // Get initial value from localStorage if available
  const [filters, setFilters] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading filters from localStorage:', error);
    }
    return initialValue;
  });

  // Save filters to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(filters));
    } catch (error) {
      console.error('Error saving filters to localStorage:', error);
    }
  }, [key, filters]);

  const updateFilter = (newFilters: Partial<T>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters(initialValue);
  };

  return [filters, updateFilter, resetFilters] as const;
}
