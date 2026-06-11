"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Building2,
  Cable,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  Hammer,
  HardHat,
  ListChecks,
  Loader2,
  MapPin,
  Mic,
  ShieldAlert,
  Square,
  TerminalSquare,
  Waves,
  Wrench,
} from "lucide-react";
import type { Issue, SiteWalk, ToolCall, TranscriptEntry } from "@/lib/sitescribe-types";

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

function priorityDot(priority?: Issue["priority"]) {
  if (priority === "High") return "bg-red-400";
  if (priority === "Medium") return "bg-amber-400";
  if (priority === "Low") return "bg-emerald-400";
  return "bg-zinc-600";
}

function PriorityTag({ priority }: { priority?: Issue["priority"] }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900 px-2.5 py-0.5 text-xs font-medium text-zinc-300">
      <span className={cx("h-1.5 w-1.5 rounded-full", priorityDot(priority))} aria-hidden="true" />
      {priority || "Unset"}
    </span>
  );
}

export function BackgroundGrid() {
  return (
    <div className="pointer-events-none fixed inset-0" aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(249,115,22,0.08),transparent)] motion-reduce:bg-none" />
    </div>
  );
}

export function LandingView({ connecting, onStart }: { connecting: boolean; onStart: () => void }) {
  return (
    <main id="main-content" role="main" className="relative flex min-h-screen flex-col bg-zinc-950 text-zinc-100 antialiased">
      <BackgroundGrid />

      {/* Nav */}
      <nav aria-label="Primary navigation" className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-zinc-950">
            <HardHat className="h-4.5 w-4.5" aria-hidden="true" />
          </div>
          <span className="text-base font-semibold tracking-tight">SiteScribe</span>
        </div>
        <Button
          onClick={onStart}
          disabled={connecting}
          size="sm"
          variant="outline"
          aria-label={connecting ? "Connecting to voice session" : "Start a new site walk"}
          className="rounded-full border-zinc-800 bg-transparent text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100 focus-visible:ring-2 focus-visible:ring-orange-500/60"
        >
          {connecting ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : null}
          Start a walk
        </Button>
      </nav>

      {/* Hero */}
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-6 pb-24 pt-12 text-center">
        <h1 className="max-w-3xl text-balance text-5xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">
          The punch list that writes itself while you walk
        </h1>

        <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-zinc-400">
          Speak your site observations. SiteScribe structures them into issues with
          trades, priorities, and blockers — then hands you a contractor-ready report.
        </p>

        <div className="mt-10 flex items-center gap-4">
          <Button
            onClick={onStart}
            disabled={connecting}
            size="lg"
            aria-label={connecting ? "Connecting to voice session" : "Start site walk with microphone"}
            className="h-12 rounded-full bg-orange-500 px-7 text-base font-semibold text-zinc-950 transition-colors hover:bg-orange-400 focus-visible:ring-2 focus-visible:ring-orange-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
          >
            {connecting ? (
              <Loader2 className="mr-2.5 h-4.5 w-4.5 animate-spin" aria-hidden="true" />
            ) : (
              <Mic className="mr-2.5 h-4.5 w-4.5" aria-hidden="true" />
            )}
            {connecting ? "Connecting…" : "Start site walk"}
            {!connecting && <ArrowRight className="ml-2.5 h-4 w-4" aria-hidden="true" />}
          </Button>
        </div>

        <p className="mt-5 text-sm text-zinc-500">Works with your microphone. Nothing to configure.</p>

        {/* Feature row */}
        <div className="mt-24 grid w-full max-w-4xl gap-px overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-800/80 sm:grid-cols-3">
          {[
            {
              icon: <Waves className="h-5 w-5 text-orange-400" aria-hidden="true" />,
              title: "Speak naturally",
              body: "Hands-free capture with live transcription tuned for construction vocabulary.",
            },
            {
              icon: <ListChecks className="h-5 w-5 text-orange-400" aria-hidden="true" />,
              title: "Structured instantly",
              body: "Every observation becomes an issue with location, trade, priority, and flags.",
            },
            {
              icon: <FileText className="h-5 w-5 text-orange-400" aria-hidden="true" />,
              title: "Report on exit",
              body: "A contractor update grouped by trade, ready to download before you leave site.",
            },
          ].map((feature, index) => (
            <article
              key={feature.title}
              className="bg-zinc-950 p-6 text-left transition-transform duration-300 ease-out hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {feature.icon}
              <h2 className="mt-4 text-base font-semibold text-zinc-100">{feature.title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{feature.body}</p>
            </article>
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
    <header role="banner" className="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-xl border border-zinc-800/80 bg-zinc-900/60 px-4 py-2.5 backdrop-blur">
      <div className="flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-orange-500 text-zinc-950">
          <HardHat className="h-4 w-4" aria-hidden="true" />
        </div>
        <span className="text-sm font-semibold tracking-tight">SiteScribe</span>
      </div>

      <div className="hidden h-5 w-px bg-zinc-800 sm:block" aria-hidden="true" />

      <div className="flex flex-1 flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-zinc-400">
        <span className="inline-flex items-center gap-1.5">
          <Building2 className="h-4 w-4 text-zinc-500" aria-hidden="true" />
          <span className="font-medium text-zinc-100">{siteWalk.project || "No project"}</span>
          {siteWalk.floor && <span className="text-zinc-500">· Floor {siteWalk.floor}</span>}
        </span>
        <span className="inline-flex items-center gap-1.5 tabular-nums">
          <Clock3 className="h-4 w-4 text-zinc-500" aria-hidden="true" />
          {sessionClock}
        </span>
        <span className="inline-flex items-center gap-1.5 tabular-nums">
          <ListChecks className="h-4 w-4 text-zinc-500" aria-hidden="true" />
          {siteWalk.issues.length} {siteWalk.issues.length === 1 ? "issue" : "issues"}
        </span>
        {blockedCount > 0 && (
          <span className="inline-flex items-center gap-1.5 tabular-nums font-medium text-red-400">
            <ShieldAlert className="h-4 w-4" aria-hidden="true" />
            {blockedCount} blocked
          </span>
        )}
        {highPriorityCount > 0 && (
          <span className="inline-flex items-center gap-1.5 tabular-nums font-medium text-amber-400">
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            {highPriorityCount} high
          </span>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        {isConnected ? (
          <>
            <span className="inline-flex items-center gap-2 text-xs font-medium text-emerald-400" aria-live="polite">
              <LiveDot />
              Recording
            </span>
            <Button
              onClick={onDisconnect}
              size="sm"
              variant="outline"
              aria-label="End site walk session"
              className="h-8 rounded-full border-zinc-800 bg-transparent text-zinc-300 hover:border-red-900 hover:bg-red-950/40 hover:text-red-300 focus-visible:ring-2 focus-visible:ring-red-500/60"
            >
              <Square className="mr-1.5 h-3 w-3 fill-current" aria-hidden="true" />
              End walk
            </Button>
          </>
        ) : (
          <Button
            onClick={onConnect}
            disabled={isConnecting}
            size="sm"
            aria-label={isConnecting ? "Connecting to session" : "Resume recording"}
            className="h-8 rounded-full bg-orange-500 font-semibold text-zinc-950 hover:bg-orange-400 focus-visible:ring-2 focus-visible:ring-orange-500/60"
          >
            {isConnecting ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Mic className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
            )}
            Resume
          </Button>
        )}
      </div>
    </header>
  );
}

function LiveDot() {
  return (
    <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
      <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:animate-none" />
      <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400" />
    </span>
  );
}

export function ConsolePanel({
  title,
  icon,
  live,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  live?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/40" aria-label={title}>
      <header className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3">
        <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          <span className="text-zinc-500" aria-hidden="true">{icon}</span>
          {title}
        </h2>
        {live && (
          <span aria-live="polite" className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
            <LiveDot />
            <span className="sr-only">Live recording active</span>
          </span>
        )}
      </header>
      <div className="flex-1 p-3">{children}</div>
    </section>
  );
}

export function ConsoleEmpty({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div role="status" aria-live="polite" className="flex h-full min-h-56 flex-col items-center justify-center gap-3 text-center">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-500" aria-hidden="true">
        {icon}
      </div>
      <p className="max-w-[15rem] text-sm leading-6 text-zinc-500">{text}</p>
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
    <ConsolePanel title="Transcript" icon={<Mic className="h-3.5 w-3.5" aria-hidden="true" />} live={isConnected}>
      <ScrollArea className="h-[calc(100vh-220px)] min-h-[420px] pr-2" role="log" aria-label="Conversation transcript" aria-live="polite">
        {transcript.length === 0 ? (
          <ConsoleEmpty
            icon={<Waves className="h-4 w-4" aria-hidden="true" />}
            text={isConnected ? "Listening. Speak your first observation." : "Resume the session to continue."}
          />
        ) : (
          <div className="space-y-1">
            {transcript.map((entry, index) => (
              <article
                key={entry.id}
                ref={index === transcript.length - 1 ? endRef : undefined}
                className={cx(
                  "rounded-lg px-3 py-2.5 transition-all duration-200 ease-out motion-reduce:transition-none",
                  entry.speaker === "user" ? "bg-zinc-900/80" : "bg-transparent",
                  entry.interrupted && "ring-1 ring-inset ring-amber-500/30"
                )}
                aria-label={`${entry.speaker === "user" ? "You" : "SiteScribe"} at ${formatTime(entry.timestamp)}`}
              >
                <div className="mb-1 flex items-baseline justify-between gap-2">
                  <span
                    className={cx(
                      "text-xs font-semibold",
                      entry.speaker === "user" ? "text-orange-400" : "text-zinc-400"
                    )}
                  >
                    {entry.speaker === "user" ? "You" : "SiteScribe"}
                    {entry.interrupted && <span className="ml-2 font-normal text-amber-500">corrected</span>}
                  </span>
                  <span className="font-mono text-xs tabular-nums text-zinc-600">{formatTime(entry.timestamp)}</span>
                </div>
                <p className={cx("break-words text-sm leading-6", entry.speaker === "user" ? "text-zinc-100" : "text-zinc-400")}>
                  {entry.text}
                </p>
              </article>
            ))}
          </div>
        )}
      </ScrollArea>
    </ConsolePanel>
  );
}

export function CurrentIssuePanel({ issue }: { issue: Issue | null }) {
  return (
    <ConsolePanel title="Current issue" icon={<AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />}>
      <ScrollArea className="h-[calc(100vh-220px)] min-h-[420px] pr-2" role="region" aria-label="Current issue details">
        {issue ? (
          <div className="space-y-3">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="font-mono text-xs font-medium tabular-nums text-zinc-400">
                  Issue {String(issue.id).padStart(2, "0")}
                </span>
                <PriorityTag priority={issue.priority} />
              </div>

              <h3 className="text-pretty text-lg font-semibold leading-snug text-zinc-100">
                {issue.defect || "Capturing details…"}
              </h3>

              <dl className="mt-4 divide-y divide-zinc-800/80">
                <IssueField icon={<MapPin className="h-3.5 w-3.5" aria-hidden="true" />} label="Location" value={issue.location} />
                <IssueField icon={tradeIcon[issue.trade || "General"]} label="Trade" value={issue.trade} />
                <IssueField icon={<Clock3 className="h-3.5 w-3.5" aria-hidden="true" />} label="Due" value={issue.dueDate} />
              </dl>

              {(issue.blocked || issue.safetyFlag) && (
                <div className="mt-4 flex items-center gap-2 rounded-md border border-red-900/60 bg-red-950/40 px-3 py-2 text-sm font-medium text-red-300">
                  <ShieldAlert className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  Blocked — safety review required
                </div>
              )}
            </div>

            {issue.notes?.length ? (
              <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/30 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">Notes</p>
                <ul className="space-y-1.5 text-sm leading-6 text-zinc-300">
                  {issue.notes.map((note) => (
                    <li key={note} className="break-words">{note}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : (
          <ConsoleEmpty
            icon={<AlertTriangle className="h-4 w-4" aria-hidden="true" />}
            text="The issue being discussed appears here."
          />
        )}
      </ScrollArea>
    </ConsolePanel>
  );
}

function IssueField({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) {
  return (
    <div className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
      <dt className="flex w-24 shrink-0 items-center gap-2 text-xs font-medium text-zinc-400">
        <span className="text-zinc-500">{icon}</span>
        {label}
      </dt>
      <dd className={cx("min-w-0 break-words text-sm", value ? "font-medium text-zinc-100" : "text-zinc-500")}>
        {value || "—"}
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
    <ConsolePanel title="Punch list" icon={<ListChecks className="h-3.5 w-3.5" aria-hidden="true" />}>
      <ScrollArea className="h-[calc(100vh-220px)] min-h-[420px] pr-2" role="list" aria-label="Punch list items">
        {issues.length === 0 ? (
          <ConsoleEmpty
            icon={<ListChecks className="h-4 w-4" aria-hidden="true" />}
            text="Issues collect here as you walk."
          />
        ) : (
          <div className="space-y-2">
            {issues.map((issue) => (
              <button
                key={issue.id}
                type="button"
                onClick={() => onSelect(issue.id)}
                role="listitem"
                aria-current={currentIssueId === issue.id ? "true" : undefined}
                aria-label={`Issue ${issue.id}: ${issue.defect || "No description"}, ${issue.location || "Unknown location"}, ${issue.trade || "General trade"}, ${issue.priority || "No priority"} priority`}
                className={cx(
                  "w-full rounded-lg border p-3 text-left transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/60 motion-reduce:transition-none",
                  currentIssueId === issue.id
                    ? "border-orange-500/40 bg-orange-500/[0.06]"
                    : "border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-900 hover:border-zinc-700 hover:translate-x-0.5"
                )}
              >
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-medium tabular-nums text-zinc-500">
                    {String(issue.id).padStart(2, "0")}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {issue.blocked && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-400">
                        <ShieldAlert className="h-3 w-3" aria-hidden="true" />
                        Blocked
                      </span>
                    )}
                    <PriorityTag priority={issue.priority} />
                  </div>
                </div>
                <p className="line-clamp-2 text-sm font-medium leading-5 text-zinc-100">
                  {issue.defect || "No description"}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400">
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
    <ConsolePanel title="Activity" icon={<TerminalSquare className="h-3.5 w-3.5" aria-hidden="true" />}>
      <ScrollArea className="h-[calc(100vh-220px)] min-h-[420px] pr-2" role="log" aria-label="Activity log" aria-live="polite">
        {toolCalls.length === 0 ? (
          <ConsoleEmpty
            icon={<TerminalSquare className="h-4 w-4" aria-hidden="true" />}
            text="Agent actions are logged here."
          />
        ) : (
          <div className="space-y-2">
            {toolCalls.map((call, index) => (
              <article
                key={call.id}
                ref={index === toolCalls.length - 1 ? endRef : undefined}
                className="rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-3 transition-colors duration-200 ease-out hover:bg-zinc-900 motion-reduce:transition-none"
                aria-label={`${call.tool} ${call.status === "success" ? "succeeded" : "failed"} at ${formatTime(call.timestamp)}`}
              >
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 font-mono text-xs font-medium text-zinc-200">
                    {call.status === "success" ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
                    ) : (
                      <AlertTriangle className="h-3.5 w-3.5 text-red-400" aria-hidden="true" />
                    )}
                    {call.tool}
                  </span>
                  <span className="font-mono text-xs tabular-nums text-zinc-600">{formatTime(call.timestamp)}</span>
                </div>
                <p className="break-words text-xs leading-5 text-zinc-400">{call.result}</p>
              </article>
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
      className="overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/40"
      aria-label="Contractor update"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 px-4 py-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden="true" />
          Contractor update
        </h2>
        <Button
          onClick={onDownload}
          size="sm"
          aria-label="Download contractor update as markdown file"
          className="h-8 rounded-full bg-zinc-100 font-semibold text-zinc-950 hover:bg-white focus-visible:ring-2 focus-visible:ring-zinc-400"
        >
          <Download className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
          Download
        </Button>
      </div>
      <pre className="max-h-72 overflow-auto bg-zinc-950/60 p-4 font-mono text-xs leading-6 text-zinc-300" aria-label="Contractor update content" tabIndex={0}>
        <code>{markdown}</code>
      </pre>
    </section>
  );
}
