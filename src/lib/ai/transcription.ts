import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { getUserApiKeys } from "@/lib/ai/byok-providers";

export interface TranscriptionResult {
  text: string;
  error?: string;
}

/**
 * Transcribe audio using Google's Gemini 2.0 Flash model
 */
export async function transcribeAudio(
  audioBlob: Blob
): Promise<TranscriptionResult> {
  try {
    // Get user's Google API key
    const userKeys = getUserApiKeys();
    if (!userKeys.google) {
      return {
        text: "",
        error: "Google API key required. Please add your API key in Settings.",
      };
    }

    // Convert blob to buffer
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioBuffer = new Uint8Array(arrayBuffer);

    // Determine MIME type
    const mimeType = audioBlob.type || "audio/webm";

    // Create the prompt
    const systemPrompt = `You are an expert audio transcription assistant. Your task is to accurately transcribe the audio content into text. 

Guidelines:
- Transcribe exactly what is spoken
- Use proper punctuation and capitalization
- If the audio is unclear or inaudible, indicate with [unclear] or [inaudible]
- Do not add commentary or interpretation
- Return only the transcribed text, nothing else`;

    const userPrompt = "Please transcribe this audio file accurately:";

    // Create Google provider with user's API key
    const googleProvider = createGoogleGenerativeAI({
      apiKey: userKeys.google,
    });

    // Call Gemini 2.0 Flash with audio
    const result = await generateText({
      model: googleProvider("gemini-2.0-flash"),
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: userPrompt,
            },
            {
              type: "file",
              mimeType,
              data: audioBuffer,
            },
          ],
        },
      ],
      maxTokens: 1000,
      temperature: 0.1, // Low temperature for accuracy
    });

    return {
      text: result.text.trim(),
    };
  } catch (error) {
    console.error("Transcription error:", error);

    // Handle specific error types
    let errorMessage = "Failed to transcribe audio";

    if (error instanceof Error) {
      if (error.message.includes("quota")) {
        errorMessage = "API quota exceeded. Please try again later.";
      } else if (error.message.includes("authentication")) {
        errorMessage = "Authentication failed. Please check your API key.";
      } else if (error.message.includes("unsupported")) {
        errorMessage =
          "Audio format not supported. Please try a different format.";
      } else {
        errorMessage = error.message;
      }
    }

    return {
      text: "",
      error: errorMessage,
    };
  }
}
