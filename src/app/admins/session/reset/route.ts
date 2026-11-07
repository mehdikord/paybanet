import { sessionResetHandler } from "@/lib/auth/reset-route";

/** Clears a stale admin session cookie and sends the user to the login page. */
export const GET = sessionResetHandler("admin");
