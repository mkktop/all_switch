import { useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import type { Mode, FileEntry, FileStatus } from "../types";

let nextId = 0;

export function useFileList() {
  const [mode, setMode] = useState<Mode>("encode");
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [outputDir, setOutputDir] = useState<string>("");

  const addFiles = useCallback(async () => {
    const filters =
      mode === "encode"
        ? [{ name: "All Files", extensions: ["*"] }]
        : [{ name: "PNG Images", extensions: ["png"] }];

    const selected = await open({
      multiple: true,
      directory: false,
      filters,
    });
    if (!selected) return;

    const paths = Array.isArray(selected) ? selected : [selected];
    const entries: FileEntry[] = paths.map((p) => {
      const name = p.split(/[\\/]/).pop() || p;
      return { id: String(++nextId), path: p, name, size: 0, status: "pending" as FileStatus };
    });
    setFiles((prev) => [...prev, ...entries]);
  }, [mode]);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
  }, []);

  const selectOutputDir = useCallback(async () => {
    const dir = await open({ directory: true, multiple: false });
    if (dir && typeof dir === "string") {
      setOutputDir(dir);
    }
  }, []);

  const startProcessing = useCallback(async () => {
    const command = mode === "encode" ? "encode_file" : "decode_file";

    for (const file of files) {
      if (file.status === "done") continue;

      setFiles((prev) =>
        prev.map((f) => (f.id === file.id ? { ...f, status: "processing" as FileStatus } : f)),
      );

      try {
        const result = await invoke<string>(command, {
          path: file.path,
          outputDir: outputDir || null,
        });
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, status: "done" as FileStatus, outputPath: result } : f,
          ),
        );
      } catch (err) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id
              ? { ...f, status: "error" as FileStatus, errorMsg: String(err) }
              : f,
          ),
        );
      }
    }
  }, [mode, files, outputDir]);

  return {
    mode,
    setMode,
    files,
    outputDir,
    addFiles,
    removeFile,
    clearFiles,
    selectOutputDir,
    startProcessing,
  };
}
