"use client";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

export type DropdownOption = { value: string; label: string; emoji?: string; hint?: string };

export default function Dropdown({
  value,
  onChange,
  options,
  placeholder = "Select…",
  className = "",
  accent = "#E8593C",
  size = "md",
}: {
  value: string;
  onChange: (v: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  className?: string;
  accent?: string;
  size?: "sm" | "md";
}) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const idx = options.findIndex((o) => o.value === value);
    setHighlighted(idx >= 0 ? idx : 0);
  }, [open, options, value]);

  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.children[highlighted] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [highlighted, open]);

  const selected = options.find((o) => o.value === value);

  function handleKey(e: React.KeyboardEvent) {
    if (!open) {
      if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(e.key)) {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === "Escape") { e.preventDefault(); setOpen(false); }
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlighted((h) => Math.min(h + 1, options.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setHighlighted((h) => Math.max(h - 1, 0)); }
    if (e.key === "Enter") {
      e.preventDefault();
      onChange(options[highlighted].value);
      setOpen(false);
    }
  }

  const pad = size === "sm" ? "px-3 py-2.5 text-sm" : "px-4 py-3.5 text-base";

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={handleKey}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`w-full ${pad} bg-[#1A1A18] border rounded-xl text-bone flex items-center justify-between gap-2 transition hover:border-[#3A3835] focus:outline-none`}
        style={{ borderColor: open ? accent : "#2A2826" }}
      >
        <span className="flex items-center gap-2.5 truncate">
          {selected?.emoji && <span className="text-base leading-none">{selected.emoji}</span>}
          <span className={selected ? "" : "text-[#3A3835]"}>{selected?.label ?? placeholder}</span>
        </span>
        <ChevronDown
          size={14}
          className="text-[#8B7355] transition-transform duration-200 shrink-0"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0)" }}
        />
      </button>

      {open && (
        <ul
          ref={listRef}
          role="listbox"
          className="absolute z-50 left-0 right-0 mt-1.5 max-h-64 overflow-y-auto bg-[#161413] border border-[#2A2826] rounded-xl py-1 shadow-2xl shadow-black/60"
          style={{ animation: "fade-in 0.14s ease-out" }}
        >
          {options.map((o, i) => {
            const isSelected = o.value === value;
            const isHighlighted = i === highlighted;
            return (
              <li
                key={o.value}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setHighlighted(i)}
                onClick={() => { onChange(o.value); setOpen(false); }}
                className="px-3 py-2.5 flex items-center gap-2.5 cursor-pointer transition"
                style={{
                  background: isHighlighted ? `${accent}14` : "transparent",
                  color: isHighlighted ? "#FAF8F5" : "#D4CFC7",
                }}
              >
                {o.emoji && <span className="text-base leading-none shrink-0">{o.emoji}</span>}
                <span className="flex-1 min-w-0">
                  <span className="text-sm font-semibold truncate block">{o.label}</span>
                  {o.hint && <span className="text-[11px] text-[#8B7355] truncate block">{o.hint}</span>}
                </span>
                {isSelected && <Check size={12} style={{ color: accent }} className="shrink-0" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
