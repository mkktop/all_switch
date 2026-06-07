import type { FileEntry } from "../types";
import { FileItem } from "./FileItem";

interface FileListProps {
  files: FileEntry[];
  onRemove: (id: string) => void;
}

export function FileList({ files, onRemove }: FileListProps) {
  if (files.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm py-20">
        点击「添加文件」开始
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-2 overflow-y-auto py-2">
      {files.map((file) => (
        <FileItem key={file.id} file={file} onRemove={onRemove} />
      ))}
    </div>
  );
}
