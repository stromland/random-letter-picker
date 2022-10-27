import { useCallback, useEffect, useState } from "react";
import { letterSettings } from "../letters";

export function useLocalStorage() {
  const init = letterSettings;
  const LETTERS_KEY = "letters";
  const [letters, setLetters] = useState<Record<string, boolean>>({});

  const save = useCallback((data: Record<string, boolean>) => {
    const strData = JSON.stringify(data);
    window.localStorage.setItem(LETTERS_KEY, strData);
    setLetters(data);
  }, []);

  useEffect(() => {
    const data = window.localStorage.getItem(LETTERS_KEY);
    if (data) {
      const parsed: Record<string, boolean> = JSON.parse(data);
      setLetters(parsed);
    } else {
      save(init);
      setLetters(init);
    }
  }, [init, save]);

  const hasBeenSaved = Object.keys(letters).length > 0;

  return { letters, save, hasBeenSaved };
}
