import { useState, useEffect } from "react";
import { Calendar, Loader2, Link2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { connectGoogleCalendarAccess, getGoogleAccessTokenFromSession } from "@/lib/google-calendar";

interface GoogleCalendarConnectProps {
  onSessionUpdated?: () => void;
}

export function GoogleCalendarConnect({ onSessionUpdated }: GoogleCalendarConnectProps) {
  const { toast } = useToast();
  const [hasToken, setHasToken] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  const refreshTokenState = async () => {
    const token = await getGoogleAccessTokenFromSession();
    setHasToken(!!token);
  };

  useEffect(() => {
    void refreshTokenState();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void refreshTokenState();
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleConnect = async () => {
    setBusy(true);
    const { error } = await connectGoogleCalendarAccess();
    setBusy(false);
    if (error) {
      toast({
        title: "Could not start Google connection",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Continue in Google",
      description: "Complete the prompt, then you’ll return here with calendar access.",
    });
  };

  if (hasToken === null) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-border/70 bg-card/70 px-3 py-2 text-sm editorial-subtext vetra-rail-card">
        <Loader2 className="h-4 w-4 animate-spin" />
        Checking calendar connection…
      </div>
    );
  }

  if (hasToken) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/25 bg-primary/5 px-4 py-3 vetra-rail-card">
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
          <span>
            Google Calendar is connected. HealthPulse will include upcoming events on refresh.
          </span>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => onSessionUpdated?.()} className="gap-1.5 rounded-full border-border/80">
          <Calendar className="h-3.5 w-3.5" />
          Refresh data
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card/75 px-4 py-3 vetra-soft-gradient vetra-rail-card">
      <div className="flex items-start gap-2 text-sm editorial-subtext max-w-xl">
        <Calendar className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
        <span>
          Connect Google Calendar to include upcoming events in your daily HealthPulse. We only request read access to your
          calendar.
        </span>
      </div>
      <Button type="button" size="sm" onClick={handleConnect} disabled={busy} className="gap-2 shrink-0 rounded-full editorial-button">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
        Connect Google Calendar
      </Button>
    </div>
  );
}
