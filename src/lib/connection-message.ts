/**
 * Generates a connection message for reaching out to other travelers
 * @param userName - The name of the current user
 * @returns The formatted connection message
 */
export function generateConnectionMessage(userName: string): string {
  return `Hi, I'm ${userName}. I found your profile on GoTogetherRides. It looks like our travel routes match. Would you like to connect and travel together? 🚗💙 Let's make commuting smarter and more affordable!`;
}

/**
 * Encodes a message for use in URL parameters
 * @param message - The message to encode
 * @returns URL-encoded message
 */
export function encodeMessageForUrl(message: string): string {
  return encodeURIComponent(message);
}

/**
 * Copies text to clipboard
 * @param text - The text to copy
 * @returns Promise that resolves when text is copied
 */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    console.error("Failed to copy to clipboard:", err);
    throw new Error("Failed to copy message to clipboard");
  }
}
