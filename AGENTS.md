# SiteScribe - Coding Agent Instructions

## Project Overview

SiteScribe is a voice-powered construction site walk application that turns spoken observations into structured punch lists using AssemblyAI's Voice Agent API.

## Tech Stack

- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Voice API:** AssemblyAI Voice Agent API

## Architecture

### Key Files

- `src/app/page.tsx` - Main application with 4-panel UI
- `src/app/api/token/route.ts` - Server route for AssemblyAI token generation
- `src/app/layout.tsx` - Root layout
- `src/app/globals.css` - Global styles

### State Management

All state is local (useState). No external state management library.

Key state:
- `siteWalk` - Current project, floor, status, and issues array
- `transcript` - Live conversation between user and agent
- `toolCalls` - Log of all tool invocations
- `currentIssueId` - Which issue is currently being viewed/edited
- `exportMarkdown` - Generated contractor update

### Tool System

Tools are implemented as local functions that update React state:

1. `start_site_walk(project, floor)` - Initialize a new site walk
2. `create_issue(args)` - Create a new punch list issue
3. `update_issue(args)` - Update an existing issue field
4. `mark_blocked(args)` - Mark issue as blocked for safety
5. `export_contractor_update()` - Generate markdown export

### Voice Integration

Uses AssemblyAI Voice Agent API via WebSocket:
- Server route (`/api/token`) generates temporary tokens
- Client connects to `wss://agents.assemblyai.com/v1/ws`
- Audio streamed via ScriptProcessorNode (16kHz PCM16)
- System prompt configured for construction domain
- Keyterms loaded for construction jargon

## Demo Flow

The application is designed for a specific 5-command demo:

1. "Start site walk for Metaview office, floor eight"
2. "Kitchen, north wall, exposed cable near sink. Assign electrical. Priority high. Mark blocked"
3. "Wait, stop. Make it breakout area, not kitchen" (interruption)
4. "Meeting room three, door closer missing, assign carpentry, medium priority, due Friday"
5. "Create contractor update"

## Adding Features

When modifying:
1. Keep the 4-panel layout (Transcript | Current Issue | Punch List | Tool Log)
2. Add new tools by extending the `handleToolCall` switch statement
3. Update the system prompt in the `connect` function if changing domain
4. Keyterms can be added to the `keyterms` array in session config

## Important Notes

- API key is entered client-side for demo only
- All data is in-memory (no persistence)
- WebSocket uses token-based auth (not headers)
- Audio processing uses deprecated ScriptProcessorNode (acceptable for demo)
