import { createResumableStreamContext } from "resumable-stream";
import { waitUntil } from "@vercel/functions";

export const runtime = "nodejs";

// Create resumable stream context - must match the one in process-request.ts
const streamContext = createResumableStreamContext({
  waitUntil,
});

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const streamId = url.searchParams.get("streamId");
    const resumeAt = url.searchParams.get("resumeAt");
    const messageId = url.searchParams.get("messageId");
    const sessionId = url.searchParams.get("sessionId");

    // TODO: Add authorization check using messageId and sessionId
    console.log(
      `[CHAT] Resume request for message: ${messageId}, session: ${sessionId}`
    );

    console.log(
      `[CHAT] Attempting to resume stream: ${streamId} from position: ${resumeAt || "start"}`
    );

    if (!streamId) {
      return new Response(
        JSON.stringify({
          error: "Missing streamId parameter",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Authorization check could be added here using messageId and sessionId
    // if (messageId && sessionId) {
    //   // Verify the user has access to this message/stream
    // }

    // Resume existing stream from specified position
    const stream = await streamContext.resumeExistingStream(
      streamId,
      resumeAt ? parseInt(resumeAt) : undefined
    );

    if (!stream) {
      console.log(`[CHAT] Stream not found or already completed: ${streamId}`);
      return new Response(
        JSON.stringify({
          error: "Stream not found or already completed",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log(`[CHAT] Successfully resumed stream: ${streamId}`);

    // Return the resumed stream
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Stream-ID": streamId,
      },
    });
  } catch (error) {
    console.error("[CHAT] Error resuming stream:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to resume stream",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
