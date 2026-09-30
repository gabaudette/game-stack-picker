import { Check, Info, Plus } from "lucide-react";
import type { Tool } from "../domain/types";
import { Logo } from "./Logo";

export function ToolCard({
  tool,
  selected,
  onToggle,
  onDetails,
}: {
  tool: Tool;
  selected: boolean;
  onToggle: (id: string) => void;
  onDetails: (tool: Tool) => void;
}) {
  let className = "tool-card";
  let selectionLabel = `Select ${tool.name}`;
  let indicator = <Plus />;
  if (selected) {
    className += " selected";
    selectionLabel = `Remove ${tool.name}`;
    indicator = <Check />;
  }
  return (
    <article className={className}>
      <button
        className="card-select"
        type="button"
        aria-label={selectionLabel}
        aria-pressed={selected}
        onClick={() => onToggle(tool.id)}
      >
        <span className="card-top">
          <span className="logo-box">
            <Logo id={tool.id} name={tool.name} />
          </span>
          <span className="select-indicator">{indicator}</span>
        </span>
        <span className="card-name">{tool.name}</span>
        {tool.kind && <span className="foundation-kind">{tool.kind}</span>}
        <span className="card-description">{tool.description}</span>
      </button>
      <div className="card-footer">
        <span className="cost-label">{tool.cost}</span>
        <button
          type="button"
          className="icon-button details-button"
          aria-label={`Details about ${tool.name}`}
          onClick={() => onDetails(tool)}
        >
          <Info />
        </button>
      </div>
    </article>
  );
}
