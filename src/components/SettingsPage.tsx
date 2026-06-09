import { useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { FolderOpen, ArrowLeft, Check } from "lucide-react";

interface SettingsPageProps {
  defaultOutputDir: string;
  filenameSuffix: string;
  onSave: (settings: { default_output_dir: string; filename_suffix: string }) => Promise<void>;
  onBack: () => void;
}

export function SettingsPage({ defaultOutputDir, filenameSuffix, onSave, onBack }: SettingsPageProps) {
  const [dir, setDir] = useState(defaultOutputDir);
  const [suffix, setSuffix] = useState(filenameSuffix);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSelectDir = async () => {
    const selected = await open({ directory: true, multiple: false });
    if (selected && typeof selected === "string") {
      setDir(selected);
      setSaved(false);
    }
  };

  const handleResetDir = () => {
    setDir("");
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ default_output_dir: dir, filename_suffix: suffix });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-lg font-semibold text-gray-800">设置</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="space-y-6 max-w-lg">
          {/* 默认输出目录 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              默认输出目录
            </label>
            <p className="text-xs text-gray-500 mb-3">
              不设置时，文件将输出到安装目录下的 <code className="bg-gray-100 px-1 rounded text-xs">out</code> 文件夹
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
                  onClick={handleResetDir}
                  className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  重置
                </button>
              )}
            </div>
          </div>

          {/* 自定义文件名后缀 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              自定义文件名后缀
            </label>
            <p className="text-xs text-gray-500 mb-3">
              编码时追加到输出文件名末尾。例如后缀为 <code className="bg-gray-100 px-1 rounded text-xs">new</code>，则 <code className="bg-gray-100 px-1 rounded text-xs">123.mp4</code> → <code className="bg-gray-100 px-1 rounded text-xs">123new.png</code>
            </p>
            <input
              type="text"
              value={suffix}
              onChange={(e) => { setSuffix(e.target.value); setSaved(false); }}
              placeholder="不设置（使用原文件名）"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200 flex items-center gap-3">
        <button
          onClick={handleSave}
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
