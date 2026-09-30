import { ArrowUpRight, Check, Gamepad2, Github, Layers, Sparkles } from "lucide-react";
import { useState } from "react";
import { Catalog } from "./components/Catalog";
import { Dialog } from "./components/Dialog";
import { GuidedPicker } from "./components/GuidedPicker";
import { StackSummary } from "./components/StackSummary";
import { ToolDetails } from "./components/ToolDetails";
import { categories, tools } from "./domain/catalog";
import type { Tool } from "./domain/types";
import { useStack } from "./state/use-stack";

export function App({ initialNotices }: { initialNotices: string[] }) {
  const stack = useStack();
  const [mode, setMode] = useState("browse");
  const [details, setDetails] = useState<Tool | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [dismissedNotices, setDismissedNotices] = useState(false);
  const notices = [...stack.notices];
  if (!dismissedNotices) {
    notices.push(...initialNotices);
  }
  if (stack.storageError) {
    notices.push(stack.storageError);
  }
  if (stack.updateError) {
    notices.push(stack.updateError);
  }
  return (
    <>
      <a className="skip-link" href="#picker">
        Skip to picker
      </a>
      <header className="site-header">
        <a className="brand" href="/" aria-label="Loadout home">
          <span className="brand-mark">
            <Gamepad2 />
          </span>
          <span>
            loadout<span className="brand-dot">.</span>
          </span>
        </a>
        <div className="header-right">
          <span className="header-label">A TOOLKIT FOR GAME MAKERS</span>
          <a
            className="github-link"
            href="https://github.com/gabaudette/game-stack-picker"
            target="_blank"
            rel="noreferrer"
            aria-label="Source on GitHub"
          >
            <Github />
            <span>Open source</span>
            <ArrowUpRight />
          </a>
        </div>
      </header>
      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="live-dot" /> PICK YOUR TOOLS. BUILD YOUR WORLD.
            </span>
            <h1 id="hero-title">
              Great games start
              <br />
              with the <span>right tools.</span>
            </h1>
            <p>
              Build a game-dev stack that’s yours. Explore the tools,
              <br className="desktop-break" /> find your fit, and turn that next big idea into
              something playable.
            </p>
            <div className="hero-features">
              <span>
                <Check /> No signup
              </span>
              <span>
                <Check /> Curated, not generated
              </span>
              <span>
                <Check /> Free to explore
              </span>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="art-grid" />
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="hero-tile tile-code">&lt;/&gt;</div>
            <div className="hero-tile tile-engine">
              <Gamepad2 />
            </div>
            <div className="hero-tile tile-art">
              <Layers />
            </div>
            <span className="art-coordinate coordinate-one">PLAYER_01</span>
            <span className="art-coordinate coordinate-two">READY TO BUILD</span>
            <span className="art-plus">+</span>
          </div>
        </section>
        <div className="workspace" id="picker">
          <div className="picker-main">
            <div className="mode-toolbar">
              <nav className="mode-tabs" aria-label="Picker mode">
                <button
                  type="button"
                  aria-pressed={mode === "browse"}
                  onClick={() => setMode("browse")}
                >
                  <Layers /> Build your stack
                </button>
                <button
                  type="button"
                  aria-pressed={mode === "guided"}
                  onClick={() => setMode("guided")}
                >
                  <Sparkles /> Help me choose
                </button>
              </nav>
              <span className="catalog-caption">
                {tools.length} TOOLS / {categories.length} CATEGORIES
              </span>
            </div>
            {notices.length > 0 && (
              <div className="state-notices" role="alert">
                {[...new Set(notices)].map((notice) => (
                  <p key={notice}>{notice}</p>
                ))}
                {initialNotices.length > 0 && !dismissedNotices && (
                  <button type="button" onClick={() => setDismissedNotices(true)}>
                    Dismiss restoration notice
                  </button>
                )}
              </div>
            )}
            {mode === "browse" && (
              <Catalog picks={stack.config.picks} onToggle={stack.toggle} onDetails={setDetails} />
            )}
            {mode === "guided" && (
              <GuidedPicker
                initialAnswers={stack.config.answers}
                hasPicks={stack.config.picks.length > 0}
                onApply={(picks, answers) => {
                  stack.apply(picks, answers);
                  setMode("browse");
                }}
              />
            )}
          </div>
          <StackSummary
            config={stack.config}
            onRemove={stack.toggle}
            onReset={() => setResetOpen(true)}
          />
        </div>
      </main>
      <a className="mobile-stack-shortcut" href="#stack-summary">
        <Layers /> Your loadout <span>{stack.config.picks.length} tools</span>
        <ArrowUpRight />
      </a>
      <footer className="site-footer">
        <span>
          <Gamepad2 /> Built for the people who build worlds.
        </span>
        <div>
          <a href="/ATTRIBUTION.md" target="_blank" rel="noreferrer">
            Logo credits
          </a>
          <a
            href="https://github.com/gabaudette/game-stack-picker/issues"
            target="_blank"
            rel="noreferrer"
          >
            Suggest a tool <ArrowUpRight />
          </a>
        </div>
      </footer>
      {details && <ToolDetails tool={details} onClose={() => setDetails(null)} />}
      {resetOpen && (
        <Dialog title="Start with a blank stack?" onClose={() => setResetOpen(false)}>
          <p>
            This clears your tools and project answers on this device. Previously shared links will
            still work.
          </p>
          <div className="dialog-actions">
            <button type="button" className="secondary-button" onClick={() => setResetOpen(false)}>
              Keep my stack
            </button>
            <button
              type="button"
              className="primary-button"
              onClick={() => {
                stack.reset();
                setResetOpen(false);
                setMode("browse");
              }}
            >
              Reset everything
            </button>
          </div>
        </Dialog>
      )}
    </>
  );
}
