export type Mode = "encode" | "decode";

export type FileStatus = "pending" | "processing" | "done" | "error";

export interface FileEntry {
  id: string;
  path: string;
  name: string;
  size: number;
  status: FileStatus;
  outputPath?: string;
  errorMsg?: string;
}
