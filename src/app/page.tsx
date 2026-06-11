"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { ConnectionState, Issue, SiteWalk, ToolCall, TranscriptEntry } from "@/lib/sitescribe-types";
import {
  BackgroundGrid,
  CommandBar,
  CurrentIssuePanel,
  ExportPanel,
  LandingView,
  PunchListPanel,
  ToolCallsPanel,
  TranscriptPanel,
} from "@/components/sitescribe-views";

const SYSTEM_PROMPT = `You are SiteScribe, a voice agent for construction site walks. Turn spoken site observations into structured punch list issues. Be concise. Ask only one missing-field question at a time. Each issue should capture location, defect, trade, priority, safety flag or blocked status, and due date if mentioned. Use tools to create or update issues. Do not pretend an issue was saved unless a tool succeeds. If the user corrects themselves, update the latest relevant issue. Use construction language naturally: snag, punch list, M&E, dryliner, HVAC, riser, plant room, fire stopping, containment, door closer, north wall, south wall, breakout area. Never create real legal, safety, or compliance claims. This is a draft site-walk record for human review.`;

const KEYTERMS = [
  "snag",
  "punch list",
  "M&E",
  "dryliner",
  "HVAC",
  "riser",
  "plant room",
  "fire stopping",
  "containment",
  "door closer",
  "breakout area",
  "north wall",
  "south wall",
  "blocked",
  "electrical",
  "carpentry",
  "plumbing",
  "practical completion",
];

const AGENT_TOOLS = [
  {
    type: "function",
    name: "start_site_walk",
    description: "Start a new site walk for a project.",
    parameters: {
      type: "object",
      properties: {
        project: { type: "string", description: "Project name" },
        floor: { type: "string", description: "Floor number or identifier" },
      },
      required: ["project"],
    },
  },
  {
    type: "function",
    name: "create_issue",
    description: "Create a new punch list issue.",
    parameters: {
      type: "object",
      properties: {
        location: { type: "string" },
        defect: { type: "string" },
        trade: { type: "string", enum: ["Electrical", "Carpentry", "Plumbing", "HVAC", "Drywall", "General"] },
        priority: { type: "string", enum: ["Low", "Medium", "High"] },
        safetyFlag: { type: "boolean" },
        blocked: { type: "boolean" },
        dueDate: { type: "string" },
        notes: { type: "array", items: { type: "string" } },
      },
    },
  },
  {
    type: "function",
    name: "update_issue",
    description: "Update an existing issue field.",
    parameters: {
      type: "object",
      properties: {
        issueId: { type: "number" },
        field: { type: "string" },
        value: { type: ["string", "boolean"] },
      },
      required: ["field", "value"],
    },
  },
  {
    type: "function",
    name: "mark_blocked",
    description: "Mark an issue as blocked for safety.",
    parameters: {
      type: "object",
      properties: { issueId: { type: "number" }, reason: { type: "string" } },
    },
  },
  {
    type: "function",
    name: "export_contractor_update",
    description: "Export a contractor update document.",
    parameters: { type: "object", properties: {} },
  },
];

