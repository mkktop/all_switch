import { open } from "@tauri-apps/plugin-dialog";
import { FolderOpen, Check } from "lucide-react";
import { cn } from "../../lib/utils";

interface GeneralTabProps {
  dir: string;
  suffix: string;
  autoUpdate: boolean;
  onDirChange: (dir: string) => void;
  onSuffixChange: (suffix: string) => void;
  onAutoUpdateChange: (val: boolean) => void;
  saving: boolean;
  saved: boolean;
  onSave: () => void;
}

export function GeneralTab({
  dir,
  suffix,
  autoUpdate,
  onDirChange,
  onSuffixChange,
  onAutoUpdateChange,
  saving,
  saved,
  onSave,
}: GeneralTabProps) {
  const handleSelectDir = async () => {
    const selected = await open({ directory: true, multiple: false });
    if (selected && typeof selected === "string") {
      onDirChange(selected);
    }
  };

  return (
    <div className="space-y-8">
      {/* 输出设置 */}
      <section className="space-y-2">
        <header className="space-y-1">
          <h3 className="text-sm font-medium text-gray-700">输出设置</h3>
          <p className="text-xs text-gray-400">配置文件编码后的输出位置和命名规则</p>
        </header>

        <div className="space-y-4">
          {/* 默认输出目录 */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              默认输出目录
            </label>
            <p className="text-xs text-gray-400 mb-2">
              不设置时，文件将输出到安装目录下的 <code className="bg-gray-100 px-1 rounded">out</code> 文件夹
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={dir}
                readOnly
                placeholder="未设置（使用安装目录/out/）"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-700 truncate"
              />
              <button
                onClick={handleSelectDir}
                className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                <FolderOpen size={14} />
                选择
              </button>
              {dir && (
                <button
                  onClick={() => onDirChange("")}
                  className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  重置
                </button>
              )}
            </div>
          </div>

          {/* 自定义文件名后缀 */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              自定义文件名后缀
            </label>
            <p className="text-xs text-gray-400 mb-2">
              编码时追加到输出文件名末尾。例如后缀为 <code className="bg-gray-100 px-1 rounded">new</code>，则 <code className="bg-gray-100 px-1 rounded">123.mp4</code> → <code className="bg-gray-100 px-1 rounded">123new.png</code>
            </p>
            <input
              type="text"
              value={suffix}
              onChange={(e) => onSuffixChange(e.target.value)}
              placeholder="不设置（使用原文件名）"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
            />
          </div>
        </div>
      </section>

      {/* 自动更新 */}
      <section className="space-y-2">
        <header className="space-y-1">
          <h3 className="text-sm font-medium text-gray-700">自动更新</h3>
          <p className="text-xs text-gray-400">启动时自动检查新版本</p>
        </header>

        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-700">自动检查更新</p>
            <p className="text-xs text-gray-400">开启后每次启动应用时自动检查是否有新版本</p>
          </div>
          <button
            role="switch"
            aria-checked={autoUpdate}
            onClick={() => onAutoUpdateChange(!autoUpdate)}
            className={cn(
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0",
              autoUpdate ? "bg-blue-500" : "bg-gray-300"
            )}
          >
            <span
              className={cn(
                "inline-block h-4 w-4 rounded-full bg-white transform transition-transform shadow",
                autoUpdate ? "translate-x-6" : "translate-x-1"
              )}
            />
          </button>
        </div>
      </section>

      {/* 保存按钮 */}
      <div className="pt-2 flex items-center gap-3">
        <button
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors text-sm font-medium"
        >
          {saving ? "保存中..." : saved ? (
            <>
              <Check size={14} />
              已保存
            </>
          ) : "保存"}
        </button>
        {saved && (
          <span className="text-xs text-green-500">设置已保存</span>
        )}
      </div>
    </div>
  );
}
