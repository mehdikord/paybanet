import { sessionResetHandler } from "@/lib/auth/reset-route";

/** Clears a stale seller session cookie and sends the user to the login page. */
export const GET = sessionResetHandler("seller");
