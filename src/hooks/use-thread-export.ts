import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

export function useThreadExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportThreadIds, setExportThreadIds] = useState<string[]>([]);

  // Query for export data - only runs when threadIds are set
  const exportData = useQuery(
    api.threads.exportThreads,
    exportThreadIds.length > 0 ? { threadIds: exportThreadIds } : "skip"
  );

  const downloadJsonFile = (data: unknown, filename: string) => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generateFilename = (threadCount: number, exportedAt: string) => {
    const date = new Date(exportedAt).toISOString().split("T")[0]; // YYYY-MM-DD
    const threadText = threadCount === 1 ? "thread" : "threads";
    return `t8-chat-export-${threadCount}-${threadText}-${date}.json`;
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const exportThreads = async (threadIds: string[]) => {
    if (threadIds.length === 0) {
      toast.error("Please select at least one thread to export", {
        duration: 3000,
      });
      return;
    }

    setIsExporting(true);
    setExportThreadIds(threadIds);

    // Show immediate feedback
    toast.info(
      `Preparing export for ${threadIds.length} thread${threadIds.length === 1 ? "" : "s"}...`,
      {
        duration: 3000,
      }
    );
  };

  // Handle download when export data is available
  useEffect(() => {
    if (exportData && isExporting && exportThreadIds.length > 0) {
      try {
        const filename = generateFilename(
          exportData.exportInfo.threadCount,
          exportData.exportInfo.exportedAt
        );

        // Calculate total messages for better feedback
        const totalMessages = exportData.threads.reduce(
          (sum, thread) => sum + thread.threadInfo.messageCount,
          0
        );

        downloadJsonFile(exportData, filename);

        // Calculate file size for user feedback
        const jsonString = JSON.stringify(exportData, null, 2);
        const fileSize = formatBytes(new Blob([jsonString]).size);

        toast.success(
          `Successfully exported ${exportData.exportInfo.threadCount} thread${
            exportData.exportInfo.threadCount === 1 ? "" : "s"
          } (${totalMessages} messages, ${fileSize})`,
          {
            duration: 3000,
          }
        );
      } catch (error) {
        console.error("Download failed:", error);
        toast.error("Failed to download export file", {
          duration: 3000,
        });
      } finally {
        setIsExporting(false);
        setExportThreadIds([]);
      }
    }
  }, [exportData, isExporting, exportThreadIds.length]);

  return {
    exportThreads,
    isExporting,
  };
}
