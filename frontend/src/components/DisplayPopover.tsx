import { useState } from "react";

interface DisplayPopoverProps {
  density: "comfortable" | "compact";
  onDensityChange: (density: "comfortable" | "compact") => void;
  columns: { key: string; label: string; visible: boolean }[];
  onToggleColumn: (key: string) => void;
}

export default function DisplayPopover({ density, onDensityChange, columns, onToggleColumn }: DisplayPopoverProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="display-popover">
      <button type="button" className="display-popover__button" onClick={() => setOpen((v) => !v)}>
        Display
      </button>
      {open ? (
        <div className="display-popover__panel" role="menu">
          <div className="display-popover__group">
            <strong style={{ fontSize: "0.9rem" }}>Density</strong>
            <label>
              <input
                type="radio"
                name="density"
                checked={density === "comfortable"}
                onChange={() => onDensityChange("comfortable")}
              />{" "}
              Comfortable
            </label>
            <label>
              <input type="radio" name="density" checked={density === "compact"} onChange={() => onDensityChange("compact")} /> Compact
            </label>
          </div>
          <div className="display-popover__group">
            <strong style={{ fontSize: "0.9rem" }}>Columns</strong>
            {columns.map((col) => (
              <label key={col.key}>
                <input type="checkbox" checked={col.visible} onChange={() => onToggleColumn(col.key)} /> {col.label}
              </label>
            ))}
          </div>
          <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>
            Close
          </button>
        </div>
      ) : null}
    </div>
  );
}
