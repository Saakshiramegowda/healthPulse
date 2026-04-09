import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MEDICAL_DISCLAIMER =
  "⚕️ This is an AI-generated suggestion, not medical advice. Consult your doctor for all clinical decisions.";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { context, mood, health_profile } = await req.json();

    if (!context || !mood) {
      return new Response(
        JSON.stringify({ error: "context and mood are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a medical care coordinator AI assistant for the PatientPulse health app. Your role is to provide wellness suggestions based on the user's context.

CRITICAL RULES:
- NEVER recommend specific medications or dosages
- NEVER diagnose conditions
- ALWAYS suggest consulting a healthcare provider for medical concerns
- Focus on general wellness: exercise, nutrition, and environmental safety
- Be empathetic and match your tone to the user's mood

You must respond using the suggest_recommendations tool.`;

    const userPrompt = `Current mood: ${mood}

Health profile:
- Conditions: ${health_profile?.health_conditions?.join(", ") || "None specified"}
- Allergies: ${health_profile?.allergies?.join(", ") || "None specified"}
- Nutrition preferences: ${health_profile?.nutrition_preferences?.join(", ") || "None specified"}

Environmental context:
- Weather: ${context.weather ? `${context.weather.temp}°C, ${context.weather.description}, humidity ${context.weather.humidity}%` : "Data unavailable"}
- Air Quality: ${context.air_quality ? `AQI ${context.air_quality.aqi} (${context.air_quality.category}), Pollen: ${context.air_quality.pollen_level || "Unknown"}` : "Data unavailable"}
- Upcoming events: ${context.calendar_events?.length > 0 ? context.calendar_events.slice(0, 3).map((e: any) => e.summary).join(", ") : "No upcoming events"}
- Environment lifestyle tips (already computed for the user): ${Array.isArray(context.lifestyle_tips) && context.lifestyle_tips.length > 0 ? context.lifestyle_tips.map((t: { headline: string }) => t.headline).join("; ") : "None"}

Align exercise/nutrition/caution with these conditions when sensible; do not contradict medical disclaimers.

Based on these parameters, suggest 1 exercise plan, 1 nutrition recommendation, and 1 safety/environmental caution.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_recommendations",
              description: "Return structured health recommendations for exercise, nutrition, and safety.",
              parameters: {
                type: "object",
                properties: {
                  exercise: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      description: { type: "string" },
                      duration: { type: "string" },
                      intensity: { type: "string", enum: ["low", "moderate", "high"] },
                    },
                    required: ["title", "description", "duration", "intensity"],
                  },
                  nutrition: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      description: { type: "string" },
                      foods: { type: "array", items: { type: "string" } },
                      meal_type: { type: "string" },
                    },
                    required: ["title", "description", "foods", "meal_type"],
                  },
                  caution: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      description: { type: "string" },
                      severity: { type: "string", enum: ["low", "moderate", "high"] },
                    },
                    required: ["title", "description", "severity"],
                  },
                  explanation: { type: "string" },
                },
                required: ["exercise", "nutrition", "caution", "explanation"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "suggest_recommendations" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await response.text();
      console.error("AI Gateway error:", response.status, errText);
      throw new Error(`AI Gateway returned ${response.status}`);
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      throw new Error("AI did not return structured recommendations");
    }

    let recommendations;
    try {
      recommendations = typeof toolCall.function.arguments === "string"
        ? JSON.parse(toolCall.function.arguments)
        : toolCall.function.arguments;
    } catch {
      throw new Error("Failed to parse AI recommendations");
    }

    return new Response(
      JSON.stringify({
        ...recommendations,
        disclaimer: MEDICAL_DISCLAIMER,
        generated_at: new Date().toISOString(),
        mood,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("Recommend function error:", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Unknown error",
        disclaimer: MEDICAL_DISCLAIMER,
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