export default function SiteScribe() {
  const [siteWalk, setSiteWalk] = useState<SiteWalk>({ status: "idle", issues: [] });
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [toolCalls, setToolCalls] = useState<ToolCall[]>([]);
  const [connection, setConnection] = useState<ConnectionState>("idle");
  const [currentIssueId, setCurrentIssueId] = useState<number | null>(null);
  const [exportMarkdown, setExportMarkdown] = useState("");
  const [elapsed, setElapsed] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const playbackContextRef = useRef<AudioContext | null>(null);
  const playbackTimeRef = useRef(0);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);
  const toolEndRef = useRef<HTMLDivElement | null>(null);

  const currentIssue = useMemo(
    () => siteWalk.issues.find((issue) => issue.id === currentIssueId) ?? null,
    [currentIssueId, siteWalk.issues]
  );

  const blockedCount = siteWalk.issues.filter((issue) => issue.blocked || issue.safetyFlag).length;
  const highPriorityCount = siteWalk.issues.filter((issue) => issue.priority === "High").length;
  const isConnected = connection === "connected";
  const isConnecting = connection === "connecting";

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [transcript]);

  useEffect(() => {
    toolEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [toolCalls]);

  useEffect(() => {
    if (!isConnected) return;
    setElapsed(0);
    const interval = setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => clearInterval(interval);
  }, [isConnected]);

  const startSiteWalk = useCallback((project: string, floor?: string) => {
    setSiteWalk((prev) => ({ ...prev, project, floor, status: "active" }));
    toast.success("Site Walk Started", { description: `${project}${floor ? `, Floor ${floor}` : ""}` });
    return `Site walk started for ${project}${floor ? `, floor ${floor}` : ""}`;
  }, []);

  const createIssue = useCallback(
    (args: Partial<Issue> & { trade?: string; priority?: string }) => {
      const newIssue: Issue = {
        id: siteWalk.issues.length + 1,
        location: args.location,
        defect: args.defect,
        trade: args.trade as Issue["trade"],
        priority: args.priority as Issue["priority"],
        safetyFlag: args.safetyFlag,
        blocked: args.blocked,
        dueDate: args.dueDate,
        notes: args.notes,
        status: "Open",
        createdAt: new Date(),
      };
      setSiteWalk((prev) => ({ ...prev, issues: [...prev.issues, newIssue] }));
      setCurrentIssueId(newIssue.id);
      toast.success(`Issue #${newIssue.id} Captured`, { description: args.defect || "New punch item added" });
      return `Issue #${newIssue.id} created`;
    },
    [siteWalk.issues.length]
  );

  const updateIssue = useCallback(
    (args: { issueId?: number; field: string; value: string | boolean }) => {
      const targetId = args.issueId ?? currentIssueId;
      if (!targetId) return "No active issue to update";

      setSiteWalk((prev) => ({
        ...prev,
        issues: prev.issues.map((issue) =>
          issue.id === targetId ? { ...issue, [args.field]: args.value, updatedAt: new Date() } : issue
        ),
      }));
      toast.info(`Issue #${targetId} Updated`, { description: `${args.field}: ${String(args.value)}` });
      return `Issue #${targetId} updated: ${args.field} = ${args.value}`;
    },
    [currentIssueId]
  );

  const markBlocked = useCallback(
    (args: { issueId?: number; reason?: string }) => {
      const targetId = args.issueId ?? currentIssueId;
      if (!targetId) return "No active issue to mark blocked";

      setSiteWalk((prev) => ({
        ...prev,
        issues: prev.issues.map((issue) =>
          issue.id === targetId
            ? {
                ...issue,
                blocked: true,
                safetyFlag: true,
                notes: [...(issue.notes || []), `Blocked: ${args.reason || "Safety concern"}`],
                updatedAt: new Date(),
              }
            : issue
        ),
      }));
      toast.warning(`Issue #${targetId} Blocked`, { description: args.reason || "Safety concern flagged" });
      return `Issue #${targetId} marked as blocked`;
    },
    [currentIssueId]
  );

  const exportContractorUpdate = useCallback(() => {
    if (siteWalk.issues.length === 0) {
      toast.error("No Issues To Export");
      return "No issues to export";
    }

    const grouped = siteWalk.issues.reduce<Record<string, Issue[]>>((acc, issue) => {
      const trade = issue.trade || "General";
      acc[trade] = [...(acc[trade] || []), issue];
      return acc;
    }, {});

    let markdown = "# Contractor Update\n\n";
    markdown += `**Project:** ${siteWalk.project || "Unknown"}\n`;
    if (siteWalk.floor) markdown += `**Floor:** ${siteWalk.floor}\n`;
    markdown += `**Generated:** ${new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date())}\n\n`;
    markdown += `**Total Issues:** ${siteWalk.issues.length}\n\n---\n\n`;

    Object.entries(grouped).forEach(([trade, issues]) => {
      markdown += `## ${trade}\n\n`;
      issues.forEach((issue) => {
        markdown += `- **${issue.location || "Unknown location"}**: ${issue.defect || "No description"}`;
        if (issue.priority) markdown += ` | Priority: ${issue.priority}`;
        if (issue.dueDate) markdown += ` | Due: ${issue.dueDate}`;
        if (issue.blocked) markdown += " | **BLOCKED**";
        markdown += "\n";
      });
      markdown += "\n";
    });

    setExportMarkdown(markdown);
    setSiteWalk((prev) => ({ ...prev, status: "exported" }));
    toast.success("Contractor Update Ready", { description: `${siteWalk.issues.length} issues compiled` });
    return "Contractor update exported";
  }, [siteWalk.floor, siteWalk.issues, siteWalk.project]);

  const handleToolCall = useCallback(
    (callId: string, name: string, args: Record<string, unknown>) => {
      let result = "";
      let status: ToolCall["status"] = "success";

      try {
        switch (name) {
          case "start_site_walk":
            result = startSiteWalk(args.project as string, args.floor as string | undefined);
            break;
          case "create_issue":
            result = createIssue(args);
            break;
          case "update_issue":
            result = updateIssue(args as { issueId?: number; field: string; value: string | boolean });
            break;
          case "mark_blocked":
            result = markBlocked(args as { issueId?: number; reason?: string });
            break;
          case "export_contractor_update":
            result = exportContractorUpdate();
            break;
          default:
            status = "error";
            result = `Unknown tool: ${name}`;
        }
      } catch (error) {
        status = "error";
        result = error instanceof Error ? error.message : "Unknown tool error";
      }

      setToolCalls((prev) => [...prev, { id: callId, tool: name, args, result, timestamp: new Date(), status }]);

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({ type: "tool.result", call_id: callId, tool_call_id: callId, output: result })
        );
      }
    },
    [createIssue, exportContractorUpdate, markBlocked, startSiteWalk, updateIssue]
  );

  const playAgentAudio = (base64Data: string) => {
    if (!playbackContextRef.current) {
      playbackContextRef.current = new AudioContext({ sampleRate: 24000 });
      playbackTimeRef.current = playbackContextRef.current.currentTime;
    }
    const ctx = playbackContextRef.current;
    const binary = atob(base64Data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    const samples = new Int16Array(bytes.buffer);
    const buffer = ctx.createBuffer(1, samples.length, 24000);
    const channel = buffer.getChannelData(0);
    for (let i = 0; i < samples.length; i += 1) channel[i] = samples[i] / 0x8000;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    const startAt = Math.max(ctx.currentTime, playbackTimeRef.current);
    source.start(startAt);
    playbackTimeRef.current = startAt + buffer.duration;
  };

  const flushAgentAudio = () => {
    if (playbackContextRef.current) {
      void playbackContextRef.current.close();
      playbackContextRef.current = null;
      playbackTimeRef.current = 0;
    }
  };

  const startAudioStreaming = (ws: WebSocket) => {
    if (!mediaStreamRef.current) return;

    const audioContext = new AudioContext({ sampleRate: 24000 });
    audioContextRef.current = audioContext;

    const source = audioContext.createMediaStreamSource(mediaStreamRef.current);
    const processor = audioContext.createScriptProcessor(2048, 1, 1);
    processorRef.current = processor;

    processor.onaudioprocess = (event) => {
      if (ws.readyState !== WebSocket.OPEN) return;

      const inputData = event.inputBuffer.getChannelData(0);
      const pcmData = new Int16Array(inputData.length);
      for (let index = 0; index < inputData.length; index += 1) {
        pcmData[index] = Math.max(-1, Math.min(1, inputData[index])) * 0x7fff;
      }

      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
      ws.send(JSON.stringify({ type: "input.audio", audio: base64Audio }));
    };

    source.connect(processor);
    processor.connect(audioContext.destination);
  };

  const stopAudioStreaming = () => {
    processorRef.current?.disconnect();
    processorRef.current = null;
    void audioContextRef.current?.close();
    audioContextRef.current = null;
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
    flushAgentAudio();
  };

  const connect = useCallback(async () => {
    setConnection("connecting");

    try {
      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });

      const tokenResponse = await fetch("/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!tokenResponse.ok) throw new Error("Token request failed. Check the server-side AssemblyAI key.");
      const { token } = await tokenResponse.json();
      const ws = new WebSocket(`wss://agents.assemblyai.com/v1/ws?token=${token}`);

      ws.onopen = () => {
        setConnection("connected");
        ws.send(
          JSON.stringify({
            type: "session.update",
            session: {
              system_prompt: SYSTEM_PROMPT,
              greeting: "SiteScribe is live. Start your walk when you are ready.",
              input: {
                format: { encoding: "audio/pcm" },
                keyterms: KEYTERMS,
                turn_detection: { vad_threshold: 0.5, min_silence: 200, max_silence: 1000, interrupt_response: true },
              },
              output: { voice: "james", format: { encoding: "audio/pcm" } },
              tools: AGENT_TOOLS,
            },
          })
        );
      };

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        switch (msg.type) {
          case "session.ready":
            sessionIdRef.current = msg.session_id;
            startAudioStreaming(ws);
            toast.success("Voice Session Ready", { description: "Microphone is live" });
            break;
          case "transcript.user": {
            const text = msg.text ?? "";
            setTranscript((prev) => [
              ...prev,
              {
                id: crypto.randomUUID(),
                speaker: "user",
                text,
                timestamp: new Date(),
                interrupted: /\b(wait|stop|correction|actually)\b/i.test(text),
              },
            ]);
            break;
          }
          case "transcript.agent":
            setTranscript((prev) => [
              ...prev,
              { id: crypto.randomUUID(), speaker: "agent", text: msg.text ?? "", timestamp: new Date() },
            ]);
            break;
          case "reply.audio":
            if (msg.data) playAgentAudio(msg.data);
            break;
          case "tool.call":
            handleToolCall(msg.call_id ?? msg.tool_call_id, msg.name, msg.arguments ?? {});
            break;
          case "reply.done":
            if (msg.status === "interrupted") {
              flushAgentAudio();
              toast.info("Correction Captured", { description: "Previous agent reply was interrupted" });
            }
            break;
          case "error":
            toast.error("Voice Agent Error", { description: msg.error || "Unknown error" });
            break;
        }
      };

      ws.onerror = () => {
        setConnection("error");
        toast.error("Connection Failed", { description: "Check the server key and try again" });
      };

      ws.onclose = () => {
        setConnection("idle");
        stopAudioStreaming();
      };

      wsRef.current = ws;
    } catch (error) {
      setConnection("error");
      stopAudioStreaming();
      toast.error("Could Not Start Voice Session", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }, [handleToolCall]);

  const disconnect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.send(JSON.stringify({ type: "Terminate" }));
    wsRef.current?.close();
    stopAudioStreaming();
    setConnection("idle");
  }, []);

  useEffect(() => () => disconnect(), [disconnect]);

  const downloadExport = () => {
    if (!exportMarkdown) return;
    const blob = new Blob([exportMarkdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `contractor-update-${siteWalk.project?.replace(/\s+/g, "-").toLowerCase() || "site-walk"}.md`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const sessionClock = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`;

  if (!isConnected && transcript.length === 0 && siteWalk.issues.length === 0) {
    return <LandingView connecting={isConnecting} onStart={connect} />;
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-zinc-950 text-zinc-100">
      <BackgroundGrid />

      <div className="relative z-10 mx-auto flex max-w-[1800px] flex-col gap-4 p-4 lg:p-6">
        <CommandBar
          siteWalk={siteWalk}
          sessionClock={sessionClock}
          blockedCount={blockedCount}
          highPriorityCount={highPriorityCount}
          isConnected={isConnected}
          isConnecting={isConnecting}
          onConnect={connect}
          onDisconnect={disconnect}
        />

        <section className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-4" aria-label="SiteScribe workspace">
          <TranscriptPanel transcript={transcript} isConnected={isConnected} endRef={transcriptEndRef} />
          <CurrentIssuePanel issue={currentIssue} />
          <PunchListPanel issues={siteWalk.issues} currentIssueId={currentIssueId} onSelect={setCurrentIssueId} />
          <ToolCallsPanel toolCalls={toolCalls} endRef={toolEndRef} />
        </section>

        {exportMarkdown && <ExportPanel markdown={exportMarkdown} onDownload={downloadExport} />}
      </div>
    </main>
  );
}
