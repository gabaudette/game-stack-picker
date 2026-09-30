export const questions = [
  {
    title: "What kind of world are you building?",
    description: "Start with your game’s primary dimension.",
  },
  {
    title: "Where will people play?",
    description: "Select all your targets. Console access requires vendor approval.",
  },
  { title: "Who’s building it?", description: "A stack should fit the people using it." },
  {
    title: "How much game-dev experience do you have?",
    description: "Choose the level that best describes your team.",
  },
  {
    title: "What’s your tooling budget?",
    description: "Free tools can still have hosting or publishing costs.",
  },
  {
    title: "Will players connect?",
    description: "Online play introduces networking and backend choices.",
  },
  {
    title: "What’s the visual direction?",
    description: "We’ll tailor your asset pipeline to the look you’re after.",
  },
  {
    title: "Have an engine or framework in mind?",
    description: "Keep your preference, or let the rules find a starting point.",
  },
];

type Option = { value: string; label: string; description: string };

export function Options({
  options,
  selected,
  onSelect,
}: {
  options: Option[];
  selected: string[];
  onSelect: (value: string) => void;
}) {
  return (
    <div className="answer-grid">
      {options.map((option) => (
        <button
          className="answer-option"
          type="button"
          key={option.value}
          aria-pressed={selected.includes(option.value)}
          onClick={() => onSelect(option.value)}
        >
          <strong>{option.label}</strong>
          <span>{option.description}</span>
        </button>
      ))}
    </div>
  );
}
