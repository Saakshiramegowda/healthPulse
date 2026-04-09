import { useState, useEffect, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Heart,
  Calendar,
  Cloud,
  Wind,
  Activity,
  Utensils,
  Pill,
  Bell,
  Settings,
  LogOut,
  Droplets,
  AlertTriangle,
  Zap,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MoodSelector } from "@/components/MoodSelector";
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

function formatScheduleTime(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return dateStr;
  }
}

const Dashboard = () => {
  const shouldReduceMotion = useReducedMotion();
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

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
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
    void loadUser();
  }, [navigate]);

  useEffect(() => {
    void loadContext();
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const hasCalendar = (context?.calendar_events?.length ?? 0) > 0;
  const weather = context?.weather;
  const air = context?.air_quality;
  const locationLabel = context?.location
    ? `${context.location.lat.toFixed(2)}, ${context.location.lon.toFixed(2)}`
    : "Current location";

  return (
    <div className="min-h-screen warm-editorial warm-bg flex">
      <aside className="w-20 md:w-64 bg-white/85 backdrop-blur border-r border-border/70 flex flex-col items-center md:items-stretch py-8 px-4 sticky top-0 h-screen">
        <div className="flex items-center gap-3 px-2 mb-12">
          <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-lg">
            <Heart className="w-6 h-6" />
          </div>
          <span className="hidden md:block text-xl font-semibold tracking-tight">HealthPulse</span>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { icon: Activity, label: "Overview", active: true },
            { icon: Calendar, label: "Schedule" },
            { icon: Utensils, label: "Nutrition" },
            { icon: Pill, label: "Medication" },
            { icon: Settings, label: "Settings" },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                item.active
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-foreground/60 hover:bg-secondary hover:text-foreground"
              }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span className="hidden md:block text-xs font-semibold uppercase tracking-[0.12em]">{item.label}</span>
            </button>
          ))}
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-4 p-4 text-foreground/60 hover:text-destructive transition-colors mt-auto rounded-2xl"
        >
          <LogOut className="w-5 h-5" />
          <span className="hidden md:block text-xs font-semibold uppercase tracking-[0.12em]">Logout</span>
        </button>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="editorial-heading text-3xl mb-1">
              {greeting()}, {userName || "there"}
            </h1>
            <p className="editorial-subtext text-sm">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="rounded-2xl border-border/70 bg-white/80"
              onClick={() => void loadContext()}
              disabled={isLoadingContext}
            >
              <RefreshCw className={`w-5 h-5 ${isLoadingContext ? "animate-spin" : ""}`} />
            </Button>
            <button type="button" className="p-3 bg-white rounded-2xl shadow-sm border border-border/70 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="flex items-center gap-3 bg-white p-2 pr-4 rounded-2xl shadow-sm border border-border/70">
              <img
                src="https://picsum.photos/seed/healthpulse-user/100/100"
                alt="Profile"
                className="w-10 h-10 rounded-xl object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="hidden md:block">
                <p className="text-xs font-semibold uppercase tracking-[0.11em]">{userName || "HealthPulse User"}</p>
                <p className="text-[10px] text-foreground/50">Wellness Member</p>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <motion.section
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="md:col-span-2 lg:col-span-2 bg-primary text-primary-foreground p-8 rounded-[2.2rem] shadow-xl relative overflow-hidden"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <Zap className="w-6 h-6 text-secondary-foreground" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary-foreground/80">Daily Health Pulse</span>
              </div>
              <h2 className="text-3xl md:text-4xl editorial-heading mb-5 leading-tight">
                {recommendations?.caution?.description ??
                  "Your personalized suggestions are loading. Refresh for the latest context-aware routine."}
              </h2>
              <div className="space-y-3 mb-7">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-1.5 h-1.5 bg-secondary-foreground rounded-full" />
                  <p>Exercise: {recommendations?.exercise?.title ?? "Gentle movement plan"}</p>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-1.5 h-1.5 bg-secondary-foreground rounded-full" />
                  <p>Nutrition: {recommendations?.nutrition?.title ?? "Balanced meal focus"}</p>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-1.5 h-1.5 bg-secondary-foreground rounded-full" />
                  <p>Safety: {recommendations?.caution?.title ?? "Stay consistent and hydrated"}</p>
                </div>
              </div>
              <p className="text-[10px] text-secondary-foreground/60 italic">
                {recommendations?.disclaimer ?? "AI-generated wellness support. Not a substitute for clinical advice."}
              </p>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
          </motion.section>

          <section className="editorial-card p-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5">
                <span className="editorial-chip">Environment</span>
                <Cloud className="w-5 h-5 text-primary" />
              </div>
              <div className="flex items-end gap-2 mb-1">
                <span className="editorial-heading text-5xl">{weather ? Math.round(weather.temp) : "--"}°</span>
                <span className="editorial-subtext mb-1">C</span>
              </div>
              <p className="text-sm font-semibold mb-4 capitalize">{weather?.description ?? "Weather unavailable"}</p>
              <p className="text-[10px] editorial-subtext">{locationLabel}</p>
            </div>
            <div className="space-y-3 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-primary" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.11em]">AQI</span>
                </div>
                <span className="text-xs font-semibold">{air ? `${air.category} (${air.aqi})` : "Unknown"}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-primary" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.11em]">Pollen</span>
                </div>
                <span className="text-xs font-semibold">{air?.pollen_level ?? "Moderate"}</span>
              </div>
            </div>
          </section>

          <section className="editorial-card p-7 flex flex-col items-center justify-center text-center">
            <span className="editorial-chip mb-5">Health Score</span>
            <div className="relative w-32 h-32 flex items-center justify-center mb-4">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-secondary" />
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="364.4"
                  strokeDashoffset="72.8"
                  className="text-primary"
                />
              </svg>
              <span className="absolute editorial-heading text-3xl">82</span>
            </div>
            <p className="text-sm font-semibold">Great Progress</p>
            <p className="text-[10px] editorial-subtext mt-1">Mood-aware recommendations active</p>
          </section>

          <section className="md:col-span-2 editorial-card p-7">
            <div className="flex items-center justify-between mb-6">
              <span className="editorial-chip">Today&apos;s Schedule</span>
              <div className="flex items-center gap-3">
                {!hasCalendar && <span className="text-[10px] font-semibold uppercase tracking-[0.11em] editorial-subtext">Connect Calendar below</span>}
                <Calendar className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="space-y-4">
              {(context?.calendar_events?.length ?? 0) > 0 ? (
                context!.calendar_events.slice(0, 5).map((item, i) => (
                  <div key={item.id ?? `${item.start}-${i}`} className="flex items-center gap-4">
                    <span className="text-xs font-mono text-foreground/50 w-16">{formatScheduleTime(item.start)}</span>
                    <div className="flex-1 p-3 bg-secondary/50 rounded-2xl flex items-center justify-between border border-border/60">
                      <span className="font-semibold text-sm">{item.summary}</span>
                      <span className="text-[10px] px-2 py-1 rounded-full uppercase tracking-[0.1em] font-semibold bg-blue-100 text-blue-700">
                        Calendar
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm editorial-subtext py-3">
                  No synced events yet. Connect Google Calendar to personalize your routine around your schedule.
                </p>
              )}
            </div>
          </section>

          <section className="editorial-card p-7">
            <div className="flex items-center justify-between mb-5">
              <span className="editorial-chip">Mood Tuner</span>
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <MoodSelector selected={mood} onSelect={handleMoodChange} />
          </section>

          <section className="editorial-card p-7">
            <div className="flex items-center justify-between mb-5">
              <span className="editorial-chip">Calendar Access</span>
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <GoogleCalendarConnect onSessionUpdated={loadContext} />
          </section>

          <section className="md:col-span-2 editorial-card p-7">
            <div className="flex items-center justify-between mb-6">
              <span className="editorial-chip">Medication</span>
              <Pill className="w-5 h-5 text-primary" />
            </div>
            <div className="grid gap-3">
              <div className="p-4 bg-secondary/40 rounded-2xl border border-border/60">
                <p className="text-sm font-semibold">Vitamin D3</p>
                <p className="text-[10px] editorial-subtext">1000 IU • After breakfast</p>
                <button type="button" className="mt-3 w-full py-2 bg-primary text-primary-foreground rounded-xl text-xs font-semibold">
                  Taken
                </button>
              </div>
              <div className="p-4 bg-white/70 rounded-2xl border border-border/60">
                <p className="text-sm font-semibold">Omega 3</p>
                <p className="text-[10px] editorial-subtext">1000mg • With dinner</p>
                <button type="button" className="mt-3 w-full py-2 border border-primary text-primary rounded-xl text-xs font-semibold">
                  Mark as Taken
                </button>
              </div>
            </div>
          </section>

          <section className="editorial-card p-7 bg-orange-50/60 border-orange-100">
            <div className="flex items-center gap-3 mb-4 text-orange-600">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-xs font-semibold uppercase tracking-[0.11em]">Health Reminder</span>
            </div>
            <p className="text-sm font-semibold mb-2">{recommendations?.caution?.title ?? "Routine Reminder"}</p>
            <p className="text-xs editorial-subtext mb-5">
              {recommendations?.caution?.description ?? "Stay consistent with your routine and check in with your wellness goals."}
            </p>
            <button type="button" className="w-full py-3 bg-orange-600 text-white rounded-2xl text-sm font-semibold shadow-lg shadow-orange-200">
              Review Action
            </button>
          </section>
        </div>

        <section className="grid gap-6 mt-6">
          <div className="editorial-card p-2">
            <LifestyleTipsCard tips={context?.lifestyle_tips ?? []} isLoading={isLoadingContext} />
          </div>
          <div className="editorial-card p-2">
            <RecommendationCards recommendations={recommendations} isLoading={isLoadingRecs} />
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
