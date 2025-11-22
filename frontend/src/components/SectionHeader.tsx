import React from "react";
import Chip from "./Chip";

interface SectionHeaderProps {
  title: string;
  count?: number;
  meta?: string;
  actions?: React.ReactNode;
  badges?: { label: string; tone?: "default" | "accent" | "ghost" }[];
  level?: "h1" | "h2";
}

export default function SectionHeader({ title, count, meta, actions, badges, level = "h1" }: SectionHeaderProps) {
  const TitleTag = level;
  return (
    <div className="section-header">
      <div className="section-header__title">
        <TitleTag>{title}</TitleTag>
        {typeof count === "number" ? <Chip label={String(count)} tone="ghost" /> : null}
        {badges?.map((badge) => (
          <Chip key={badge.label} label={badge.label} tone={badge.tone} />
        ))}
        {meta ? <span className="section-header__meta">{meta}</span> : null}
      </div>
      <div className="section-header__actions">{actions}</div>
    </div>
  );
}
