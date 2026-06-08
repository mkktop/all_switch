import { relaunch } from "@tauri-apps/plugin-process";
import { check } from "@tauri-apps/plugin-updater";

export type UpdaterPhase =
  | "idle"
  | "checking"
  | "available"
  | "downloading"
  | "installing"
  | "upToDate"
  | "error";

export interface UpdateInfo {
  version: string;
  date?: string;
  body?: string;
}

export async function checkForUpdate(): Promise<{
  available: boolean;
  info?: UpdateInfo;
  downloadAndInstall?: () => Promise<void>;
}> {
  const update = await check({ timeout: 30000 });

  if (update) {
    return {
      available: true,
      info: {
        version: update.version,
        date: update.date,
        body: update.body,
      },
      downloadAndInstall: async () => {
        await update.downloadAndInstall();
        await relaunch();
      },
    };
  }

  return { available: false };
}
