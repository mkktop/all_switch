import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";

export interface AppSettings {
  default_output_dir: string;
  filename_suffix: string;
  auto_update: boolean;
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>({ default_output_dir: "", filename_suffix: "", auto_update: false });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const s = await invoke<AppSettings>("get_settings");
      setSettings(s);
    } catch {
      // use defaults
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = useCallback(async (updated: AppSettings) => {
    await invoke("save_settings", { settings: updated });
    setSettings(updated);
  }, []);

  return { settings, loading, save };
}
