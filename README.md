# SiteScribe

**Voice punch lists for construction site walks.**

SiteScribe is a real-time voice agent built on AssemblyAI's Voice Agent API. You walk the floor and talk; it turns every spoken observation into a structured, export-ready punch list issue — location, defect, trade, priority, blockers, due dates — while you're still walking.

## How It Works

- One WebSocket to `wss://agents.assemblyai.com/v1/ws` handles speech in **and** speech out (STT + LLM + TTS + turn detection + tool calling).
- The agent calls local tools (`start_site_walk`, `create_issue`, `update_issue`, `mark_blocked`, `export_contractor_update`) that update React state live.
- Barge-in is supported: interrupt the agent mid-sentence to correct an issue and its audio cuts off instantly.
- The API key never touches the browser — a server route mints short-lived session tokens from `.env`.

## Setup

1. Get an AssemblyAI API key from [assemblyai.com/dashboard](https://www.assemblyai.com/dashboard)
2. Create `.env` in the project root:
   ```
   ASSEMBLYAI_API_KEY=your_key_here
   ```
3. Install and run:
   ```bash
   bun install
   bun run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000), click **Start Site Walk**, and allow microphone access.

No key input in the UI — it's loaded server-side automatically.

## Demo Script

### Opening
> "Most voice agents are phone bots. I built one for people who are walking around doing real work. This is SiteScribe: voice punch lists for construction site walks."

### Command 1: Start Site Walk
**Say:** "Start site walk for Metaview office, floor eight."

**Expected:** Command bar shows *Metaview office · Floor 8*, session clock running.

### Command 2: Create Issue
**Say:** "Kitchen, north wall, exposed cable near sink. Assign electrical. Priority high. Mark blocked."

**Expected:** Issue #01 appears in Current Issue and Punch List — Electrical, High priority, BLOCKED banner.

### Command 3: Interrupt and Correct
**Say:** "Wait, stop. Make it breakout area, not kitchen."

**Expected:** Agent audio cuts off, Issue #01 location updates to "Breakout area", transcript flags the correction.

### Command 4: Create Second Issue
**Say:** "Meeting room three, door closer missing, assign carpentry, medium priority, due Friday."

**Expected:** Issue #02 — Carpentry, Medium, due Friday.

### Command 5: Export Contractor Update
**Say:** "Create contractor update."

**Expected:** Green export panel appears with markdown grouped by trade, ready to download:

```markdown
# Contractor Update

**Project:** Metaview office
**Floor:** 8

## Electrical

- **Breakout area, north wall**: exposed cable near sink | Priority: High | **BLOCKED**

## Carpentry

- **Meeting room 3**: door closer missing | Priority: Medium | Due: Friday
```

### Closing
> "The point is not transcription. The point is turning a spoken site walk into structured operational work while the person is still walking."

## Features

- **Speech in, speech out** — full-duplex voice agent with audio replies and barge-in interruption
- **Structured issue capture** — location, defect, trade, priority, due date, safety/blocked flags
- **Live corrections** — "wait, stop" updates the latest issue instead of creating a new one
- **Construction vocabulary** — keyterms boost for snag, M&E, dryliner, riser, fire stopping, and more
- **Contractor export** — markdown grouped by trade, one-click download
- **Live console UI** — Live Transcript | Current Issue | Punch List | Tool Calls, plus session metrics

## Project Structure

| Path | Purpose |
|---|---|
| `src/app/page.tsx` | Voice agent logic, audio streaming/playback, tool handlers |
| `src/components/sitescribe-views.tsx` | Landing view, command bar, the four console panels, export panel |
| `src/lib/sitescribe-types.ts` | Shared types (Issue, SiteWalk, ToolCall, …) |
| `src/app/api/token/route.ts` | Server route minting temp AssemblyAI tokens from `.env` |

## Tech Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- AssemblyAI Voice Agent API
- Bun

## Note

This is a hackathon demo. For production use:
- Add proper authentication and per-user sessions
- Add persistent storage for walks and issues
- Implement real contractor integrations (email, Procore, etc.)
