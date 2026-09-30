import { AlertTriangle, Layers, X } from "lucide-react";
import { categories, resolveTools } from "../domain/catalog";
import { compatibilityWarnings } from "../domain/compatibility";
import type { StackConfig } from "../domain/types";
import { ExportActions } from "./ExportActions";

export function StackSummary({
  config,
  onRemove,
  onReset,
}: {
  config: StackConfig;
  onRemove: (id: string) => void;
  onReset: () => void;
}) {
  const selected = resolveTools(config.picks);
  const warnings = compatibilityWarnings(config.picks, config.answers);
  const occupied = new Set(selected.map((tool) => tool.category));
  return (
    <aside id="stack-summary" className="stack-summary" aria-labelledby="stack-title">
      <div className="stack-header">
        <div>
          <span className="eyebrow">YOUR BUILD</span>
          <h2 id="stack-title">
            The loadout <span>{selected.length}</span>
          </h2>
        </div>
        <Layers />
      </div>
      <div className="stack-meta">
        <span>{config.answers.dimension.toUpperCase()} project</span>
        <span>{config.answers.platforms.join(" + ")}</span>
      </div>
      <div className="stack-content">
        {selected.length === 0 && (
          <div className="stack-empty">
            <span className="empty-cube">
              <Layers />
            </span>
            <h3>
              A blank canvas.
              <br />A million possibilities.
            </h3>
            <p>Pick your first tool to start building your game-dev stack.</p>
            <span className="fine-print">SELECT A CARD TO ADD IT →</span>
          </div>
        )}
        {categories.map((category) => {
          const group = selected.filter((tool) => tool.category === category.id);
          if (group.length === 0) {
            return null;
          }
          return (
            <div className="stack-group" key={category.id}>
              <h3>{category.name}</h3>
              {group.map((tool) => (
                <div className="stack-item" key={tool.id}>
                  <span>{tool.name}</span>
                  <button
                    className="icon-button"
                    type="button"
                    aria-label={`Remove ${tool.name} from stack`}
                    onClick={() => onRemove(tool.id)}
                  >
                    <X />
                  </button>
                </div>
              ))}
            </div>
          );
        })}
      </div>
      {warnings.length > 0 && (
        <div className="compatibility-notes">
          <h3>
            <AlertTriangle /> Things to check
          </h3>
          {warnings.map((warning) => (
            <p key={`${warning.toolId}-${warning.message}`}>{warning.message}</p>
          ))}
        </div>
      )}
      <div className="stack-progress">
        <span>
          {occupied.size} of {categories.length} categories explored
        </span>
        <div className="category-progress" aria-hidden="true">
          {categories.map((category) => {
            let className = "category-dot";
            if (occupied.has(category.id)) {
              className += " filled";
            }
            return <span className={className} key={category.id} />;
          })}
        </div>
      </div>
      <ExportActions config={config} />
      <button type="button" className="reset-button" onClick={onReset}>
        Reset stack
      </button>
      <p className="stack-footnote">Saved on this device. Ready to share.</p>
    </aside>
  );
}
