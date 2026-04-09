import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Mail, Lock, User, Loader2, Plus, X, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { signInWithGoogleForCalendar } from "@/lib/google-calendar";

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Health profile inputs
  const [conditionInput, setConditionInput] = useState("");
  const [conditions, setConditions] = useState<string[]>([]);
  const [allergyInput, setAllergyInput] = useState("");
  const [allergies, setAllergies] = useState<string[]>([]);
  const [prefInput, setPrefInput] = useState("");
  const [preferences, setPreferences] = useState<string[]>([]);

  const addTag = (value: string, list: string[], setter: (v: string[]) => void, inputSetter: (v: string) => void) => {
    const trimmed = value.trim();
    if (trimmed && !list.includes(trimmed)) {
      setter([...list, trimmed]);
    }
    inputSetter("");
  };

  const removeTag = (value: string, list: string[], setter: (v: string[]) => void) => {
    setter(list.filter((t) => t !== value));
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password || password.length < 6) {
      toast({ title: "Invalid input", description: "Please provide a valid email and password (min 6 chars).", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { data: { display_name: name.trim() }, emailRedirectTo: window.location.origin },
    });
    if (error) {
      setLoading(false);
      toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
      return;
    }
    // If user confirmed immediately (auto-confirm) or session exists, save profile
    if (data.user) {
      await saveHealthProfile(data.user.id);
    }
    setLoading(false);
    if (data.session) {
      toast({ title: "Account created!", description: "You are now signed in." });
      navigate("/dashboard", { replace: true });
      return;
    }
    toast({ title: "Account created!", description: "Check your email to confirm your account before signing in." });
    navigate("/login", { replace: true });
  };

  const saveHealthProfile = async (userId: string) => {
    await supabase.from("health_profiles").upsert({
      user_id: userId,
      health_conditions: conditions,
      allergies,
      nutrition_preferences: preferences,
    }, { onConflict: "user_id" });
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const { error } = await signInWithGoogleForCalendar();
    if (error) {
      setGoogleLoading(false);
      toast({ title: "Google sign-up failed", description: error.message, variant: "destructive" });
      return;
    }
    // Redirect to Google, then /dashboard — save health profile after first load if needed.
  };

  const TagInput = ({
    label,
    placeholder,
    value,
    onChange,
    tags,
    onAdd,
    onRemove,
  }: {
    label: string;
    placeholder: string;
    value: string;
    onChange: (v: string) => void;
    tags: string[];
    onAdd: () => void;
    onRemove: (v: string) => void;
  }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="border-border/70 bg-background/70"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAdd();
            }
          }}
        />
        <Button type="button" variant="outline" size="icon" onClick={onAdd} className="border-border/80">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1 pr-1 bg-secondary border border-border/70">
              {tag}
              <button type="button" onClick={() => onRemove(tag)} className="ml-0.5 rounded-full hover:bg-muted p-0.5">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen warm-editorial warm-bg p-4 md:p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto w-full max-w-6xl">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="editorial-panel p-6 md:p-8 flex flex-col">
            <Link to="/" className="inline-flex items-center gap-2 mb-8 w-fit">
              <Heart className="h-7 w-7 text-primary" />
              <span className="text-xl font-semibold">HealthPulse</span>
            </Link>
            <p className="editorial-chip mb-5 w-fit">Personalized routines built around your day</p>
            <h1 className="editorial-heading text-5xl md:text-6xl mb-5">
              Start your HealthPulse journey.
            </h1>
            <p className="editorial-subtext text-base md:text-lg max-w-xl mb-8">
              Create your account in two simple steps: secure sign-up first, then optional health preferences for better recommendations.
            </p>
            <div className="editorial-image min-h-[260px] md:min-h-[360px] mt-auto">
              <img
                src="https://images.unsplash.com/photo-1474418397713-7ede21d49118?auto=format&fit=crop&w=1400&q=80"
                alt="Warm and calming wellness scene"
                loading="lazy"
              />
            </div>
          </section>

          <section className="editorial-panel p-6 md:p-8 lg:p-10">
            <h2 className="editorial-heading text-4xl mb-2">Create account</h2>
            <p className="editorial-subtext mb-4">
              {step === 1 ? "Step 1 of 2: account details" : "Step 2 of 2: health profile (optional)"}
            </p>
            <div className="flex items-center gap-2 mb-6">
              <div className={`h-2 w-12 rounded-full ${step >= 1 ? "bg-primary" : "bg-muted"}`} />
              <div className={`h-2 w-12 rounded-full ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
            </div>

          {step === 1 && (
            <>
              <Button
                variant="outline"
                className="w-full mb-6 gap-2 border-border/80 bg-card"
                onClick={handleGoogle}
                disabled={googleLoading}
              >
                {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                )}
                Continue with Google
              </Button>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 editorial-subtext">or use email</span>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!email.trim() || !password || password.length < 6) {
                    toast({ title: "Invalid input", description: "Email and password (min 6 chars) required.", variant: "destructive" });
                    return;
                  }
                  setStep(2);
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} className="pl-10 border-border/70 bg-background/70" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 border-border/70 bg-background/70" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="password" type="password" placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 border-border/70 bg-background/70" required minLength={6} />
                  </div>
                </div>
                <Button type="submit" className="w-full editorial-button">
                  Continue
                </Button>
              </form>
            </>
          )}

          {step === 2 && (
            <form onSubmit={handleSignUp} className="space-y-5">
              <TagInput
                label="Health Conditions"
                placeholder="e.g. Asthma, Diabetes"
                value={conditionInput}
                onChange={setConditionInput}
                tags={conditions}
                onAdd={() => addTag(conditionInput, conditions, setConditions, setConditionInput)}
                onRemove={(v) => removeTag(v, conditions, setConditions)}
              />
              <TagInput
                label="Allergies"
                placeholder="e.g. Peanuts, Pollen"
                value={allergyInput}
                onChange={setAllergyInput}
                tags={allergies}
                onAdd={() => addTag(allergyInput, allergies, setAllergies, setAllergyInput)}
                onRemove={(v) => removeTag(v, allergies, setAllergies)}
              />
              <TagInput
                label="Nutrition Preferences"
                placeholder="e.g. Vegan, Low-carb"
                value={prefInput}
                onChange={setPrefInput}
                tags={preferences}
                onAdd={() => addTag(prefInput, preferences, setPreferences, setPrefInput)}
                onRemove={(v) => removeTag(v, preferences, setPreferences)}
              />
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1 border-border/80" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button type="submit" className="flex-1 editorial-button" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Create Account
                </Button>
              </div>
              <button
                type="button"
                className="w-full text-sm editorial-subtext hover:text-foreground transition-colors"
                onClick={handleSignUp}
              >
                Skip for now →
              </button>
            </form>
          )}

          {step === 1 && (
            <div className="mt-6 rounded-xl border border-border/70 bg-secondary/40 p-3 text-sm editorial-subtext flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 mt-0.5 text-primary shrink-0" />
              <p>You can start quickly now and refine your health profile anytime from your dashboard.</p>
            </div>
          )}

          {step === 1 && (
            <p className="text-center text-sm editorial-subtext mt-6">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          )}
          </section>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
