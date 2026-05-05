"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  className?: string;
  id?: string;
}

export default function Dropdown({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  className,
  id,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("relative", className)} ref={dropdownRef} id={id}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between input-field text-left px-4 py-2.5 bg-slate-800/50">
        <span
          className={cn("block truncate", !selectedOption && "text-slate-500")}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto z-50 rounded-xl border border-white/10 bg-slate-900 py-1 shadow-xl shadow-black/50 animate-in fade-in zoom-in-95 focus:outline-none">
          {options.map((option: { label: string; value: string }) => (
            <button
              key={option.value}
              type="button"
              className={cn(
                "relative flex w-full cursor-pointer select-none items-center py-2.5 pl-10 pr-4 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors",
                value === option.value && "bg-white/5 text-white font-medium",
              )}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}>
              {value === option.value && (
                <span className="absolute left-3 flex h-3.5 w-3.5 items-center justify-center">
                  <Check className="h-4 w-4 text-indigo-400" />
                </span>
              )}
              <span className="block truncate">{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
