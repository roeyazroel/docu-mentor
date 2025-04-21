import { SignedInAuthObject } from "@clerk/backend/internal";
import { createClerkClient } from "@clerk/nextjs/server";
import { IncomingMessage } from "http";

/**
 * Authenticates a WebSocket connection request
 * @param req The HTTP request for WebSocket upgrade
 * @returns An auth object if authentication succeeds, undefined otherwise
 */
export async function authGuard(
  req: IncomingMessage,
  clerkClient: ReturnType<typeof createClerkClient>
): Promise<SignedInAuthObject | undefined> {
  try {
    // Extract token from query string
    const url = new URL(req.url || "/", `http://${req.headers.host}`);
    const token = url.searchParams.get("token");

    if (!token) {
      console.warn("[authGuard] No token provided");
      return undefined;
    }

    // Add token to headers for Clerk to authenticate
    const headers = new Headers(req.headers as any);
    headers.set("Authorization", `Bearer ${token}`);

    // Create a Request object that Clerk can authenticate
    const request = new Request(url.toString(), {
      method: req.method,
      headers,
    });

    // Authenticate with Clerk
    const client = await clerkClient.authenticateRequest(request);

    if (!client || !client.isSignedIn) {
      console.warn("[authGuard] Authentication failed or user not signed in");
      return undefined;
    }

    console.log("[authGuard] Authentication successful");

    return client.toAuth();
  } catch (error) {
    console.error("[authGuard] Error during authentication:", error);
    return undefined;
  }
}

export async function getUserById(userId: string) {
  const secretKey = process.env.CLERK_SECRET_KEY || "";
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "";

  if (!secretKey || !publishableKey) {
    console.error("ERROR: Clerk API keys are missing or undefined!");
  }

  // Initialize Clerk client
  const clerkClient = createClerkClient({
    secretKey,
    publishableKey,
  });
  const user = await clerkClient.users.getUser(userId);
  return user;
}
