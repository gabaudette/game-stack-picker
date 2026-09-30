import { ArrowRight, Sparkles } from "lucide-react";
import { categoryById, resolveTools } from "../domain/catalog";
import type { Recommendation } from "../domain/types";
import { Logo } from "./Logo";

export function RecommendationResults({
  result,
  onApply,
  onEdit,
  onAlternative,
}: {
  result: Recommendation;
  onApply: () => void;
  onEdit: () => void;
  onAlternative: (id: string) => void;
}) {
  return (
    <div className="recommendation-results">
      <span className="eyebrow">
        <Sparkles /> YOUR SUGGESTED LOADOUT
      </span>
      <h2>A starting point for your next game.</h2>
      <p className="muted">Curated rules, transparent choices. Make it your own in the picker.</p>
      {result.notices.map((notice) => (
        <p className="notice" key={notice}>
          {notice}
        </p>
      ))}
      <div className="recommended-list">
        {resolveTools(result.picks).map((tool) => (
          <div className="recommended-tool" key={tool.id}>
            <span className="logo-box">
              <Logo id={tool.id} name={tool.name} />
            </span>
            <div>
              <span className="fine-print">{categoryById.get(tool.category)?.name}</span>
              <h3>
                {tool.name}
                {tool.optional && <span className="optional-label">Optional</span>}
              </h3>
              <p>{result.reasons.get(tool.id)}</p>
            </div>
          </div>
        ))}
      </div>
      {result.alternatives.length > 0 && (
        <div className="alternatives">
          <h3>Other engines worth exploring</h3>
          <div>
            {result.alternatives.map((engine) => (
              <button
                className="secondary-button"
                type="button"
                key={engine.id}
                onClick={() => onAlternative(engine.id)}
              >
                {engine.name} <ArrowRight />
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="wizard-actions">
        <button className="secondary-button" type="button" onClick={onEdit}>
          Edit answers
        </button>
        <button
          className="primary-button"
          type="button"
          disabled={!result.engine}
          onClick={onApply}
        >
          Use this stack <ArrowRight />
        </button>
      </div>
    </div>
  );
}
