# Home Monitor

A wall-mounted kiosk dashboard for a front-door tablet: weather, real-time electricity pricing, CTA transit arrivals, and Home Assistant controls, all on one always-on screen.

Built with SvelteKit 2 / Svelte 5 and Tailwind CSS v4, in a flat, monospace "System Signage" style modeled on transit and departure-board displays.

## Features

- **Weather** — current conditions and a 5-day forecast via Open-Meteo, with flat vector icons.
- **Leaving-soon banner** — a status line that watches the next couple of hours of forecast and current conditions, and only speaks up when there's something to grab (umbrella, jacket, water) or a real advisory (storms, freezing temps). Shows a quiet "clear conditions" status otherwise.
- **Electric price** — real-time ComEd hourly pricing with a rolling sparkline and cheap/normal/expensive tiering.
- **Transit** — CTA bus and train arrivals for configured stops/stations, color-coded by line, with rail service alerts and a tap-through station detail view.
- **Home Assistant controls** — every HA entity type, not just the "controllable" ones, with a visibility picker and manual reordering. Lights get custom hue/saturation sliders, climate entities get a numeric keypad, vacuums get a dedicated modal.
- **PIN-gated control** — Home Assistant control actions are locked behind an on-screen keypad and a PIN/PSK stored only in an environment variable. Unauthenticated requests never receive HA data, not just a blocked UI.
- **Touch-first UI** — designed for a always-on touchscreen: tap-outside-to-close modals, long-press interactions, no cursor-dependent affordances.

## Getting started

Requires Node 22.

```sh
npm install
cp .env.example .env   # fill in your HA/CTA/weather config
npm run dev
```

### Configuration

All configuration is via environment variables (see `.env.example`):

| Variable                                      | Description                                                                                |
| --------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `HA_BASE_URL`                                 | Base URL of your Home Assistant instance                                                   |
| `HA_TOKEN`                                    | Home Assistant long-lived access token                                                     |
| `CTA_TRAINTRACKER_KEY` / `CTA_BUSTRACKER_KEY` | CTA API keys                                                                               |
| `CTA_TRAIN_STATIONS` / `CTA_BUS_STOPS`        | Comma-separated station/stop IDs to display                                                |
| `WEATHER_LOCATION`                            | `lat,lon` for Open-Meteo                                                                   |
| `HA_CONTROL_SECRET`                           | PIN/PSK required to unlock Home Assistant controls. Leave unset to keep controls disabled. |

### Scripts

- `npm run dev` — start the dev server
- `npm run build` / `npm run preview` — production build and preview
- `npm run check` — type-check
- `npm run lint` / `npm run format` — Prettier + ESLint

## Deployment

A multi-stage `Dockerfile` and `docker-compose.yml` are included. The production build (`@sveltejs/adapter-node`) is fully self-contained — the runtime image needs only Node itself, no `node_modules`.

```sh
docker compose up -d --build
```

## AI usage disclosure

This project was built collaboratively with Claude Code as a learning exercise — an exploration of what AI-assisted development looks like in practice for a real, self-hosted app, not just toy examples. Claude wrote the majority of the code under direction: architecture and feature decisions, API integrations, the authentication design, and the visual design direction were all reviewed, steered, and iterated on by a human throughout, rather than generated once and accepted as-is. If you're reading this code to learn from it, know that it went through many rounds of correction and refinement rather than landing right the first time — that iteration was itself part of the point of building it this way.
