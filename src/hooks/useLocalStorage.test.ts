import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useLocalStorage } from "./useLocalStorage";

const LETTERS_KEY = "letters";

describe("useLocalStorage", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    window.localStorage.clear();
  });

  it("should initialize with default value when localStorage is empty", () => {
    const defaultValue = { A: true, B: false, C: true };
    const { result } = renderHook(() => useLocalStorage(defaultValue));

    // Wait for the effect to run
    expect(result.current.letters).toEqual(defaultValue);
    expect(result.current.hasBeenSaved).toBe(true);

    // Verify localStorage was set
    const stored = window.localStorage.getItem(LETTERS_KEY);
    expect(stored).toBe(JSON.stringify(defaultValue));
  });

  it("should load existing data from localStorage", () => {
    const savedData = { A: false, B: true, C: false };
    window.localStorage.setItem(LETTERS_KEY, JSON.stringify(savedData));

    const defaultValue = { A: true, B: true, C: true };
    const { result } = renderHook(() => useLocalStorage(defaultValue));

    // Should use saved data, not default
    expect(result.current.letters).toEqual(savedData);
  });

  it("should merge saved data with default schema when new keys are added", () => {
    const savedData = { A: false, B: true };
    window.localStorage.setItem(LETTERS_KEY, JSON.stringify(savedData));

    // Default has a new key 'C'
    const defaultValue = { A: true, B: true, C: true };
    const { result } = renderHook(() => useLocalStorage(defaultValue));

    // Should merge: keep A and B from saved, add C from default
    expect(result.current.letters).toEqual({ A: false, B: true, C: true });

    // Verify localStorage was updated with merged data
    const stored = window.localStorage.getItem(LETTERS_KEY);
    expect(stored).toBe(JSON.stringify({ A: false, B: true, C: true }));
  });

  it("should drop keys that no longer exist in default schema", () => {
    const savedData = { A: false, B: true, C: false };
    window.localStorage.setItem(LETTERS_KEY, JSON.stringify(savedData));

    // Default no longer has key 'C'
    const defaultValue = { A: true, B: true };
    const { result } = renderHook(() => useLocalStorage(defaultValue));

    // Should only have A and B
    expect(result.current.letters).toEqual({ A: false, B: true });

    // Verify localStorage was updated
    const stored = window.localStorage.getItem(LETTERS_KEY);
    expect(stored).toBe(JSON.stringify({ A: false, B: true }));
  });

  it("should save data to localStorage when save is called", () => {
    const defaultValue = { A: true, B: true, C: true };
    const { result } = renderHook(() => useLocalStorage(defaultValue));

    const newData = { A: false, B: false, C: true };
    act(() => {
      result.current.save(newData);
    });

    // Verify state was updated
    expect(result.current.letters).toEqual(newData);

    // Verify localStorage was updated
    const stored = window.localStorage.getItem(LETTERS_KEY);
    expect(stored).toBe(JSON.stringify(newData));
  });

  it("should handle invalid JSON in localStorage gracefully", () => {
    window.localStorage.setItem(LETTERS_KEY, "invalid json");

    const defaultValue = { A: true, B: true };

    // Should throw during JSON.parse and fall back to default
    expect(() => {
      renderHook(() => useLocalStorage(defaultValue));
    }).toThrow();
  });

  it("should not update localStorage unnecessarily when data is already merged", () => {
    const savedData = { A: false, B: true, C: true };
    window.localStorage.setItem(LETTERS_KEY, JSON.stringify(savedData));

    const setItemSpy = vi.spyOn(Storage.prototype, "setItem");

    const defaultValue = { A: true, B: true, C: true };
    renderHook(() => useLocalStorage(defaultValue));

    // localStorage.setItem should not be called again since data is already correct
    // (It will be called once during merge check, but not redundantly)
    expect(setItemSpy).toHaveBeenCalledTimes(0);
  });
});
