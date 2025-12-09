import { ChevronDown } from "lucide-react";

interface PageSizeSelectProps {
  currentSize: number;
  sizes: number[];
  onChange: (nextSize: number) => void;
}

export function PageSizeSelect({
  currentSize,
  sizes,
  onChange,
}: PageSizeSelectProps) {
  return (
    <div className="relative">
      <select
        value={currentSize}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="appearance-none bg-[rgba(255,255,255,0.04)] border border-[rgba(255,26,26,0.25)] text-sm text-white rounded-lg px-3 py-2 pr-8 outline-none"
      >
        {sizes.map((size) => (
          <option key={size} value={size} className="bg-[#0a0a0a]">
            {size} / page
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
    </div>
  );
}
