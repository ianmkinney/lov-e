# lov-e

**AI line judge in your pocket** — an [Expo](https://expo.dev/) (React Native) app that points the camera at a tennis court, analyzes frames with vision AI, and announces shot types and in/out calls. You can play solo or link two phones for shared “match room” coordination via Supabase.

> This is not a replacement for professional line-calling systems (e.g. Hawk-Eye). It works best with a steady mount and a clear view of the court.

## Features

- **Solo mode** — One device on court; AI analyzes your camera feed.
- **Linked mode** — Host creates a 6-character room code; the other phone joins. Realtime sync through Supabase for dual-device workflows.
- **Court calibration** — Tap four corners so the overlay aligns with the court (landscape orientation on device).
- **Live match** — Camera + court overlay, scoreboard, events, optional announcer (speech).
- **Match history** — Persisted locally (AsyncStorage) for past sessions.
- **Settings** — API keys, capture interval, and other tuning (see in-app).

## Tech stack

| Area | Choice |
|------|--------|
| App framework | Expo SDK 54, React 19, React Native 0.81 |
| Navigation | [Expo Router](https://docs.expo.dev/router/introduction/) (file-based routes) |
| State | [Zustand](https://github.com/pmndrs/zustand) |
| Backend (optional) | [Supabase](https://supabase.com/) — Postgres + Realtime for `match_rooms` and related data |
| AI | OpenAI API (Vision) — key via env or Settings |
| Camera | `expo-camera` |

## Requirements

- **Node.js** 18+ (LTS recommended)
- **npm** (project uses `package-lock.json`)
- For physical devices: **iOS** or **Android** with camera; Expo Go or a [development build](https://docs.expo.dev/develop/development-builds/introduction/)

## Quick start

```bash
git clone https://github.com/ianmkinney/lov-e.git
cd lov-e
npm install
```

### Environment variables

Copy the example file and fill in values:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|----------|----------|-------------|
| `EXPO_PUBLIC_SUPABASE_URL` | For linked rooms / cloud sync | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | With URL above | Supabase anonymous key |
| `EXPO_PUBLIC_OPENAI_API_KEY` | Optional | Default OpenAI key for Vision; can also be set in the app Settings |

> Variables prefixed with `EXPO_PUBLIC_` are embedded at build time. Do not put secrets you need to keep private on the server in these keys unless you understand the tradeoffs.

### Supabase database

If you use Supabase, apply the SQL migration so tables and policies exist:

- File: [`supabase/migrations/20260330000000_initial.sql`](supabase/migrations/20260330000000_initial.sql)

Run it in the Supabase SQL Editor or via the [Supabase CLI](https://supabase.com/docs/guides/cli). The migration includes `profiles`, `matches`, `match_events`, and `match_rooms`. **RLS is enabled with permissive demo policies** — replace with `auth.uid()`-based policies before production.

### Run the app

```bash
npm start
```

Then press `i` (iOS simulator), `a` (Android emulator), or scan the QR code with Expo Go.

| Script | Command |
|--------|---------|
| Dev server | `npm start` |
| Tunnel (e.g. remote device testing) | `npm run start:tunnel` |
| iOS | `npm run ios` |
| Android | `npm run android` |
| Web | `npm run web` |

## Project layout (high level)

```
app/                 # Expo Router screens (tabs, match flow, link/join)
components/          # UI (camera, court overlay, scoreboard, etc.)
constants/           # Theme, tennis constants
hooks/               # Match room, frame analysis, announcer, etc.
lib/                 # Local storage helpers
services/            # AI, Supabase, match engine, court geometry
stores/              # Zustand match store
supabase/migrations/ # SQL schema
types/               # Shared TypeScript types
```

## Orientation

Court calibration and live match screens use **landscape** (`orientation: 'landscape'` in the stack) so the phone matches how you film the court.

## Troubleshooting

- **Supabase “relation does not exist”** — Run the migration in the SQL Editor against the same project as your `.env` URL.
- **OpenAI errors** — Confirm the key in `.env` or Settings; check quota and model access.
- **Camera permission** — Grant camera (and microphone if recording) in system settings.

## License

This project is private unless you add a public license file. Add a `LICENSE` if you open-source the repo.

## Contributing

Fork and open a pull request, or use issues on GitHub for bugs and feature ideas.
