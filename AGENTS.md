# AGENTS.md

## Project identity

This repository is a static GreenFair sustainability dashboard built from a Google Colab notebook.

The final product must be:
- stateless
- frontend-only
- responsive on phone, tablet, and desktop
- professional and elegant
- safe for public GitHub Pages deployment
- based on static JSON data generated at build time

## Environment

Development is done on Windows through WSL.

Use Linux paths only.

Preferred location:

```bash
~/code/greenfair-dashboard
```

Avoid working directly in:

```bash
/mnt/c/...
```

unless copying imported files.

## Tech stack

Use:

* React
* Vite
* TypeScript
* Tailwind CSS
* Recharts
* Framer Motion
* Lucide React
* Python scripts for data generation
* Static JSON for runtime data

Do not add:

* backend
* database
* authentication
* server-side API dependency at runtime

## Commands

Install/setup:

```bash
npm run setup
```

Development:

```bash
npm run dev
```

Full development with data watching:

```bash
npm run dev:full
```

Data generation:

```bash
npm run data:build
npm run data:validate
```

Validation:

```bash
npm run verify
```

Build:

```bash
npm run build
```

Preview:

```bash
npm run preview
```

Secret scan:

```bash
npm run secret:scan
```

## Data rules

The app must represent the GreenFair Score methodology clearly.

Countries:

* Tunisia
* Morocco
* Egypt, Arab Rep.
* Senegal
* Kenya
* Ethiopia
* India
* Bangladesh
* Viet Nam
* Brazil

Pillars:

* Environnement: 40%
* Social: 35%
* Économie: 25%

Negative indicators:

* CO2 par habitant
* Pollution PM2.5
* Inflation
* Chômage

These must be inverted during normalization.

Thresholds:

* score >= 70: Leader durable
* score >= 55: Potentiel solide
* score >= 40: Transition fragile
* otherwise: Priorité critique

Data-year labels:

* observed: real historical data up to 2023 when available
* extrapolated_scenario: 2024 and 2025
* projection_scenario: 2030

Never present extrapolated or projected data as official truth.

## Security rules

Never commit secrets.

Never expose:

* Gemini API keys
* OpenAI API keys
* Google API keys
* tokens
* credentials
* `.env` files with real values

The source notebook contained a hardcoded Gemini API key. Treat it as compromised. Do not copy it into the app. Add a README warning that the key must be rotated.

Frontend code must not call Gemini/OpenAI APIs.

Recommendations must be static/rule-based or precomputed.

Before finalizing work, run:

```bash
npm run secret:scan
```

## UI rules

The UI language is French.

Use clean academic/professional wording:

* Tableau de bord global
* Analyse par pays
* Comparaison
* Focus Tunisie
* Prévisions
* Clustering
* Méthodologie
* scénario extrapolé
* projection modèle
* données observées

Design:

* professional
* elegant
* dark navy / emerald / neutral palette
* responsive cards
* rounded 2xl corners
* subtle shadows
* strong spacing
* no clutter
* no childish visuals

Responsive expectations:

* Mobile: stacked cards, compact navigation, readable charts
* Tablet: 2-column grid where useful
* Desktop: sidebar + dashboard grid

Charts must use responsive containers and must not overflow badly on mobile.

## Engineering rules

Prefer small reusable components.

Centralize constants:

* countries
* indicators
* pillar weights
* thresholds
* colors
* labels

Centralize scoring logic in:

```txt
src/utils/scoring.ts
```

Centralize recommendation logic in:

```txt
src/utils/recommendations.ts
```

Use strong TypeScript types in:

```txt
src/types/greenfair.ts
```

Avoid duplicated threshold or formula logic.

Avoid magic numbers in components.

## Quality bar

Before final response, run:

```bash
npm run verify
```

This should execute:

* data build
* data validation
* typecheck
* lint
* production build
* secret scan

Fix errors before stopping.

If a command cannot run because of environment limitations, explain the exact reason and provide the closest manual command.

## Git / delivery expectations

Make commits only if asked.

Do not rewrite history unless asked.

Do not delete the notebook.

Do not delete generated data without regenerating it.

Final answer must include:

* created files
* important implementation choices
* commands to run
* validation result
* deployment notes
