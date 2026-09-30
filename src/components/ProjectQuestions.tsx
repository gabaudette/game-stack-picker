import { engines } from "../domain/catalog";
import type { Answers, Platform } from "../domain/types";

import { Options } from "./QuestionOptions";

const steps = {
  dimension: 0,
  platforms: 1,
  team: 2,
  experience: 3,
  budget: 4,
  multiplayer: 5,
  art: 6,
};

export function ProjectQuestions({
  step,
  answers,
  onChange,
}: {
  step: number;
  answers: Answers;
  onChange: (answers: Answers) => void;
}) {
  const update = <K extends keyof Answers>(key: K, value: Answers[K]) =>
    onChange({ ...answers, [key]: value });
  switch (step) {
    case steps.dimension:
      return (
        <Options
          options={[
            {
              value: "2d",
              label: "2D",
              description: "Sprites, tiles, illustrations, and side-scrollers",
            },
            {
              value: "3d",
              label: "3D",
              description: "Models, spatial worlds, and real-time rendering",
            },
          ]}
          selected={[answers.dimension]}
          onSelect={(value) => {
            if (value === "2d" || value === "3d") {
              update("dimension", value);
            }
          }}
        />
      );
    case steps.platforms: {
      const toggle = (value: string) => {
        const platform = answers.platforms.find((entry) => entry === value);
        if (platform) {
          if (answers.platforms.length > 1) {
            update(
              "platforms",
              answers.platforms.filter((entry) => entry !== value),
            );
          }
          return;
        }
        const all: Platform[] = ["desktop", "web", "mobile", "console"];
        const next = all.find((entry) => entry === value);
        if (next) {
          update("platforms", [...answers.platforms, next]);
        }
      };
      return (
        <Options
          options={[
            { value: "desktop", label: "Desktop", description: "Windows, macOS, and Linux" },
            { value: "web", label: "Browser", description: "Playable straight from a link" },
            { value: "mobile", label: "Mobile", description: "Android and iOS" },
            {
              value: "console",
              label: "Console",
              description: "Approved platform SDKs and porting access required",
            },
          ]}
          selected={answers.platforms}
          onSelect={toggle}
        />
      );
    }
    case steps.team:
      return (
        <Options
          options={[
            { value: "solo", label: "Solo developer", description: "Just you and a big idea" },
            { value: "small", label: "Small team", description: "A handful of collaborators" },
            {
              value: "studio",
              label: "Studio",
              description: "Multiple disciplines and production pipelines",
            },
          ]}
          selected={[answers.team]}
          onSelect={(value) => {
            if (value === "solo" || value === "small" || value === "studio") {
              update("team", value);
            }
          }}
        />
      );
    case steps.experience:
      return (
        <Options
          options={[
            {
              value: "beginner",
              label: "Getting started",
              description: "Approachable workflows and fewer moving parts",
            },
            {
              value: "intermediate",
              label: "Some experience",
              description: "Comfortable building and shipping projects",
            },
            {
              value: "advanced",
              label: "Experienced",
              description: "Ready for deeper tooling and custom workflows",
            },
          ]}
          selected={[answers.experience]}
          onSelect={(value) => {
            if (value === "beginner" || value === "intermediate" || value === "advanced") {
              update("experience", value);
            }
          }}
        />
      );
    case steps.budget:
      return (
        <Options
          options={[
            {
              value: "free",
              label: "Free first",
              description: "Prioritize open-source and no-cost options",
            },
            {
              value: "flexible",
              label: "A little flexibility",
              description: "Paid tools when they save meaningful time",
            },
            {
              value: "professional",
              label: "Production budget",
              description: "Invest in specialist and studio tooling",
            },
          ]}
          selected={[answers.budget]}
          onSelect={(value) => {
            if (value === "free" || value === "flexible" || value === "professional") {
              update("budget", value);
            }
          }}
        />
      );
    case steps.multiplayer:
      return (
        <Options
          options={[
            { value: "offline", label: "Single player", description: "An offline experience" },
            {
              value: "local",
              label: "Local multiplayer",
              description: "Same-device or couch play; no online backend",
            },
            {
              value: "online",
              label: "Online multiplayer",
              description: "Networking, player services, and architecture validation",
            },
          ]}
          selected={[answers.multiplayer]}
          onSelect={(value) => {
            if (value === "offline" || value === "local" || value === "online") {
              update("multiplayer", value);
            }
          }}
        />
      );
    case steps.art:
      return (
        <Options
          options={[
            {
              value: "pixel",
              label: "Pixel art",
              description: "Crisp sprites and a handcrafted look",
            },
            {
              value: "illustrated",
              label: "Illustrated",
              description: "Painted, drawn, or graphic worlds",
            },
            {
              value: "stylized",
              label: "Stylized 3D",
              description: "Expressive shapes and distinct materials",
            },
            {
              value: "realistic",
              label: "Realistic",
              description: "Detailed models and high-fidelity materials",
            },
          ]}
          selected={[answers.art]}
          onSelect={(value) => {
            if (
              value === "pixel" ||
              value === "illustrated" ||
              value === "stylized" ||
              value === "realistic"
            ) {
              update("art", value);
            }
          }}
        />
      );
    default:
      return (
        <Options
          options={[
            {
              value: "auto",
              label: "Find my fit",
              description: "Recommend from my project requirements",
            },
            ...engines.map((engine) => ({
              value: engine.id,
              label: engine.name,
              description: engine.cost,
            })),
          ]}
          selected={[answers.preferredEngine]}
          onSelect={(value) => {
            if (value === "auto" || engines.some((engine) => engine.id === value)) {
              update("preferredEngine", value);
            }
          }}
        />
      );
  }
}
