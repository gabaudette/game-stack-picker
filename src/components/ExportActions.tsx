import { Copy, Download, Link, LoaderCircle } from "lucide-react";
import { useState } from "react";
import type { StackConfig } from "../domain/types";
import { buildPrompt, downloadBlob, pngBlob, svgBlob } from "../exports/export";
import { configSearch, errorMessage } from "../state/config";
import { Dialog } from "./Dialog";

export function ExportActions({ config }: { config: StackConfig }) {
  const [feedback, setFeedback] = useState("");
  const [fallback, setFallback] = useState("");
  const [pending, setPending] = useState(false);
  async function copy(text: string, success: string) {
    try {
      await navigator.clipboard.writeText(text);
      setFeedback(success);
    } catch (error) {
      setFeedback(`Clipboard unavailable: ${errorMessage(error)} You can copy the text manually.`);
      setFallback(text);
    }
  }
  async function download(format: "png" | "svg") {
    setPending(true);
    try {
      let blob = svgBlob(config);
      if (format === "png") {
        blob = await pngBlob(config);
      }
      downloadBlob(blob, `loadout-stack.${format}`);
      setFeedback(`${format.toUpperCase()} diagram downloaded.`);
    } catch (error) {
      setFeedback(`Export failed: ${errorMessage(error)}`);
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="export-actions">
      <button
        className="primary-button"
        type="button"
        onClick={() => copy(buildPrompt(config), "Project prompt copied.")}
      >
        <Copy /> Copy project prompt
      </button>
      <div className="download-buttons">
        <button
          className="secondary-button"
          type="button"
          disabled={pending}
          onClick={() => download("png")}
        >
          {pending && <LoaderCircle className="spin" />}
          {!pending && <Download />} PNG
        </button>
        <button
          className="secondary-button"
          type="button"
          disabled={pending}
          onClick={() => download("svg")}
        >
          <Download /> SVG
        </button>
      </div>
      <button
        className="share-button"
        type="button"
        onClick={() =>
          copy(
            `${window.location.origin}${window.location.pathname}${configSearch(config)}`,
            "Share link copied.",
          )
        }
      >
        <Link /> Copy share link
      </button>
      <p className="export-feedback" role="status">
        {feedback}
      </p>
      {fallback && (
        <Dialog title="Copy your text" onClose={() => setFallback("")}>
          <p>{feedback}</p>
          <textarea
            className="copy-fallback"
            aria-label="Text to copy"
            readOnly
            value={fallback}
            onFocus={(event) => event.target.select()}
          />
          <button className="secondary-button" type="button" onClick={() => setFallback("")}>
            Done
          </button>
        </Dialog>
      )}
    </div>
  );
}
