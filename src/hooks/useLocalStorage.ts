import { useCallback, useState } from "react";

const LETTERS_KEY = "letters";

/**
 * Load and merge letters from localStorage with the default schema.
 */
function loadFromStorage(
  defaultValue: Record<string, boolean>,
): Record<string, boolean> {
  const data = window.localStorage.getItem(LETTERS_KEY);
  if (data) {
    const parsed: Record<string, boolean> = JSON.parse(data);
    // Merge saved data with default schema:
    // - Keep saved values for keys that exist in defaultValue
    // - Add new keys from defaultValue with their default values
    // - Drop keys that no longer exist in defaultValue
    const merged = Object.keys(defaultValue).reduce(
      (acc, key) => {
        acc[key] = key in parsed ? parsed[key] : defaultValue[key];
        return acc;
      },
      {} as Record<string, boolean>,
    );
    // Save merged data if it differs from what was stored
    if (JSON.stringify(merged) !== data) {
      window.localStorage.setItem(LETTERS_KEY, JSON.stringify(merged));
    }
    return merged;
  } else {
    window.localStorage.setItem(LETTERS_KEY, JSON.stringify(defaultValue));
    return defaultValue;
  }
}

/**
 * Hook for persisting letter settings to localStorage.
 * Merges saved data with the default schema to handle added/removed letters.
 */
export function useLocalStorage(defaultValue: Record<string, boolean>) {
  const [letters, setLetters] = useState<Record<string, boolean>>(() =>
    loadFromStorage(defaultValue),
  );

  const save = useCallback((data: Record<string, boolean>) => {
    const strData = JSON.stringify(data);
    window.localStorage.setItem(LETTERS_KEY, strData);
    setLetters(data);
  }, []);

  const hasBeenSaved = Object.keys(letters).length > 0;

  return { letters, save, hasBeenSaved };
}
