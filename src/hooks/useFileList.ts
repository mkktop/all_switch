import { useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import type { Mode, FileEntry, FileStatus } from "../types";

let nextId = 0;

export function useFileList() {
  const [mode, setMode] = useState<Mode>("encode");
  // Independent file lists per mode
  const [encodeFiles, setEncodeFiles] = useState<FileEntry[]>([]);
  const [decodeFiles, setDecodeFiles] = useState<FileEntry[]>([]);
  const [encodeOutputDir, setEncodeOutputDir] = useState<string>("");
  const [decodeOutputDir, setDecodeOutputDir] = useState<string>("");

  // Derived state for current mode
  const files = mode === "encode" ? encodeFiles : decodeFiles;
  const outputDir = mode === "encode" ? encodeOutputDir : decodeOutputDir;
  const setFiles = mode === "encode" ? setEncodeFiles : setDecodeFiles;

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
  }, [mode, setFiles]);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, [setFiles]);

  const clearFiles = useCallback(() => {
    setFiles([]);
  }, [setFiles]);

  const selectOutputDir = useCallback(async () => {
    const dir = await open({ directory: true, multiple: false });
    if (dir && typeof dir === "string") {
      if (mode === "encode") setEncodeOutputDir(dir);
      else setDecodeOutputDir(dir);
    }
  }, [mode]);

  const startProcessing = useCallback(async () => {
    const command = mode === "encode" ? "encode_file" : "decode_file";
    const currentOutputDir = mode === "encode" ? encodeOutputDir : decodeOutputDir;

    for (const file of files) {
      if (file.status === "done") continue;

      setFiles((prev) =>
        prev.map((f) => (f.id === file.id ? { ...f, status: "processing" as FileStatus } : f)),
      );

      try {
        const result = await invoke<string>(command, {
          path: file.path,
          outputDir: currentOutputDir || null,
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
  }, [mode, files, encodeOutputDir, decodeOutputDir, setFiles]);

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
