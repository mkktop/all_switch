import { getVersion } from "@tauri-apps/api/app";
import { useEffect, useState } from "react";
import { ModeSwitch } from "./components/ModeSwitch";
import { ActionBar } from "./components/ActionBar";
import { FileList } from "./components/FileList";
import { UpdateBadge } from "./components/UpdateBadge";
import { SettingsPage } from "./components/SettingsPage";
import { useFileList } from "./hooks/useFileList";
import { useUpdate } from "./contexts/UpdateContext";
import { useSettings } from "./hooks/useSettings";
import { RefreshCw, ArrowUp, Settings } from "lucide-react";

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

  const { phase, updateInfo, checkUpdate, installUpdate } = useUpdate();
  const { settings, save } = useSettings();
  const [version, setVersion] = useState("");

  useEffect(() => {
    getVersion().then((v) => setVersion(v));
  }, []);

  const isChecking = phase === "checking";
  const hasUpdate = phase === "available" && updateInfo;

  const handleSaveSettings = async (dir: string) => {
    await save({ default_output_dir: dir });
  };

  // Settings view
  if (currentView === "settings") {
    return (
      <div className="flex flex-col h-screen bg-gray-50 text-gray-900">
        <SettingsPage
          defaultOutputDir={settings.default_output_dir}
          onSave={handleSaveSettings}
          onBack={() => setCurrentView("main")}
        />
        <UpdateBadge />
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
          <button
            onClick={() => setCurrentView("settings")}
            title="设置"
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Settings size={16} />
          </button>
          <button
            onClick={checkUpdate}
            disabled={isChecking || phase === "downloading"}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={12} className={isChecking ? "animate-spin" : ""} />
            {isChecking ? "检查中..." : "检查更新"}
          </button>
          {hasUpdate && (
            <button
              onClick={installUpdate}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-xs font-medium hover:bg-green-100 transition-colors"
            >
              <ArrowUp size={12} />
              v{updateInfo.version}
            </button>
          )}
          {phase === "upToDate" && (
            <span className="text-xs text-green-500">已是最新</span>
          )}
        </div>
        <ModeSwitch mode={mode} onChange={setMode} />
      </header>

      {/* 操作栏 */}
      <div className="px-6 py-3 bg-white border-b border-gray-100">
        <ActionBar
          outputDir={outputDir}
          onAddFiles={addFiles}
          onSelectOutputDir={selectOutputDir}
          onStart={startProcessing}
          onClear={clearFiles}
          hasFiles={files.length > 0}
          isProcessing={isProcessing}
        />
      </div>

      {/* 文件列表 */}
      <div className="flex-1 overflow-hidden px-6 py-2">
        <FileList files={files} onRemove={removeFile} />
      </div>

      {/* 更新提示弹窗 */}
      <UpdateBadge />
    </div>
  );
}
