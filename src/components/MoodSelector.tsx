import { motion } from "framer-motion";
import type { Mood, MoodOption } from "@/types/health";
import { MOOD_OPTIONS } from "@/types/health";

interface MoodSelectorProps {
  selected: Mood;
  onSelect: (mood: Mood) => void;
}

export function MoodSelector({ selected, onSelect }: MoodSelectorProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold tracking-tight">How are you feeling?</h2>
      <div className="flex gap-2 flex-wrap">
        {MOOD_OPTIONS.map((option: MoodOption) => (
          <motion.button
            key={option.value}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(option.value)}
            className={`relative flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
              selected === option.value
                ? "bg-primary text-primary-foreground shadow-lg"
                : "bg-secondary text-secondary-foreground hover:bg-accent"
            }`}
          >
            <span className="text-xl">{option.emoji}</span>
            <span>{option.label}</span>
            {selected === option.value && (
              <motion.div
                layoutId="mood-indicator"
                className="absolute inset-0 rounded-full border-2 border-primary"
                transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
              />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
