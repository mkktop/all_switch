import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  checkForUpdate,
  justUpdated,
  type UpdaterPhase,
  type UpdateInfo,
} from "../lib/updater";

interface UpdateContextValue {
  phase: UpdaterPhase;
  updateInfo: UpdateInfo | null;
  error: string | null;
  checkUpdate: () => Promise<void>;
  installUpdate: () => Promise<void>;
  dismiss: () => void;
  isDismissed: boolean;
}

const UpdateContext = createContext<UpdateContextValue | null>(null);

const DISMISSED_KEY = "file2png:update:dismissedVersion";

export function UpdateProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<UpdaterPhase>("idle");
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  // Auto-check on mount (skip if we just updated)
  useEffect(() => {
    const timer = setTimeout(async () => {
      const wasJustUpdated = await justUpdated();
      if (wasJustUpdated) {
        // Just updated to new version, skip check, show "up to date"
        setPhase("upToDate");
        return;
      }
      checkUpdate();
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const checkUpdate = useCallback(async () => {
    setPhase("checking");
    setError(null);
    try {
      const result = await checkForUpdate();
      if (result.available && result.info) {
        setUpdateInfo(result.info);
        setPhase("available");
        // Check if this version was dismissed
        const dismissed = localStorage.getItem(DISMISSED_KEY);
        setIsDismissed(dismissed === result.info.version);
        // Store downloadAndInstall for later use
        (window as unknown as Record<string, unknown>).__updateInstaller =
          result.downloadAndInstall;
      } else {
        setPhase("upToDate");
      }
    } catch (err) {
      setError(String(err));
      setPhase("error");
    }
  }, []);

  const installUpdate = useCallback(async () => {
    const installer = (window as unknown as Record<string, unknown>)
      .__updateInstaller as (() => Promise<void>) | undefined;
    if (!installer) return;

    setPhase("downloading");
    try {
      await installer();
      setPhase("installing");
    } catch (err) {
      setError(String(err));
      setPhase("error");
    }
  }, []);

  const dismiss = useCallback(() => {
    if (updateInfo) {
      localStorage.setItem(DISMISSED_KEY, updateInfo.version);
      setIsDismissed(true);
    }
    // Always reset phase so the popup closes
    setPhase("idle");
    setError(null);
  }, [updateInfo]);

  return (
    <UpdateContext.Provider
      value={{
        phase,
        updateInfo,
        error,
        checkUpdate,
        installUpdate,
        dismiss,
        isDismissed,
      }}
    >
      {children}
    </UpdateContext.Provider>
  );
}

export function useUpdate() {
  const ctx = useContext(UpdateContext);
  if (!ctx) throw new Error("useUpdate must be used within UpdateProvider");
  return ctx;
}
