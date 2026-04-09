import { motion } from "framer-motion";
import { Heart, ArrowRight, CalendarClock, ShieldCheck, Sparkles, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const quickStats = [
  { value: "24/7", label: "Personalized daily guidance" },
  { value: "One View", label: "Weather, calendar, and wellness context" },
  { value: "Private", label: "Built with privacy-first health principles" },
];

const featureCards = [
  {
    icon: CalendarClock,
    title: "Calendar-aware planning",
    description: "HealthPulse adapts your day around your schedule, helping you place movement, meals, and rest realistically.",
  },
  {
    icon: Activity,
    title: "Context-aware wellbeing",
    description: "Each recommendation blends weather, mood, and your profile so daily suggestions fit how you feel.",
  },
  {
    icon: ShieldCheck,
    title: "Safe, supportive routines",
    description: "Clear cautions and practical tips help you make steadier decisions without information overload.",
  },
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen warm-editorial warm-bg">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-6 py-4 max-w-6xl">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold tracking-tight">HealthPulse</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
              Sign In
            </Button>
            <Button size="sm" onClick={() => navigate("/register")} className="editorial-button">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="container mx-auto max-w-6xl px-6 pt-14 pb-12">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-stretch">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="editorial-panel p-7 md:p-10 flex flex-col justify-between"
          >
            <div className="editorial-chip mb-6 w-fit">
              <Sparkles className="h-3.5 w-3.5" />
              Human-centered daily wellness companion
            </div>
            <h1 className="editorial-heading text-5xl md:text-7xl mb-5">
              Better health starts with a steady daily rhythm.
            </h1>
            <p className="editorial-subtext text-base md:text-lg mb-8 max-w-xl">
              HealthPulse combines your mood, environment, and calendar into simple routines you can follow through the day.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                onClick={() => navigate("/register")}
                className="text-base px-8 editorial-button gap-2"
              >
                Start with HealthPulse <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate("/login")}
                className="text-base px-8 border-border/80"
              >
                Existing user sign in
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="editorial-panel p-4"
          >
            <div className="editorial-image h-full min-h-[360px] md:min-h-[450px]">
              <img
                src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80"
                alt="Person meditating at sunrise"
                loading="lazy"
              />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto max-w-6xl px-6 pb-10">
        <div className="editorial-card p-6 md:p-8 grid gap-4 md:grid-cols-3">
          {quickStats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border/70 bg-background/70 p-4">
              <p className="editorial-heading text-3xl md:text-4xl text-primary">{stat.value}</p>
              <p className="editorial-subtext text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Section */}
      <section className="container mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <p className="editorial-chip mb-3">Why people choose HealthPulse</p>
          <h2 className="editorial-heading text-4xl md:text-5xl max-w-2xl">
            Thoughtful support for real-life health decisions.
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {featureCards.map((feature, i) => (
            <motion.article
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="editorial-card p-6"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-primary">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="editorial-heading text-2xl mb-2">{feature.title}</h3>
              <p className="editorial-subtext leading-relaxed">{feature.description}</p>
            </motion.article>
          ))}
        </div>
      </section>

      {/* Stories + CTA */}
      <section className="container mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="editorial-panel p-4">
            <div className="editorial-image h-[320px] md:h-[390px]">
              <img
                src="https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?auto=format&fit=crop&w=1200&q=80"
                alt="Supportive wellness consultation"
                loading="lazy"
              />
            </div>
          </div>

          <div className="editorial-panel p-7 md:p-10 flex flex-col justify-center">
            <p className="editorial-chip mb-4 w-fit">Built for consistency, not perfection</p>
            <h2 className="editorial-heading text-4xl md:text-6xl mb-4">
              “HealthPulse helped me stay balanced on my busiest weeks.”
            </h2>
            <p className="editorial-subtext text-base md:text-lg leading-relaxed mb-7">
              From weather-driven cautions to schedule-friendly routines, HealthPulse gives practical recommendations that feel achievable every day.
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/register")}
              className="w-fit text-base px-8 editorial-button gap-2"
            >
              Create your free account <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/80 mt-8">
        <div className="container mx-auto max-w-6xl px-6 py-6 text-center">
          <p className="text-xs editorial-subtext">
            HealthPulse provides supportive wellness insights and is not a substitute for professional medical advice.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
