import { RefreshCw, Download, X } from "lucide-react";
import { useUpdate } from "../contexts/UpdateContext";

export function UpdateBadge() {
  const { phase, updateInfo, error, installUpdate, dismiss, isDismissed } =
    useUpdate();

  // Don't show if no update available or dismissed
  if (phase !== "available" && phase !== "downloading" && phase !== "error")
    return null;
  if (isDismissed && phase === "available") return null;

  const isDownloading = phase === "downloading";

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-xs z-50 animate-in slide-in-from-right">
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 ${isDownloading ? "animate-spin" : "text-green-500"}`}
        >
          {isDownloading ? (
            <RefreshCw size={18} />
          ) : (
            <Download size={18} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          {phase === "error" ? (
            <p className="text-sm text-red-600">更新失败：{error}</p>
          ) : isDownloading ? (
            <p className="text-sm text-gray-700">正在下载更新...</p>
          ) : (
            <>
              <p className="text-sm font-medium text-gray-900">
                发现新版本 v{updateInfo?.version}
              </p>
              {updateInfo?.body && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {updateInfo.body}
                </p>
              )}
            </>
          )}
        </div>
        {!isDownloading && phase !== "error" && (
          <button
            onClick={dismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>
      {phase === "available" && (
        <button
          onClick={installUpdate}
          className="mt-3 w-full text-center text-sm bg-blue-500 text-white py-1.5 rounded-md hover:bg-blue-600 transition-colors"
        >
          立即更新
        </button>
      )}
    </div>
  );
}
