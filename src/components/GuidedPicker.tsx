import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { recommend } from "../domain/recommend";
import type { Answers } from "../domain/types";
import { Dialog } from "./Dialog";
import { ProjectQuestions } from "./ProjectQuestions";
import { questions } from "./QuestionOptions";
import { RecommendationResults } from "./RecommendationResults";

export function GuidedPicker({
  initialAnswers,
  hasPicks,
  onApply,
}: {
  initialAnswers: Answers;
  hasPicks: boolean;
  onApply: (picks: string[], answers: Answers) => void;
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(initialAnswers);
  const [showResults, setShowResults] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const result = useMemo(() => recommend(answers), [answers]);
  const lastStep = questions.length - 1;
  const current = questions[step];
  function apply() {
    onApply(result.picks, answers);
    setConfirm(false);
  }
  if (showResults) {
    return (
      <>
        <RecommendationResults
          result={result}
          onApply={() => {
            if (hasPicks) {
              setConfirm(true);
            } else {
              apply();
            }
          }}
          onEdit={() => setShowResults(false)}
          onAlternative={(id) => setAnswers({ ...answers, preferredEngine: id })}
        />
        {confirm && (
          <Dialog title="Replace your current stack?" onClose={() => setConfirm(false)}>
            <p>Your current tool selections will be replaced with this recommendation.</p>
            <div className="dialog-actions">
              <button className="secondary-button" type="button" onClick={() => setConfirm(false)}>
                Keep current stack
              </button>
              <button className="primary-button" type="button" onClick={apply}>
                Replace stack
              </button>
            </div>
          </Dialog>
        )}
      </>
    );
  }
  if (!current) {
    return (
      <p role="alert">The questionnaire could not load. Switch to the picker and try again.</p>
    );
  }
  return (
    <section className="wizard" aria-labelledby="wizard-title">
      <div className="wizard-heading">
        <span className="eyebrow">
          <Sparkles /> FIND YOUR FIT
        </span>
        <span className="fine-print">
          STEP {step + 1} / {questions.length}
        </span>
      </div>
      <div className="progress-track" aria-hidden="true">
        {questions.map((question, index) => {
          let className = "progress-segment";
          if (index <= step) {
            className += " complete";
          }
          return <span key={question.title} className={className} />;
        })}
      </div>
      <h2 id="wizard-title" tabIndex={-1} aria-live="polite">
        {current.title}
      </h2>
      <p className="muted">{current.description}</p>
      <ProjectQuestions step={step} answers={answers} onChange={setAnswers} />
      <div className="wizard-actions">
        <button
          type="button"
          className="secondary-button"
          disabled={step === 0}
          onClick={() => setStep(step - 1)}
        >
          <ArrowLeft /> Back
        </button>
        <button
          type="button"
          className="primary-button"
          onClick={() => {
            if (step === lastStep) {
              setShowResults(true);
            } else {
              setStep(step + 1);
            }
          }}
        >
          {step === lastStep && "Find my stack"}
          {step !== lastStep && "Continue"}
          <ArrowRight />
        </button>
      </div>
      <p className="fine-print">
        No AI calls. No signup. Just a thoughtfully curated starting point.
      </p>
    </section>
  );
}
