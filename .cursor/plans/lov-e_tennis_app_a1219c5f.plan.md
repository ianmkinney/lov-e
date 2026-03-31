---
name: lov-e Tennis App
overview: Build "lov-e", a full-featured Expo React Native tennis tracking app with camera recording, cloud AI shot/ball analysis (GPT-4o Vision), multi-phone linking via Supabase Realtime, agent-based call verification, and TTS announcements.
todos:
  - id: scaffold
    content: Scaffold Expo project with expo-router, install all dependencies (expo-camera, expo-av, expo-speech, supabase-js, zustand)
    status: completed
  - id: types-constants
    content: Define TypeScript types (FrameAnalysis, MatchEvent, MatchState, Room, etc.) and tennis constants (court dimensions, scoring)
    status: completed
  - id: navigation
    content: "Build all screens and tab/stack navigation: Home, Match Setup, Court Calibration, Live Match, Match Review, Link Create/Join, Settings"
    status: completed
  - id: camera-recording
    content: Implement CameraView component with video recording and periodic frame capture (takePictureAsync)
    status: completed
  - id: court-calibration
    content: Build court calibration screen where user taps 4 court corners, store coordinates
    status: completed
  - id: ai-service
    content: "Build frame analyzer service: send base64 frames + court corners to GPT-4o Vision, parse structured JSON response"
    status: completed
  - id: match-engine
    content: Implement tennis scoring state machine (points, games, sets, tiebreaks) and match event tracking
    status: completed
  - id: live-match-screen
    content: Build live match screen with camera, court overlay, scoreboard, shot badges, and real-time AI analysis loop
    status: completed
  - id: tts-announcer
    content: Implement TTS announcer service using expo-speech for in/out calls and shot announcements
    status: completed
  - id: supabase-setup
    content: Set up Supabase client, define database schema (matches, match_events, match_rooms), create migration SQL
    status: completed
  - id: multi-phone-linking
    content: Build room creation/joining flow with 6-char codes, Supabase Realtime channel subscription
    status: completed
  - id: agent-verification
    content: "Implement call verification consensus logic: compare both phones' AI calls, resolve disagreements, broadcast final call"
    status: completed
  - id: match-review
    content: Build match review screen with video playback, shot timeline, and event detail cards
    status: completed
  - id: settings-screen
    content: Build settings screen for API key entry, capture interval config, voice selection, and user profile
    status: completed
  - id: polish
    content: "UI polish: themed design (tennis green/white), animations, loading states, error handling, empty states"
    status: completed
isProject: false
---

# lov-e - AI Tennis Tracking App

## Architecture Overview

```mermaid
flowchart TB
    subgraph phone1 [Phone 1 - Player]
        cam1[Camera Recording]
        frame1[Frame Capture]
        tts1[TTS Announcer]
        agent1[AI Agent 1]
    end

    subgraph phone2 [Phone 2 - Opponent]
        cam2[Camera Recording]
        frame2[Frame Capture]
        tts2[TTS Announcer]
        agent2[AI Agent 2]
    end

    subgraph cloud [Cloud Services]
        gpt[GPT-4o Vision API]
        supa_rt[Supabase Realtime]
        supa_db[Supabase Database]
        supa_storage[Supabase Storage]
    end

    frame1 -->|"frames every ~2s"| gpt
    frame2 -->|"frames every ~2s"| gpt
    gpt -->|shot type, ball position| agent1
    gpt -->|shot type, ball position| agent2
    agent1 <-->|verify calls| supa_rt
    agent2 <-->|verify calls| supa_rt
    supa_rt --> tts1
    supa_rt --> tts2
    agent1 -->|match events| supa_db
    cam1 -->|video clips| supa_storage
    cam2 -->|video clips| supa_storage
```



## Tech Stack

- **Expo SDK 52** with Expo Router (file-based navigation)
- **expo-camera** for video recording and frame capture
- **expo-av** for video playback in match review
- **expo-speech** for TTS "in!" / "out!" announcements
- **@supabase/supabase-js** for auth, database, realtime channels, and video storage
- **OpenAI GPT-4o Vision** for frame analysis (shot detection, ball tracking, in/out calls)
- **TypeScript** throughout
- **Zustand** for client-side state management

## Screen Flow

```mermaid
flowchart LR
    home[Home] --> setup[Match Setup]
    home --> history[Match History]
    home --> settings[Settings]
    setup --> solo[Solo Mode]
    setup --> linked[Link Phone]
    linked --> createRoom[Create Room]
    linked --> joinRoom[Join Room]
    solo --> calibrate[Court Calibration]
    createRoom --> calibrate
    joinRoom --> calibrate
    calibrate --> live[Live Match]
    live --> review[Match Review]
```



## Project Structure

