export interface Issue {
  id: number;
  location?: string;
  defect?: string;
  trade?: "Electrical" | "Carpentry" | "Plumbing" | "HVAC" | "Drywall" | "General";
  priority?: "Low" | "Medium" | "High";
  safetyFlag?: boolean;
  blocked?: boolean;
  dueDate?: string;
  notes?: string[];
  status: "Open" | "Closed";
  createdAt: Date;
  updatedAt?: Date;
}

export interface SiteWalk {
  project?: string;
  floor?: string;
  status: "idle" | "active" | "exported";
  issues: Issue[];
}

export interface TranscriptEntry {
  id: string;
  speaker: "user" | "agent";
  text: string;
  timestamp: Date;
  interrupted?: boolean;
}

export interface ToolCall {
  id: string;
  tool: string;
  args: Record<string, unknown>;
  result?: string;
  timestamp: Date;
  status: "success" | "error";
}

export type ConnectionState = "idle" | "connecting" | "connected" | "error";
