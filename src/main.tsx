import { NuqsAdapter } from "nuqs/adapters/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { configSearch, initialConfiguration } from "./state/config";
import "./styles.css";

const root = document.getElementById("root");
if (!root) {
  throw new Error("The application root is missing.");
}
const storage = { getItem: (key: string) => window.localStorage.getItem(key) };
const initial = initialConfiguration(window.location.search, storage);
const params = new URLSearchParams(window.location.search);
const configParams = new URLSearchParams(configSearch(initial.config));
for (const [key, value] of configParams) {
  params.set(key, value);
}
window.history.replaceState(
  window.history.state,
  "",
  `${window.location.pathname}?${params}${window.location.hash}`,
);
createRoot(root).render(
  <StrictMode>
    <NuqsAdapter>
      <App initialNotices={initial.notices} />
    </NuqsAdapter>
  </StrictMode>,
);
