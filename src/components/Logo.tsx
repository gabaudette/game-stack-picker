import { useState } from "react";
import { logoPath } from "../assets/logos";

export function Logo({ id, name }: { id: string; name: string }) {
  const [failed, setFailed] = useState(false);
  const path = logoPath(id);
  if (!path || failed) {
    return (
      <span className="tool-monogram" role="img" aria-label={`${name} logo unavailable`}>
        {name.slice(0, 1)}
      </span>
    );
  }
  return (
    <img className="tool-logo" src={path} alt="" loading="lazy" onError={() => setFailed(true)} />
  );
}
