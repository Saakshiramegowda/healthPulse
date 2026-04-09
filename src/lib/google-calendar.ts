import { supabase } from "@/integrations/supabase/client";

/**
 * Read-only access to the user’s primary calendar (matches edge function `context`).
 * Space-separated for Supabase OAuth `scopes`.
 *
 * Setup (project owner):
 * 1. Google Cloud Console → APIs & Services → enable Google Calendar API.
 * 2. OAuth consent screen → add scope `.../auth/calendar.readonly`.
 * 3. Supabase Dashboard → Authentication → Providers → Google: same Client ID/secret as GCP.
 * 4. Supabase → URL Configuration: add `http://localhost:8080/**` and production URLs.
 */
export const GOOGLE_CALENDAR_SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
].join(" ");

const dashboardRedirect = () => `${window.location.origin}/dashboard`;

const oauthOptions = {
  redirectTo: dashboardRedirect(),
  scopes: GOOGLE_CALENDAR_SCOPES,
  queryParams: {
    access_type: "offline",
    prompt: "consent",
  },
} as const;

export async function getGoogleAccessTokenFromSession(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.provider_token ?? null;
}

/** Sign in or sign up with Google; session includes `provider_token` for Calendar API. */
export async function signInWithGoogleForCalendar() {
  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: { ...oauthOptions },
  });
}

/**
 * Email/password users: link a Google identity with calendar scope (redirects to Google).
 * Google-only users without a calendar token: run OAuth again to attach scopes to the session.
 */
export async function connectGoogleCalendarAccess() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: new Error("You must be signed in.") };
  }

  const hasGoogleIdentity = user.identities?.some((i) => i.provider === "google");

  if (!hasGoogleIdentity) {
    return supabase.auth.linkIdentity({
      provider: "google",
      options: { ...oauthOptions },
    });
  }

  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: { ...oauthOptions },
  });
}
