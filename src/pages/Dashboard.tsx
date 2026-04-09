import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Heart, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MoodSelector } from "@/components/MoodSelector";
import { WeatherCard } from "@/components/WeatherCard";
import { CalendarCard } from "@/components/CalendarCard";
import { RecommendationCards } from "@/components/RecommendationCards";
import { useHealthData } from "@/hooks/use-health-data";
import { supabase } from "@/integrations/supabase/client";
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
    loadContext();
  }, []);

  const loadContext = useCallback(async () => {
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
    const ctx = await fetchContext(lat, lon);
    if (ctx) {
      await fetchRecommendations(ctx, mood, profile);
    }
  }, [fetchContext, fetchRecommendations, mood, profile]);

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
    <div className="min-h-screen bg-background transition-colors duration-700">
      {/* Header */}
      <header className="sticky top-0 z-10 glass">
        <div className="container mx-auto flex items-center justify-between px-4 py-3 max-w-5xl">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            >
              <Heart className="h-6 w-6 text-primary fill-primary" />
            </motion.div>
            <h1 className="text-xl font-bold tracking-tight">PatientPulse</h1>
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
      <main className="container mx-auto max-w-5xl px-4 py-6 space-y-6">
        {/* Greeting */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-1">
          <h2 className="text-2xl md:text-3xl font-bold">
            {greeting()}, <span className="text-primary">{userName}</span>
          </h2>
          <p className="text-muted-foreground mt-1">Here's your daily health pulse</p>
        </motion.div>

        {/* Mood Selector */}
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <MoodSelector selected={mood} onSelect={handleMoodChange} />
        </motion.section>

        {/* Context Section */}
        <section className="grid gap-4 md:grid-cols-2">
          <WeatherCard context={context} isLoading={isLoadingContext} />
          <CalendarCard events={context?.calendar_events ?? []} isLoading={isLoadingContext} />
        </section>

        {/* Recommendations */}
        <section>
          <RecommendationCards recommendations={recommendations} isLoading={isLoadingRecs} />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-8">
        <div className="container mx-auto max-w-5xl px-4 py-4 text-center">
          <p className="text-xs text-muted-foreground">
            PatientPulse — Not a substitute for professional medical advice.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
