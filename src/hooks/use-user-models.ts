import { useState, useEffect } from "react";

interface UserModels {
  favouriteModels: string[];
}

const defaultUserModels: UserModels = {
  favouriteModels: [
    "gemini-2.5-flash-normal",
    "gemini-2.0-flash-lite",
    "gpt-4.1-2025-04-14",
    "o4-mini-2025-04-16",
  ],
};

const STORAGE_KEY = "t8-chat-user-models";

// Global state and listeners
let globalUserModels: UserModels = defaultUserModels;
let isInitialized = false;

const initializeGlobalState = () => {
  if (isInitialized || typeof window === "undefined") return;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      globalUserModels = { ...defaultUserModels, ...parsed };
    }
  } catch (error) {
    console.error("Failed to load user models from localStorage:", error);
  }
  isInitialized = true;
};

const listeners = new Set<() => void>();

const saveToStorage = (models: UserModels) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(models));
  } catch (error) {
    console.error("Failed to save user models to localStorage:", error);
  }
};

const notifyListeners = () => {
  listeners.forEach((listener) => listener());
};

export function useUserModels() {
  // Initialize global state on first hook usage (client-side only)
  initializeGlobalState();

  const [userModels, setUserModels] = useState<UserModels>(globalUserModels);

  useEffect(() => {
    const listener = () => {
      setUserModels(globalUserModels);
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const updateFavouriteModels = (models: string[]) => {
    globalUserModels = {
      ...globalUserModels,
      favouriteModels: models,
    };
    saveToStorage(globalUserModels);
    notifyListeners();
  };

  const toggleModelFavourite = (modelId: string) => {
    const currentFavourites = globalUserModels.favouriteModels;
    const isCurrentlyFavourite = currentFavourites.includes(modelId);

    // Don't allow removing the last favourite model
    if (isCurrentlyFavourite && currentFavourites.length <= 1) {
      return;
    }

    const newFavourites = isCurrentlyFavourite
      ? currentFavourites.filter((id) => id !== modelId)
      : [...currentFavourites, modelId];

    globalUserModels = {
      ...globalUserModels,
      favouriteModels: newFavourites,
    };
    saveToStorage(globalUserModels);
    notifyListeners();
  };

  return {
    userModels,
    updateFavouriteModels,
    toggleModelFavourite,
  };
}
