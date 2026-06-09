import { getVersion } from "@tauri-apps/api/app";
import { useEffect, useState } from "react";
import { ModeSwitch } from "./components/ModeSwitch";
import { ActionBar } from "./components/ActionBar";
import { FileList } from "./components/FileList";
import { SettingsPage } from "./components/SettingsPage";
import { useFileList } from "./hooks/useFileList";
import { useUpdate } from "./contexts/UpdateContext";
import { useSettings } from "./hooks/useSettings";
import { Settings } from "lucide-react";
import type { AppSettings } from "./hooks/useSettings";

type View = "main" | "settings";

export default function App() {
  const [currentView, setCurrentView] = useState<View>("main");

  const {
    mode,
    setMode,
    files,
    outputDir,
    isProcessing,
    addFiles,
    removeFile,
    clearFiles,
    selectOutputDir,
    startProcessing,
  } = useFileList();

  const { phase, updateInfo } = useUpdate();
  const { settings, save } = useSettings();
  const [version, setVersion] = useState("");

  useEffect(() => {
    getVersion().then((v) => setVersion(v));
  }, []);

  const hasUpdate = phase === "available" && updateInfo;

  const handleSaveSettings = async (s: AppSettings) => {
    await save(s);
  };

  // Settings view
  if (currentView === "settings") {
    return (
      <div className="flex flex-col h-screen bg-gray-50 text-gray-900">
        <SettingsPage
          settings={settings}
          onSave={handleSaveSettings}
          onBack={() => setCurrentView("main")}
        />
      </div>
    );
  }

  // Main view
  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-900">
      {/* 顶部标题栏 */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold text-gray-800">File2PNG</h1>
          <span className="text-xs text-gray-400">v{version}</span>
          <div className="relative">
            <button
              onClick={() => setCurrentView("settings")}
              title="设置"
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Settings size={16} />
            </button>
            {/* 更新红点提示 */}
            {hasUpdate && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-500" />
            )}
          </div>
        </div>
        <ModeSwitch mode={mode} onChange={setMode} />
      </header>

      {/* 操作栏 */}
      <div className="px-6 py-3 bg-white border-b border-gray-100">
        <ActionBar
          outputDir={outputDir}
          onAddFiles={addFiles}
          onSelectOutputDir={selectOutputDir}
          onStart={() => startProcessing(settings.filename_suffix || undefined)}
          onClear={clearFiles}
          hasFiles={files.length > 0}
          isProcessing={isProcessing}
        />
      </div>

      {/* 文件列表 */}
      <div className="flex-1 overflow-hidden px-6 py-2">
        <FileList files={files} onRemove={removeFile} />
      </div>
    </div>
  );
}
