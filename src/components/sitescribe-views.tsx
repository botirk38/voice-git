"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Activity,
  AlertTriangle,
  Building2,
  Cable,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Download,
  Flag,
  Hammer,
  HardHat,
  ListChecks,
  Loader2,
  MapPin,
  Mic,
  Radio,
  ShieldAlert,
  Square,
  TerminalSquare,
  Wrench,
  Zap,
} from "lucide-react";
import type { Issue, SiteWalk, ToolCall, TranscriptEntry } from "@/lib/sitescribe-types";

export const demoPrompts = [
  "Start site walk for Metaview office, floor eight.",
  "Kitchen, north wall, exposed cable near sink. Assign electrical. Priority high. Mark blocked.",
  "Wait, stop. Make it breakout area, not kitchen.",
  "Meeting room three, door closer missing, assign carpentry, medium priority, due Friday.",
  "Create contractor update.",
];

const tradeIcon: Record<string, React.ReactNode> = {
  Electrical: <Cable className="h-3.5 w-3.5" aria-hidden="true" />,
  Carpentry: <Hammer className="h-3.5 w-3.5" aria-hidden="true" />,
  Plumbing: <Wrench className="h-3.5 w-3.5" aria-hidden="true" />,
  HVAC: <Activity className="h-3.5 w-3.5" aria-hidden="true" />,
  Drywall: <Building2 className="h-3.5 w-3.5" aria-hidden="true" />,
  General: <HardHat className="h-3.5 w-3.5" aria-hidden="true" />,
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

function priorityStyles(priority?: Issue["priority"]) {
  if (priority === "High") return "border-red-500/40 bg-red-500/10 text-red-300";
  if (priority === "Medium") return "border-amber-500/40 bg-amber-500/10 text-amber-300";
  if (priority === "Low") return "border-emerald-500/40 bg-emerald-500/10 text-emerald-300";
  return "border-zinc-600/60 bg-zinc-800/60 text-zinc-400";
}

export function BackgroundGrid() {
  return (
    <div className="pointer-events-none fixed inset-0" aria-hidden="true">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(249,115,22,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(249,115,22,0.04)_1px,transparent_1px)] bg-[size:44px_44px]" />
      <div className="absolute left-1/2 top-[-20rem] h-[36rem] w-[60rem] -translate-x-1/2 rounded-full bg-orange-500/10 blur-3xl" />
      <div className="absolute bottom-[-18rem] right-[-10rem] h-[30rem] w-[30rem] rounded-full bg-emerald-500/[0.07] blur-3xl" />
    </div>
  );
}

