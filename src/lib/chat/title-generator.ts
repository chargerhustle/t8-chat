import { generateText } from 'ai'
import { google } from '@ai-sdk/google';

/**
 * Generate a title for a thread based on the first message
 */
export async function generateTitleFromUserMessage({
  messageContent,
  uniqueIdentifier
}: {
  messageContent: string
  uniqueIdentifier: string
}): Promise<string> {
  try {
    // Generate a title using AI
    const { text } = await generateText({
      model: google("gemini-2.0-flash-lite"),
      system: `\n
    - you will generate a short title based on the first message a user begins a conversation with
    - ensure it is not more than 80 characters long
    - the title should be a summary of the user's message
    - do not use quotes or colons
    - DO NOT use any markdown
    - DO NOT use any emojis
    - DO NOT use any special characters
    - DO NOT use any numbers
    - DO NOT use any punctuation
    `,
      prompt: JSON.stringify({messageContent}),
      maxTokens: 10,
    })

    // Return the generated title, or a default if empty
    return text.trim() || `Chat ${uniqueIdentifier.slice(0, 8)}`
  } catch (error) {
    console.error('[TITLE-GEN] Error generating title:', error)
    // Return a fallback title based on the unique identifier
    return `Chat ${uniqueIdentifier.slice(0, 8)}`
  }
} 