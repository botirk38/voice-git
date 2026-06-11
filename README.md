# SiteScribe

**Voice punch lists for construction site walks.**

Turn spoken site observations into structured punch list issues in real time using AssemblyAI's Voice Agent API.

## Demo Script

### Opening
> "Most voice agents are phone bots. I built one for people who are walking around doing real work. This is SiteScribe: voice punch lists for construction site walks."

### Command 1: Start Site Walk
**Say:** "Start site walk for Metaview office, floor eight."

**Expected UI:**
- Project: Metaview office
- Floor: 8
- Status: Active

### Command 2: Create Issue
**Say:** "Kitchen, north wall, exposed cable near sink. Assign electrical. Priority high. Mark blocked."

**Expected UI:**
- Issue #1 created
- Location: Kitchen, north wall
- Defect: Exposed cable near sink
- Trade: Electrical
- Priority: High
- Blocked: Yes

### Command 3: Interrupt and Correct
**Say:** "Wait, stop. Make it breakout area, not kitchen."

**Expected UI:**
- Issue #1 updated
- Location changes from "Kitchen" to "Breakout area"

### Command 4: Create Second Issue
**Say:** "Meeting room three, door closer missing, assign carpentry, medium priority, due Friday."

**Expected UI:**
- Issue #2 created
- Trade: Carpentry
- Priority: Medium
- Due: Friday

### Command 5: Export Contractor Update
**Say:** "Create contractor update."

**Expected Output:**
```markdown
# Contractor Update

**Project:** Metaview office
**Floor:** 8
**Generated:** [timestamp]

**Total Issues:** 2

---

## Electrical

- **Breakout area, north wall**: exposed cable near sink | Priority: High | **BLOCKED**

## Carpentry

- **Meeting room 3**: door closer missing | Priority: Medium | Due: Friday
```

### Closing
> "The point is not transcription. The point is turning a spoken site walk into structured operational work while the person is still walking."

## Setup

1. Get an AssemblyAI API key from [assemblyai.com/dashboard](https://www.assemblyai.com/dashboard)
2. Run the dev server:
   ```bash
   bun run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000)
4. Enter your API key and click "Connect"
5. Allow microphone access when prompted
6. Follow the demo script above

## Features

- **Real-time voice transcription** via AssemblyAI Voice Agent API
- **Structured issue creation** with location, defect, trade, priority
- **Live corrections** via interruption handling ("wait, stop")
- **Safety flagging** with blocked status
- **Contractor export** as markdown
- **4-panel UI**: Live Transcript | Current Issue | Punch List | Tool/Event Log

## Tech Stack

- Next.js 15 with App Router
- TypeScript
- Tailwind CSS
- shadcn/ui components
- AssemblyAI Voice Agent API

## Note

This is a hackathon demo. For production use:
- Store API keys server-side only
- Use proper authentication
- Add persistent storage
- Implement real contractor integrations
