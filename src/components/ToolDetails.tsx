import { ExternalLink } from "lucide-react";
import type { Tool } from "../domain/types";
import { Dialog } from "./Dialog";
import { Logo } from "./Logo";

export function ToolDetails({ tool, onClose }: { tool: Tool; onClose: () => void }) {
  return (
    <Dialog title={tool.name} onClose={onClose}>
      <div className="detail-logo">
        <Logo id={tool.id} name={tool.name} />
      </div>
      <p>{tool.description}</p>
      <p className="detail-cost">{tool.cost}</p>
      {tool.note && <p className="notice">{tool.note}</p>}
      {tool.optional && (
        <p className="muted">Optional specialist tool. Add it when your project needs it.</p>
      )}
      <a className="primary-button" href={tool.url} target="_blank" rel="noreferrer">
        Official website <ExternalLink />
      </a>
      <p className="fine-print">
        Licensing and platform support can change. Confirm your project’s requirements with the
        vendor.
      </p>
    </Dialog>
  );
}
