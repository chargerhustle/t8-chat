import { ConvexHttpClient } from "convex/browser";

// Server-side Convex client for backend operations
export const SERVER_CONVEX_CLIENT = new ConvexHttpClient(
  process.env.NEXT_PUBLIC_CONVEX_URL!
);
