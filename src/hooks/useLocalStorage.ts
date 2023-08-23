import { letterSettings } from "../letters";

const LETTERS_KEY = "letters";

export function saveLetters(data: Record<string, boolean>): void {
  const strData = JSON.stringify(data);
  window.localStorage.setItem(LETTERS_KEY, strData);
}

export function getLetters(): Record<string, boolean> {
  const data = window.localStorage.getItem(LETTERS_KEY);
  if (!data) {
      saveLetters(letterSettings);
    return letterSettings;
  }
  return JSON.parse(data)
}

export function disableLetter(letter: string): void {
  const data = getLetters();
  data[letter] = false;
  saveLetters(data);
}
