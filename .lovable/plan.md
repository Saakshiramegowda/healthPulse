

# PatientPulse — Full-Stack on Lovable Architecture

## Architecture Adaptation

| Original | Lovable Equivalent |
|---|---|
| Node/Express | Supabase Edge Functions |
| MongoDB | Supabase Postgres |
| Passport.js OAuth | Supabase Auth (Google OAuth) |
| Direct Gemini SDK | Lovable AI Gateway |

## Build Plan (API-First)

### 1. Database Setup
- **users** table: id, name (via Supabase Auth profile)
- **health_profiles** table: user_id (FK), health_conditions (text[]), allergies (text[]), nutrition_preferences (text[])
- RLS policies: users can only read/write their own profile

### 2. Edge Function: `/context`
- Accepts user's location (from frontend) and Google OAuth token
- Fetches Google Calendar events (next 7 days) via Google Calendar API
- Fetches weather + air quality via OpenWeatherMap API
- Returns merged context JSON — no calendar data stored

### 3. Edge Function: `/recommend`
- Accepts context object + user mood + health profile
- Calls Lovable AI Gateway (Gemini) with structured prompt
- Returns strict JSON: `{ exercise, nutrition, caution, explanation }`
- Includes medical disclaimer in every response
- Error handling for AI failures

### 4. Frontend — Mood-Adaptive Dashboard
- **Mood Selector**: Emoji-based, drives UI theme (warm/soft for "Low", vibrant for "Energetic")
- **Today's Context Card**: Calendar events + weather widget
- **Daily Plan**: 3 cards (Exercise, Nutrition, Safety) with Framer Motion transitions
- **Loading skeletons** while AI generates recommendations
- **Error states**: friendly fallbacks when APIs fail
- CSS variables shift based on mood state (calm slate/emerald default)

### 5. API Keys Required
- Google OAuth Client ID/Secret (for calendar access)
- OpenWeatherMap API key
- Ambee API key (pollen/air quality)
- Lovable AI Gateway handles Gemini — no separate key needed

### Build Order
1. Supabase tables + RLS
2. Edge functions (context → recommend)
3. Frontend pages with mock data
4. Wire frontend to edge functions
5. API key integration + testing

