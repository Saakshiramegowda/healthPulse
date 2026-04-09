import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Heart, LogOut, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MoodSelector } from "@/components/MoodSelector";
import { WeatherCard } from "@/components/WeatherCard";
import { CalendarCard } from "@/components/CalendarCard";
import { RecommendationCards } from "@/components/RecommendationCards";
import { LifestyleTipsCard } from "@/components/LifestyleTipsCard";
import { useHealthData } from "@/hooks/use-health-data";
import { supabase } from "@/integrations/supabase/client";
import { getGoogleAccessTokenFromSession } from "@/lib/google-calendar";
import { GoogleCalendarConnect } from "@/components/GoogleCalendarConnect";
import { useNavigate } from "react-router-dom";
import type { Mood, HealthProfile } from "@/types/health";

const DEFAULT_PROFILE: HealthProfile = {
  health_conditions: [],
  allergies: [],
  nutrition_preferences: [],
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [mood, setMood] = useState<Mood>("calm");
  const [profile, setProfile] = useState<HealthProfile>(DEFAULT_PROFILE);
  const [userName, setUserName] = useState("");
  const { context, recommendations, isLoadingContext, isLoadingRecs, fetchContext, fetchRecommendations } = useHealthData();

  const loadContext = useCallback(async () => {
    const googleToken = await getGoogleAccessTokenFromSession();
    let lat = 40.7128, lon = -74.006;
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
      );
      lat = pos.coords.latitude;
      lon = pos.coords.longitude;
    } catch {
      // fallback
    }
    const ctx = await fetchContext(lat, lon, googleToken ?? undefined);
    if (ctx) {
      await fetchRecommendations(ctx, mood, profile);
    }
  }, [fetchContext, fetchRecommendations, mood, profile]);

  useEffect(() => {
    document.documentElement.setAttribute("data-mood", mood);
    return () => document.documentElement.removeAttribute("data-mood");
  }, [mood]);

  // Load user + profile
  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }
      setUserName(user.user_metadata?.display_name || user.email?.split("@")[0] || "");
      const { data } = await supabase.from("health_profiles").select("*").eq("user_id", user.id).maybeSingle();
      if (data) {
        setProfile({
          health_conditions: data.health_conditions || [],
          allergies: data.allergies || [],
          nutrition_preferences: data.nutrition_preferences || [],
        });
      }
    };
    loadUser();
  }, [navigate]);

  useEffect(() => {
    void loadContext();
    // Initial dashboard load only; use Refresh or Google reconnect for updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        void loadContext();
      }
    });
    return () => subscription.unsubscribe();
  }, [loadContext]);

  const handleMoodChange = async (newMood: Mood) => {
    setMood(newMood);
    if (context) {
      await fetchRecommendations(context, newMood, profile);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen warm-editorial warm-bg transition-colors duration-700">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border/75 bg-background/90 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-4 py-3 max-w-6xl">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            >
              <Heart className="h-6 w-6 text-primary" />
            </motion.div>
            <h1 className="text-xl font-semibold tracking-tight">HealthPulse</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => loadContext()} disabled={isLoadingContext} className="gap-2">
              <RefreshCw className={`h-4 w-4 ${isLoadingContext ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-6xl px-4 py-8 space-y-6">
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="editorial-panel p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="editorial-chip mb-3">
                <Sparkles className="h-3.5 w-3.5" />
                Your daily wellness snapshot
              </p>
              <h2 className="editorial-heading text-4xl md:text-5xl">
                {greeting()}, <span className="text-primary">{userName || "there"}</span>
              </h2>
              <p className="editorial-subtext mt-2 max-w-2xl">
                HealthPulse is ready with schedule-aware recommendations based on your mood, local conditions, and routine.
              </p>
            </div>
            <Button onClick={() => loadContext()} disabled={isLoadingContext} className="editorial-button gap-2">
              <RefreshCw className={`h-4 w-4 ${isLoadingContext ? "animate-spin" : ""}`} />
              Refresh insights
            </Button>
          </div>
        </motion.section>

        {/* Mood Selector */}
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="editorial-card p-4 md:p-5">
          <h3 className="editorial-heading text-3xl mb-2">How are you feeling right now?</h3>
          <p className="editorial-subtext text-sm mb-4">Your mood helps tailor today&apos;s recommendations and pacing.</p>
          <MoodSelector selected={mood} onSelect={handleMoodChange} />
        </motion.section>

        <section className="editorial-card p-4 md:p-5">
          <GoogleCalendarConnect onSessionUpdated={loadContext} />
        </section>

        {/* Context Section */}
        <section className="grid gap-4 md:grid-cols-2">
          <article className="editorial-card p-1">
            <WeatherCard context={context} isLoading={isLoadingContext} />
          </article>
          <article className="editorial-card p-1">
            <CalendarCard events={context?.calendar_events ?? []} isLoading={isLoadingContext} />
          </article>
        </section>

        <section className="editorial-card p-1">
          <LifestyleTipsCard tips={context?.lifestyle_tips ?? []} isLoading={isLoadingContext} />
        </section>

        {/* Recommendations */}
        <section className="editorial-card p-1">
          <RecommendationCards recommendations={recommendations} isLoading={isLoadingRecs} />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/70 mt-8">
        <div className="container mx-auto max-w-6xl px-4 py-4 text-center">
          <p className="text-xs editorial-subtext">
            HealthPulse offers supportive guidance and does not replace professional medical advice.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
