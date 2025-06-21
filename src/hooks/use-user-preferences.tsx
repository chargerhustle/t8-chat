"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

// Preferences type
export interface UserPreferences {
  memoriesEnabled: boolean;
  hidePersonalInfo: boolean;
  statsForNerds: boolean;
}

// Default preferences
const DEFAULT_PREFERENCES: UserPreferences = {
  memoriesEnabled: true, // Default to enabled
  hidePersonalInfo: false,
  statsForNerds: true,
};

// localStorage key
const PREFERENCES_STORAGE_KEY = "t8-chat-user-preferences";

// Context type
interface PreferencesContextType {
  preferences: UserPreferences;
  updatePreference: <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => Promise<void>;
  isLoading: boolean;
}

// Create context
const PreferencesContext = createContext<PreferencesContextType | undefined>(
  undefined
);

/**
 * Provides user preferences context to child components, synchronizing preferences between localStorage and the Convex backend.
 *
 * Initializes preferences from localStorage for immediate UI responsiveness, then updates from Convex when available. Exposes current preferences, an async update function with optimistic UI updates, and a loading state.
 *
 * Must wrap components that require access to user preferences.
 */
export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] =
    useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);

  // Get data from Convex
  const convexCustomization = useQuery(api.auth.getUserCustomization);
  const savePreferencesMutation = useMutation(api.auth.saveUserPreferences);

  // Load preferences with proper sync logic
  useEffect(() => {
    // First, try to load from localStorage for immediate UI update
    const savedData = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    let hasLocalData = false;

    if (savedData) {
      try {
        const parsedData: UserPreferences = JSON.parse(savedData);
        // Validate the data has all required fields
        if (
          typeof parsedData.memoriesEnabled === "boolean" &&
          typeof parsedData.hidePersonalInfo === "boolean" &&
          typeof parsedData.statsForNerds === "boolean"
        ) {
          setPreferences(parsedData);
          hasLocalData = true;
        }
      } catch (error) {
        console.error(
          "Failed to parse saved preferences from localStorage:",
          error
        );
      }
    }

    // When Convex data is available, use it as the authoritative source
    if (convexCustomization !== undefined) {
      setIsLoading(false);

      if (convexCustomization?.preferences) {
        const convexPrefs: UserPreferences = {
          memoriesEnabled: convexCustomization.preferences.memoriesEnabled,
          hidePersonalInfo: convexCustomization.preferences.hidePersonalInfo,
          statsForNerds: convexCustomization.preferences.statsForNerds,
        };

        // Update state with Convex data
        setPreferences(convexPrefs);

        // Update localStorage with authoritative Convex data
        localStorage.setItem(
          PREFERENCES_STORAGE_KEY,
          JSON.stringify(convexPrefs)
        );
      } else {
        // No Convex preferences data
        if (!hasLocalData) {
          // No local data either - use defaults
          setPreferences(DEFAULT_PREFERENCES);
          // Don't save defaults to localStorage yet - wait for user interaction
        }
        // If we have local data but no Convex data, keep using local data
      }
    }
  }, [convexCustomization]);

  // Update preference function
  const updatePreference = async <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    try {
      // Optimistic update - update UI immediately
      const newPreferences = { ...preferences, [key]: value };
      setPreferences(newPreferences);

      // Update localStorage immediately
      localStorage.setItem(
        PREFERENCES_STORAGE_KEY,
        JSON.stringify(newPreferences)
      );

      // Save to Convex in the background
      await savePreferencesMutation(newPreferences);
    } catch (error) {
      // On error, preferences might be stale - let the useEffect sync from Convex
      // which will update both state and localStorage with the latest data

      console.error("Failed to save preference:", error);
      throw error; // Re-throw so components can handle the error
    }
  };

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        updatePreference,
        isLoading,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

/**
 * Provides access to the user preferences context.
 *
 * Throws an error if used outside of a PreferencesProvider.
 * @returns The current user preferences, update function, and loading state.
 */
export function useUserPreferences() {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error(
      "useUserPreferences must be used within a PreferencesProvider"
    );
  }
  return context;
}

/**
 * Retrieves user preferences from localStorage, returning defaults if unavailable or invalid.
 *
 * Attempts to read and validate cached preferences for immediate synchronous access. If the cache is missing or malformed, returns the default preferences.
 *
 * @returns The user preferences from localStorage if valid; otherwise, the default preferences
 */
export function getCachedPreferences(): UserPreferences {
  try {
    const saved = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Validate the data
      if (
        typeof parsed.memoriesEnabled === "boolean" &&
        typeof parsed.hidePersonalInfo === "boolean" &&
        typeof parsed.statsForNerds === "boolean"
      ) {
        return parsed;
      }
    }
  } catch (error) {
    console.error("Failed to get cached preferences:", error);
  }

  // Return defaults if cache is invalid
  return DEFAULT_PREFERENCES;
}
