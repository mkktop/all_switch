import type { Mode } from "../types";
import { cn } from "../lib/utils";

interface ModeSwitchProps {
  mode: Mode;
  onChange: (mode: Mode) => void;
}

export function ModeSwitch({ mode, onChange }: ModeSwitchProps) {
  return (
    <div className="flex rounded-lg border border-gray-300 overflow-hidden">
      <button
        className={cn(
          "px-5 py-2 text-sm font-medium transition-colors",
          mode === "encode"
            ? "bg-blue-500 text-white"
            : "bg-white text-gray-600 hover:bg-gray-50",
        )}
        onClick={() => onChange("encode")}
      >
        文件 → 图片
      </button>
      <button
        className={cn(
          "px-5 py-2 text-sm font-medium transition-colors border-l border-gray-300",
          mode === "decode"
            ? "bg-blue-500 text-white"
            : "bg-white text-gray-600 hover:bg-gray-50",
        )}
        onClick={() => onChange("decode")}
      >
        图片 → 文件
      </button>
    </div>
  );
}
