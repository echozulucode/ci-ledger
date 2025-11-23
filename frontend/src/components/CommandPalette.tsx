import { useEffect, useMemo, useRef, useState } from "react";
import classNames from "../utils/classNames";
import "./CommandPalette.css";

export interface CommandItem {
  label: string;
  description?: string;
  shortcut?: string;
  action: () => void;
  group?: string;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  commands: CommandItem[];
}

export default function CommandPalette({ open, onClose, commands }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    const items = q
      ? commands.filter((cmd) => cmd.label.toLowerCase().includes(q) || cmd.description?.toLowerCase().includes(q))
      : commands;
    const grouped = items.reduce<Record<string, CommandItem[]>>((acc, cmd) => {
      const key = cmd.group || "Commands";
      acc[key] = acc[key] || [];
      acc[key].push(cmd);
      return acc;
    }, {});
    return grouped;
  }, [commands, query]);

  if (!open) return null;

  return (
    <div className="cmdp-overlay" onClick={onClose}>
      <div className="cmdp" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search commands..."
          className="cmdp-input"
          aria-label="Command palette"
        />
        <div className="cmdp-list" role="menu">
          {Object.entries(filtered).map(([group, items]) => (
            <div key={group} className="cmdp-group">
              <div className="cmdp-group-title">{group}</div>
              {items.map((cmd) => (
                <button
                  key={cmd.label}
                  className={classNames("cmdp-item")}
                  onClick={() => {
                    cmd.action();
                    onClose();
                  }}
                >
                  <div className="cmdp-item-main">
                    <span className="cmdp-label">{cmd.label}</span>
                    {cmd.description ? <span className="cmdp-desc">{cmd.description}</span> : null}
                  </div>
                  {cmd.shortcut ? <span className="cmdp-shortcut">{cmd.shortcut}</span> : null}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
