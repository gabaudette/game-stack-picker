import { useQueryStates } from "nuqs";
import { useEffect, useMemo, useState } from "react";
import { CONFIG_VERSION, STORAGE_KEY } from "../domain/answers";
import { toolById } from "../domain/catalog";
import type { Answers, StackConfig } from "../domain/types";
import { decodeConfig, emptyConfig, errorMessage, queryParsers, toQuery } from "./config";

export function useStack() {
  const [query, setQuery] = useQueryStates(queryParsers, { history: "push" });
  const decoded = useMemo(() => decodeConfig(query), [query]);
  const [storageError, setStorageError] = useState("");
  const [updateError, setUpdateError] = useState("");
  const config = decoded.config;
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      setStorageError("");
    } catch (error) {
      setStorageError(
        `Your stack is in the URL, but saving on this device failed: ${errorMessage(error)}`,
      );
    }
  }, [config]);
  async function update(next: StackConfig) {
    try {
      await setQuery(toQuery(next));
      setUpdateError("");
    } catch (error) {
      setUpdateError(`Could not update the shareable configuration: ${errorMessage(error)}`);
    }
  }
  function toggle(id: string) {
    const tool = toolById.get(id);
    if (!tool) {
      setUpdateError("This tool is no longer available. Refresh the catalog.");
      return;
    }
    let picks = config.picks.filter((pick) => pick !== id);
    if (!config.picks.includes(id)) {
      if (tool.category === "engine") {
        picks = picks.filter((pick) => toolById.get(pick)?.category !== "engine");
      }
      picks.push(id);
    }
    return update({ ...config, picks });
  }
  function apply(picks: string[], answers: Answers) {
    return update({ version: CONFIG_VERSION, picks, answers });
  }
  return {
    config,
    notices: decoded.notices,
    storageError,
    updateError,
    toggle,
    apply,
    reset: () => update(emptyConfig),
  };
}
