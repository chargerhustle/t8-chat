import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Truncate a filename to a maximum length while preserving the file extension
 * @param filename - The original filename
 * @param maxLength - Maximum length of the truncated filename (default: 30)
 * @returns Truncated filename with ellipsis if needed
 */
export function truncateFilename(
  filename: string,
  maxLength: number = 30
): string {
  if (filename.length <= maxLength) {
    return filename;
  }

  // Find the last dot to separate name and extension
  const lastDotIndex = filename.lastIndexOf(".");

  if (lastDotIndex === -1) {
    // No extension, just truncate
    return filename.slice(0, maxLength - 3) + "...";
  }

  const name = filename.slice(0, lastDotIndex);
  const extension = filename.slice(lastDotIndex);

  // If extension is too long, just truncate the whole filename
  if (extension.length > maxLength - 3) {
    return filename.slice(0, maxLength - 3) + "...";
  }

  // Calculate how much space we have for the name part
  const availableNameLength = maxLength - extension.length - 3; // 3 for '...'

  if (availableNameLength <= 0) {
    return filename.slice(0, maxLength - 3) + "...";
  }

  return name.slice(0, availableNameLength) + "..." + extension;
}

// Parse model display name to separate main text from parentheses and handle dash separation
export function parseDisplayName(displayName: string) {
  const parenMatch = displayName.match(/^(.+?)\s*(\([^)]+\))$/);
  const mainText = parenMatch ? parenMatch[1].trim() : displayName;
  const parenText = parenMatch ? parenMatch[2] : null;

  // Check if the main text contains a dash for splitting
  if (mainText.includes("-")) {
    const dashParts = mainText.split("-");
    return {
      mainText,
      firstPart: dashParts[0],
      secondPart: dashParts.slice(1).join("-"), // Handle multiple dashes
      parenText: parenText,
    };
  } else {
    // Fall back to space separation for models like "Gemini 2.0 Flash"
    const spaceParts = mainText.split(" ");
    return {
      mainText,
      firstPart: spaceParts[0],
      secondPart: spaceParts.slice(1).join(" "),
      parenText: parenText,
    };
  }
}
