import { motion } from "framer-motion";
import { Heart, Activity, Cloud, Calendar, Shield, Brain, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: Activity,
    title: "Smart Health Pulse",
    description: "AI-powered daily recommendations based on your mood, conditions, and environment.",
  },
  {
    icon: Cloud,
    title: "Live Weather & Air Quality",
    description: "Real-time environmental data including pollen counts and air quality indices.",
  },
  {
    icon: Calendar,
    title: "Calendar Sync",
    description: "Google Calendar integration to coordinate health recommendations around your schedule.",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "No personal health data stored on servers. Your data stays yours.",
  },
  {
    icon: Brain,
    title: "Mood-Adaptive UI",
    description: "The interface adapts its look and feel to match your current emotional state.",
  },
  {
    icon: Heart,
    title: "Medical Awareness",
    description: "Tailored cautions based on your health conditions, allergies, and preferences.",
  },
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background gradient-mesh">
      {/* Nav */}
      <nav className="sticky top-0 z-50 glass">
        <div className="container mx-auto flex items-center justify-between px-6 py-4 max-w-6xl">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary fill-primary" />
            <span className="text-lg font-bold tracking-tight">PatientPulse</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
              Sign In
            </Button>
            <Button size="sm" onClick={() => navigate("/register")} className="glow-primary">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="container mx-auto max-w-6xl px-6 pt-20 pb-16">
        <div className="text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary mb-8">
              <Activity className="h-3.5 w-3.5" />
              Intelligent Health Coordination
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
              Your Daily{" "}
              <span className="text-primary glow-text">Health Pulse</span>
              <br />
              Powered by AI
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              PatientPulse synchronizes your calendar, weather, and health profile into personalized daily recommendations — exercise, nutrition, and safety alerts.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              size="lg"
              onClick={() => navigate("/register")}
              className="text-base px-8 glow-primary gap-2"
            >
              Start Free <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/login")}
              className="text-base px-8"
            >
              Sign In
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="container mx-auto max-w-6xl px-6 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything in <span className="text-primary">One Pulse</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            A unified view of your health, environment, and schedule — powered by AI to keep you at your best.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="group rounded-xl border border-border/50 bg-card/50 p-6 hover:border-primary/30 hover:bg-card/80 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-lg bg-primary/10 p-2.5 text-primary group-hover:glow-primary transition-all">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto max-w-6xl px-6 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-primary/20 bg-primary/5 p-10 md:p-16 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to take control of your health?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Join PatientPulse and get personalized, AI-driven health recommendations every day.
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/register")}
            className="text-base px-10 glow-primary gap-2"
          >
            Create Your Account <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50">
        <div className="container mx-auto max-w-6xl px-6 py-6 text-center">
          <p className="text-xs text-muted-foreground">
            PatientPulse — Your intelligent health coordination assistant. Not a substitute for professional medical advice.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