```
lov-e/
├── app/                           # Expo Router screens
│   ├── (tabs)/
│   │   ├── _layout.tsx            # Tab navigator
│   │   ├── index.tsx              # Home screen
│   │   ├── history.tsx            # Past matches
│   │   └── settings.tsx           # API keys, preferences
│   ├── match/
│   │   ├── setup.tsx              # Solo vs linked, match config
│   │   ├── calibrate.tsx          # Tap 4 court corners
│   │   ├── live.tsx               # Camera view + live AI overlay
│   │   └── [id].tsx               # Match review/replay
│   ├── link/
│   │   ├── create.tsx             # Generate room code
│   │   └── join.tsx               # Enter room code to join
│   └── _layout.tsx                # Root layout
├── components/
│   ├── CameraView.tsx             # Camera wrapper with frame capture
│   ├── CourtOverlay.tsx           # SVG overlay showing court lines
│   ├── ShotTimeline.tsx           # Timeline of tagged shots
│   ├── ScoreBoard.tsx             # Live score display
│   ├── LinkStatus.tsx             # Connection status indicator
│   └── EventBadge.tsx             # Forehand/backhand/in/out badge
├── services/
│   ├── ai/
│   │   ├── frameAnalyzer.ts       # Capture + send frames to GPT-4o
│   │   ├── prompts.ts             # System prompts for tennis analysis
│   │   └── callVerifier.ts        # Consensus logic between agents
│   ├── supabase/
│   │   ├── client.ts              # Supabase client init
│   │   ├── matchRoom.ts           # Create/join/leave rooms
│   │   └── realtimeSync.ts        # Broadcast + listen for events
│   ├── announcer.ts               # TTS wrapper for in/out calls
│   ├── matchEngine.ts             # Tennis scoring state machine
│   └── courtGeometry.ts           # Point-in-polygon for in/out math
├── stores/
│   └── matchStore.ts              # Zustand store for match state
├── types/
│   └── index.ts                   # All shared types
├── constants/
│   └── tennis.ts                  # Court dimensions, scoring rules
├── hooks/
│   ├── useFrameAnalysis.ts        # Hook for periodic frame analysis
│   ├── useMatchRoom.ts            # Hook for realtime room sync
│   └── useAnnouncer.ts            # Hook for TTS announcements
├── app.json
├── package.json
├── tsconfig.json
└── .env.example                   # EXPO_PUBLIC_SUPABASE_URL, etc.
```

## Key Implementation Details

### 1. Camera + Frame Capture

Use `expo-camera` to record video. Every ~2 seconds, capture a frame using `takePictureAsync()`, convert to base64, and send to the AI service. The frame rate is a tradeoff between responsiveness and API cost.

### 2. AI Analysis via GPT-4o Vision

Each captured frame is sent with a structured prompt that asks the model to return JSON:

```typescript
interface FrameAnalysis {
  shotDetected: boolean;
  shotType: 'forehand' | 'backhand' | 'serve' | 'volley' | 'overhead' | null;
  hitter: 'player' | 'opponent' | null;
  ballVisible: boolean;
  ballLanded: boolean;
  landingCall: 'in' | 'out' | null;
  confidence: number; // 0-1
  description: string;
}
```

The prompt will include the court calibration corners so the AI can reason about line calls relative to the visible court geometry.

### 3. Court Calibration

Before a match, the user taps the 4 corners of the court visible in their camera's field of view. These coordinates are stored and sent as context with every frame analysis request, giving the AI spatial reference for in/out decisions.

### 4. Multi-Phone Linking

- Phone A creates a match room (generates a 6-character code, stored in Supabase)
- Phone B enters the code to join
- Both subscribe to a Supabase Realtime channel named `match:{roomCode}`
- Each phone broadcasts its AI analysis events to the channel
- Each phone listens for the other's events

### 5. Agent Call Verification

When both phones are linked, each independently analyzes frames and makes calls. The `callVerifier` service implements consensus:

- **Both agree**: High confidence, announce immediately
- **Disagree**: Use confidence scores; higher confidence wins, or flag as "contested"
- Results are broadcast so both phones announce the same call

### 6. TTS Announcements

`expo-speech` speaks "In!" or "Out!" with configurable voice. On contested calls: "Out! ... Challenged." The announcements are triggered after agent verification completes.

### 7. Supabase Schema

- **profiles**: user settings, display name
- **matches**: match metadata (players, date, score, status)
- **match_events**: every detected shot/call (timestamp, type, player, call, confidence, frame_url)
- **match_rooms**: active linked sessions (room_code, host_id, guest_id, match_id)

### 8. Match Review

After a match, users can scrub through the recorded video. Shot tags appear on a timeline below the video. Tapping a tag jumps to that moment. Events are color-coded by type (forehand=blue, backhand=red, in=green, out=orange).

## Important Caveats

- **AI accuracy**: GPT-4o Vision analyzing 2fps snapshots from a single phone camera will not match Hawk-Eye. It works best for clear, well-lit courts with the phone mounted stably. We'll set expectations in the UI.
- **API cost**: Each frame analysis costs ~$0.01-0.03 depending on image size. A 1-hour match at 2fps = ~3,600 calls. We'll make the capture interval configurable and default to a practical rate.
- **Latency**: Vision API calls take 1-3 seconds. Calls won't be instantaneous but will be announced within a few seconds of a ball landing.

