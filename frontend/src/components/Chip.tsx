import React from "react";
import classNames from "../utils/classNames";

interface ChipProps {
  label: string;
  tone?: "default" | "accent" | "ghost";
  onRemove?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export default function Chip({ label, tone = "default", onRemove, icon, className }: ChipProps) {
  return (
    <span className={classNames("chip", tone === "accent" ? "accent" : tone === "ghost" ? "ghost" : "", className)}>
      {icon}
      <span>{label}</span>
      {onRemove ? (
        <button aria-label={`Remove ${label}`} onClick={onRemove}>
          ×
        </button>
      ) : null}
    </span>
  );
}