export function LandingView({ connecting, onStart }: { connecting: boolean; onStart: () => void }) {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-zinc-950 text-zinc-100">
      <BackgroundGrid />
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.3em] text-orange-300">
          <HardHat className="h-3.5 w-3.5" aria-hidden="true" />
          Voice Agent for Site Walks
        </div>

        <h1 className="text-balance text-5xl font-black leading-[1.05] tracking-tight sm:text-7xl">
          Speak the site.
          <br />
          <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-orange-400 bg-clip-text text-transparent">
            Ship the punch list.
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-pretty text-lg leading-8 text-zinc-400">
          SiteScribe listens while you walk the floor and turns every observation into a structured,
          export-ready issue — locations, trades, priorities, blockers — in real time.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4">
          <Button
            onClick={onStart}
            disabled={connecting}
            size="lg"
            className="group h-16 rounded-full bg-orange-500 px-10 text-lg font-bold text-zinc-950 shadow-[0_0_60px_rgba(249,115,22,0.45)] transition-all hover:bg-orange-400 hover:shadow-[0_0_90px_rgba(249,115,22,0.6)]"
          >
            {connecting ? (
              <Loader2 className="mr-3 h-6 w-6 animate-spin" aria-hidden="true" />
            ) : (
              <Mic className="mr-3 h-6 w-6 transition-transform group-hover:scale-110" aria-hidden="true" />
            )}
            {connecting ? "Connecting…" : "Start Site Walk"}
          </Button>
          <p className="text-xs uppercase tracking-[0.25em] text-zinc-600">
            Mic on · Key loaded server-side · No setup
          </p>
        </div>

        <div className="mt-16 grid w-full gap-3 text-left sm:grid-cols-2 lg:grid-cols-5">
          {demoPrompts.map((prompt, index) => (
            <div
              key={prompt}
              className="group rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 backdrop-blur transition-colors hover:border-orange-500/50"
            >
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500/15 text-xs font-black tabular-nums text-orange-400">
                  {index + 1}
                </span>
                <ChevronRight className="h-3 w-3 text-zinc-600 transition-transform group-hover:translate-x-0.5 group-hover:text-orange-400" aria-hidden="true" />
              </div>
              <p className="text-xs leading-5 text-zinc-400 group-hover:text-zinc-200">“{prompt}”</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export function CommandBar({
  siteWalk,
  sessionClock,
  blockedCount,
  highPriorityCount,
  isConnected,
  isConnecting,
  onConnect,
  onDisconnect,
}: {
  siteWalk: SiteWalk;
  sessionClock: string;
  blockedCount: number;
  highPriorityCount: number;
  isConnected: boolean;
  isConnecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}) {
  return (
    <header className="flex flex-wrap items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/80 px-5 py-3 backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-zinc-950 shadow-[0_0_30px_rgba(249,115,22,0.4)]">
          <HardHat className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-lg font-black tracking-tight">SiteScribe</h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">Live Console</p>
        </div>
      </div>

      <div className="hidden h-8 w-px bg-zinc-800 sm:block" aria-hidden="true" />

      <div className="flex flex-1 flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <span className="inline-flex items-center gap-2 font-mono text-zinc-300">
          <Building2 className="h-4 w-4 text-zinc-500" aria-hidden="true" />
          {siteWalk.project || "—"}
          {siteWalk.floor && <span className="text-zinc-500">· Floor {siteWalk.floor}</span>}
        </span>
        <span className="inline-flex items-center gap-2 font-mono tabular-nums text-zinc-300">
          <Clock3 className="h-4 w-4 text-zinc-500" aria-hidden="true" />
          {sessionClock}
        </span>
        <span className="inline-flex items-center gap-2 font-mono tabular-nums text-zinc-300">
          <ListChecks className="h-4 w-4 text-zinc-500" aria-hidden="true" />
          {siteWalk.issues.length} issues
        </span>
        {blockedCount > 0 && (
          <span className="inline-flex items-center gap-2 font-mono tabular-nums text-red-400">
            <ShieldAlert className="h-4 w-4" aria-hidden="true" />
            {blockedCount} blocked
          </span>
        )}
        {highPriorityCount > 0 && (
          <span className="inline-flex items-center gap-2 font-mono tabular-nums text-amber-400">
            <Flag className="h-4 w-4" aria-hidden="true" />
            {highPriorityCount} high
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {isConnected ? (
          <>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-300">
              <LiveDot />
              LIVE
            </span>
            <Button onClick={onDisconnect} variant="destructive" size="sm" className="rounded-full font-bold">
              <Square className="mr-1.5 h-3.5 w-3.5 fill-current" aria-hidden="true" />
              End Walk
            </Button>
          </>
        ) : (
          <Button
            onClick={onConnect}
            disabled={isConnecting}
            size="sm"
            className="rounded-full bg-orange-500 font-bold text-zinc-950 hover:bg-orange-400"
          >
            {isConnecting ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Mic className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
            )}
            Reconnect
          </Button>
        )}
      </div>
    </header>
  );
}

function LiveDot() {
  return (
    <span className="relative flex h-2 w-2">
      <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" aria-hidden="true" />
      <span className="relative h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
    </span>
  );
}

export function ConsolePanel({
  title,
  icon,
  accent,
  live,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  accent: string;
  live?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur" aria-label={title}>
      <header className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
        <h2 className={cx("flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em]", accent)}>
          {icon}
          {title}
        </h2>
        {live && <LiveDot />}
      </header>
      <div className="p-3">{children}</div>
    </section>
  );
}

export function ConsoleEmpty({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-zinc-800 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-zinc-600">{icon}</div>
      <p className="max-w-[16rem] text-sm leading-6 text-zinc-600">{text}</p>
    </div>
  );
}

export function TranscriptPanel({
  transcript,
  isConnected,
  endRef,
}: {
  transcript: TranscriptEntry[];
  isConnected: boolean;
  endRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <ConsolePanel title="Live Transcript" icon={<Mic className="h-4 w-4" aria-hidden="true" />} accent="text-orange-400" live={isConnected}>
      <ScrollArea className="h-[calc(100vh-240px)] min-h-[420px] pr-3">
        {transcript.length === 0 ? (
          <ConsoleEmpty icon={<Radio className="h-5 w-5" aria-hidden="true" />} text="Listening… speak your first observation." />
        ) : (
          <div className="space-y-3">
            {transcript.map((entry, index) => (
              <div key={entry.id} ref={index === transcript.length - 1 ? endRef : undefined}>
                <div
                  className={cx(
                    "rounded-xl border p-3",
                    entry.speaker === "user" ? "border-orange-500/25 bg-orange-500/[0.07]" : "border-zinc-800 bg-zinc-900/70",
                    entry.interrupted && "border-amber-400/60 bg-amber-500/10"
                  )}
                >
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <span
                      className={cx(
                        "text-[10px] font-black uppercase tracking-[0.2em]",
                        entry.speaker === "user" ? "text-orange-400" : "text-zinc-500"
                      )}
                    >
                      {entry.speaker === "user" ? "Inspector" : "SiteScribe"}
                      {entry.interrupted && <span className="ml-2 text-amber-400">⟲ correction</span>}
                    </span>
                    <span className="font-mono text-[10px] tabular-nums text-zinc-600">{formatTime(entry.timestamp)}</span>
                  </div>
                  <p className="break-words text-sm leading-6 text-zinc-200">{entry.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </ConsolePanel>
  );
}

export function CurrentIssuePanel({ issue }: { issue: Issue | null }) {
  return (
    <ConsolePanel title="Current Issue" icon={<Zap className="h-4 w-4" aria-hidden="true" />} accent="text-amber-400">
      <ScrollArea className="h-[calc(100vh-240px)] min-h-[420px] pr-3">
        {issue ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <span className="font-mono text-3xl font-black tabular-nums text-zinc-600">
                  #{String(issue.id).padStart(2, "0")}
                </span>
                <Badge variant="outline" className={cx("border font-bold", priorityStyles(issue.priority))}>
                  {issue.priority || "Unset"}
                </Badge>
              </div>
              <h2 className="text-pretty text-xl font-black leading-snug text-zinc-50">
                {issue.defect || "Capturing details…"}
              </h2>

              <dl className="mt-5 space-y-3">
                <ConsoleField icon={<MapPin className="h-4 w-4" aria-hidden="true" />} label="Location" value={issue.location} />
                <ConsoleField icon={tradeIcon[issue.trade || "General"]} label="Trade" value={issue.trade} />
                <ConsoleField icon={<Clock3 className="h-4 w-4" aria-hidden="true" />} label="Due" value={issue.dueDate} />
              </dl>

              {(issue.blocked || issue.safetyFlag) && (
                <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2.5 text-sm font-bold text-red-300">
                  <ShieldAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
                  BLOCKED — safety review required
                </div>
              )}
            </div>

            {issue.notes?.length ? (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
                <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Notes</p>
                <ul className="space-y-1.5 text-sm leading-6 text-zinc-400">
                  {issue.notes.map((note) => (
                    <li key={note} className="break-words">— {note}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : (
          <ConsoleEmpty icon={<Zap className="h-5 w-5" aria-hidden="true" />} text="Speak a defect to open an issue card." />
        )}
      </ScrollArea>
    </ConsolePanel>
  );
}

function ConsoleField({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) {
  return (
    <div className="flex items-center gap-3">
      <dt className="flex w-24 shrink-0 items-center gap-2 text-[11px] font-black uppercase tracking-wider text-zinc-600">
        <span className="text-zinc-500">{icon}</span>
        {label}
      </dt>
      <dd className={cx("min-w-0 break-words text-sm font-bold", value ? "text-zinc-100" : "text-zinc-600")}>
        {value || "pending…"}
      </dd>
    </div>
  );
}

export function PunchListPanel({
  issues,
  currentIssueId,
  onSelect,
}: {
  issues: Issue[];
  currentIssueId: number | null;
  onSelect: (id: number) => void;
}) {
  return (
    <ConsolePanel
      title={`Punch List${issues.length ? ` · ${issues.length}` : ""}`}
      icon={<ListChecks className="h-4 w-4" aria-hidden="true" />}
      accent="text-emerald-400"
    >
      <ScrollArea className="h-[calc(100vh-240px)] min-h-[420px] pr-3">
        {issues.length === 0 ? (
          <ConsoleEmpty icon={<ListChecks className="h-5 w-5" aria-hidden="true" />} text="Issues stack here as you speak them." />
        ) : (
          <div className="space-y-2.5">
            {issues.map((issue) => (
              <button
                key={issue.id}
                type="button"
                onClick={() => onSelect(issue.id)}
                className={cx(
                  "w-full rounded-xl border p-3.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500",
                  currentIssueId === issue.id
                    ? "border-orange-500/50 bg-orange-500/[0.08]"
                    : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-600"
                )}
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-black tabular-nums text-zinc-500">
                    #{String(issue.id).padStart(2, "0")}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {issue.blocked && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-red-500/15 px-1.5 py-0.5 text-[10px] font-black uppercase text-red-400">
                        <ShieldAlert className="h-3 w-3" aria-hidden="true" />
                        Blocked
                      </span>
                    )}
                    <Badge variant="outline" className={cx("border text-[10px] font-bold", priorityStyles(issue.priority))}>
                      {issue.priority || "—"}
                    </Badge>
                  </div>
                </div>
                <p className="line-clamp-2 text-sm font-bold leading-5 text-zinc-100">{issue.defect || "No description"}</p>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-500">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" aria-hidden="true" />
                    {issue.location || "Unknown"}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    {tradeIcon[issue.trade || "General"]}
                    {issue.trade || "General"}
                  </span>
                  {issue.dueDate && (
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="h-3 w-3" aria-hidden="true" />
                      {issue.dueDate}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </ConsolePanel>
  );
}

export function ToolCallsPanel({
  toolCalls,
  endRef,
}: {
  toolCalls: ToolCall[];
  endRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <ConsolePanel title="Tool Calls" icon={<TerminalSquare className="h-4 w-4" aria-hidden="true" />} accent="text-sky-400">
      <ScrollArea className="h-[calc(100vh-240px)] min-h-[420px] pr-3">
        {toolCalls.length === 0 ? (
          <ConsoleEmpty icon={<TerminalSquare className="h-5 w-5" aria-hidden="true" />} text="Structured agent actions log here." />
        ) : (
          <div className="space-y-2 font-mono text-xs">
            {toolCalls.map((call, index) => (
              <div
                key={call.id}
                ref={index === toolCalls.length - 1 ? endRef : undefined}
                className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-3"
              >
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5">
                    {call.status === "success" ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                    ) : (
                      <AlertTriangle className="h-3.5 w-3.5 text-red-400" aria-hidden="true" />
                    )}
                    <span className="font-black text-sky-300">{call.tool}()</span>
                  </span>
                  <span className="tabular-nums text-zinc-600">{formatTime(call.timestamp)}</span>
                </div>
                <pre className="overflow-x-auto whitespace-pre-wrap break-words text-[11px] leading-5 text-zinc-500">
                  {JSON.stringify(call.args, null, 1)}
                </pre>
                <p className="mt-1 break-words text-[11px] text-emerald-300/80">→ {call.result}</p>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </ConsolePanel>
  );
}

export function ExportPanel({ markdown, onDownload }: { markdown: string; onDownload: () => void }) {
  return (
    <section
      className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.06] p-5 shadow-[0_0_60px_rgba(16,185,129,0.15)]"
      aria-label="Contractor update export"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-black text-emerald-300">
          <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          Contractor Update Ready
        </h2>
        <Button onClick={onDownload} className="rounded-full bg-emerald-500 font-bold text-zinc-950 hover:bg-emerald-400">
          <Download className="mr-2 h-4 w-4" aria-hidden="true" />
          Download Markdown
        </Button>
      </div>
      <pre className="max-h-72 overflow-auto rounded-xl border border-zinc-800 bg-zinc-950 p-4 font-mono text-xs leading-6 text-zinc-300">
        <code>{markdown}</code>
      </pre>
    </section>
  );
}
