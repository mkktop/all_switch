import { ModeSwitch } from "./components/ModeSwitch";
import { ActionBar } from "./components/ActionBar";
import { FileList } from "./components/FileList";
import { UpdateBadge } from "./components/UpdateBadge";
import { useFileList } from "./hooks/useFileList";

export default function App() {
  const {
    mode,
    setMode,
    files,
    outputDir,
    addFiles,
    removeFile,
    clearFiles,
    selectOutputDir,
    startProcessing,
  } = useFileList();

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-900">
      {/* 顶部标题栏 */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <h1 className="text-lg font-bold text-gray-800">File2PNG</h1>
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
        />
      </div>

      {/* 文件列表 */}
      <div className="flex-1 overflow-hidden px-6 py-2">
        <FileList files={files} onRemove={removeFile} />
      </div>

      {/* 更新提示 */}
      <UpdateBadge />
    </div>
  );
}
