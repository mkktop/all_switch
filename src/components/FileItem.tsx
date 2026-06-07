import { CheckCircle, XCircle, Loader2, X } from "lucide-react";
import type { FileEntry } from "../types";
import { cn } from "../lib/utils";

interface FileItemProps {
  file: FileEntry;
  onRemove: (id: string) => void;
}

function formatSize(bytes: number): string {
  if (bytes === 0) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function FileItem({ file, onRemove }: FileItemProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors",
        file.status === "done" && "border-green-200 bg-green-50",
        file.status === "error" && "border-red-200 bg-red-50",
        file.status === "processing" && "border-blue-200 bg-blue-50",
        file.status === "pending" && "border-gray-200 bg-white",
      )}
    >
      {/* 文件名 */}
      <span className="flex-1 truncate text-sm font-medium text-gray-800" title={file.path}>
        {file.name}
      </span>

      {/* 大小 */}
      <span className="text-xs text-gray-500 w-20 text-right">
        {formatSize(file.size)}
      </span>

      {/* 状态 */}
      <span className="flex items-center gap-1 w-24 text-xs">
        {file.status === "pending" && <span className="text-gray-400">等待中</span>}
        {file.status === "processing" && (
          <>
            <Loader2 size={14} className="animate-spin text-blue-500" />
            <span className="text-blue-500">处理中</span>
          </>
        )}
        {file.status === "done" && (
          <>
            <CheckCircle size={14} className="text-green-500" />
            <span className="text-green-600">完成</span>
          </>
        )}
        {file.status === "error" && (
          <>
            <XCircle size={14} className="text-red-500" />
            <span className="text-red-500" title={file.errorMsg}>失败</span>
          </>
        )}
      </span>

      {/* 删除 */}
      <button
        onClick={() => onRemove(file.id)}
        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
}
