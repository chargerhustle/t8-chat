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
