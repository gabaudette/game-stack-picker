export type CategoryId =
  | "engine"
  | "code"
  | "art"
  | "animation"
  | "audio"
  | "network"
  | "backend"
  | "version"
  | "planning"
  | "testing"
  | "publish";
export type Platform = "desktop" | "web" | "mobile" | "console";
export type Dimension = "2d" | "3d";
export type Team = "solo" | "small" | "studio";
export type Experience = "beginner" | "intermediate" | "advanced";
export type Budget = "free" | "flexible" | "professional";
export type Multiplayer = "offline" | "local" | "online";
export type ArtStyle = "pixel" | "illustrated" | "stylized" | "realistic";
export type Answers = {
  dimension: Dimension;
  platforms: Platform[];
  team: Team;
  experience: Experience;
  budget: Budget;
  multiplayer: Multiplayer;
  art: ArtStyle;
  preferredEngine: string;
};
export type StackConfig = { version: number; picks: string[]; answers: Answers };
export type Category = { id: CategoryId; name: string; description: string; label: string };
export type Tool = {
  id: string;
  name: string;
  category: CategoryId;
  kind?: "engine" | "framework" | "library";
  mobileTargets?: ("android" | "ios")[];
  description: string;
  url: string;
  cost: string;
  free: boolean;
  tags: string[];
  engines?: string[];
  platforms?: Platform[];
  dimensions?: Dimension[];
  note?: string;
  optional?: boolean;
};
export type Warning = { toolId: string; message: string };
export type Recommendation = {
  engine: Tool | undefined;
  alternatives: Tool[];
  picks: string[];
  reasons: Map<string, string>;
  notices: string[];
};
