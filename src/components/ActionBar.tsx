import { FolderOpen, Plus, Play, Trash2 } from "lucide-react";

interface ActionBarProps {
  outputDir: string;
  onAddFiles: () => void;
  onSelectOutputDir: () => void;
  onStart: () => void;
  onClear: () => void;
  hasFiles: boolean;
  isProcessing: boolean;
}

export function ActionBar({
  outputDir,
  onAddFiles,
  onSelectOutputDir,
  onStart,
  onClear,
  hasFiles,
  isProcessing,
}: ActionBarProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button
        onClick={onAddFiles}
        disabled={isProcessing}
        className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium"
      >
        <Plus size={16} />
        添加文件
      </button>

      <button
        onClick={onSelectOutputDir}
        disabled={isProcessing}
        className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
      >
        <FolderOpen size={16} />
        {outputDir ? "已选输出目录" : "选择输出目录"}
      </button>

      <button
        onClick={onStart}
        disabled={!hasFiles || isProcessing}
        className="flex items-center gap-1.5 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium ml-auto"
      >
        <Play size={16} />
        {isProcessing ? "处理中..." : "开始转换"}
      </button>

      <button
        onClick={onClear}
        disabled={!hasFiles || isProcessing}
        className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
      >
        <Trash2 size={16} />
        清空
      </button>
    </div>
  );
}
