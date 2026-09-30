import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { categories, tools } from "../domain/catalog";
import type { Tool } from "../domain/types";
import { ToolCard } from "./ToolCard";

export function Catalog({
  picks,
  onToggle,
  onDetails,
}: {
  picks: string[];
  onToggle: (id: string) => void;
  onDetails: (tool: Tool) => void;
}) {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [freeOnly, setFreeOnly] = useState(false);
  const visible = useMemo(
    () =>
      tools.filter((tool) => {
        const matchesSearch = `${tool.name} ${tool.description} ${tool.tags.join(" ")}`
          .toLowerCase()
          .includes(search.toLowerCase());
        return (
          matchesSearch &&
          (categoryId === "all" || tool.category === categoryId) &&
          (!freeOnly || tool.free)
        );
      }),
    [search, categoryId, freeOnly],
  );
  return (
    <div className="catalog">
      <div className="catalog-toolbar">
        <label className="search-field">
          <Search />
          <span className="sr-only">Search tools</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search your next favorite tool..."
          />
        </label>
        <label className="free-filter">
          <input
            type="checkbox"
            checked={freeOnly}
            onChange={(event) => setFreeOnly(event.target.checked)}
          />
          <SlidersHorizontal />
          <span>Free options</span>
        </label>
      </div>
      <nav className="category-nav" aria-label="Tool categories">
        <button
          className="category-chip"
          type="button"
          aria-pressed={categoryId === "all"}
          onClick={() => setCategoryId("all")}
        >
          All tools <span>{tools.length}</span>
        </button>
        {categories.map((category) => (
          <button
            className="category-chip"
            type="button"
            key={category.id}
            aria-pressed={categoryId === category.id}
            onClick={() => setCategoryId(category.id)}
          >
            {category.name}
          </button>
        ))}
      </nav>
      {visible.length === 0 && (
        <div className="empty-search">
          <h2>No tools found</h2>
          <p>Try another search or remove a filter.</p>
          <button
            className="secondary-button"
            type="button"
            onClick={() => {
              setSearch("");
              setFreeOnly(false);
              setCategoryId("all");
            }}
          >
            Clear filters
          </button>
        </div>
      )}
      {categories.map((category) => {
        const group = visible.filter((tool) => tool.category === category.id);
        if (group.length === 0) {
          return null;
        }
        return (
          <section
            className="category-section"
            key={category.id}
            aria-labelledby={`category-${category.id}`}
          >
            <div className="section-header">
              <span className="section-number">{category.label}</span>
              <div>
                <h2 id={`category-${category.id}`}>{category.name}</h2>
                <p>{category.description}</p>
              </div>
              <span className="section-count">{group.length} tools</span>
            </div>
            <div className="tool-grid">
              {group.map((tool) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  selected={picks.includes(tool.id)}
                  onToggle={onToggle}
                  onDetails={onDetails}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
