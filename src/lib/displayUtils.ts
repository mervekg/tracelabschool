/**
 * Utility functions for displaying user information with privacy in mind.
 * Student emails should never be displayed in the UI except in the user's own profile.
 */

/**
 * Formats a full name into a privacy-friendly display format.
 * Example: "John Smith" -> "John S."
 * Example: "Ada Lovelace" -> "Ada L."
 */
export function formatDisplayName(fullName: string | null | undefined): string {
  if (!fullName || fullName.trim() === "") {
    return "Student";
  }
  
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0];
  }
  
  const firstName = parts[0];
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
  return `${firstName} ${lastInitial}.`;
}

/**
 * Generates a student code based on their index in a list.
 * Example: 0 -> "Student #1"
 * Example: 11 -> "Student #12"
 */
export function formatStudentCode(index: number): string {
  return `Student #${index + 1}`;
}

/**
 * Masks an email address for privacy.
 * Example: "john.smith@school.edu" -> "j***@school.edu"
 * Only use this when an email hint is absolutely necessary.
 */
export function maskEmail(email: string | null | undefined): string {
  if (!email) return "";
  
  const [localPart, domain] = email.split("@");
  if (!domain) return "***";
  
  const maskedLocal = localPart.charAt(0) + "***";
  return `${maskedLocal}@${domain}`;
}
