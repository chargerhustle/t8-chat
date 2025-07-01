"use client";

import { SettingsLayout } from "@/components/layout/settings-layout";
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, Trash2, Pin, Loader2 } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Doc } from "@/convex/_generated/dataModel";
import { useThreadExport } from "@/hooks/use-thread-export";
import { useThreadDeletion } from "@/hooks/use-thread-deletion";
import { DeleteThreadsDialog } from "@/components/settings";
import { toast } from "sonner";

// Skeleton loading component for threads
function ThreadSkeleton() {
  return (
    <li
      className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 px-4 py-2 animate-pulse"
      style={{ minHeight: "2.5rem" }}
    >
      <div className="h-4 w-4 bg-muted rounded-sm"></div>
      <div className="h-4 bg-muted rounded w-3/4"></div>
      <div className="w-8"></div>
      <div className="h-3 bg-muted rounded w-24"></div>
    </li>
  );
}

export default function HistoryPage() {
  const threads = useQuery(api.threads.get);
  const [selectedThreads, setSelectedThreads] = useState<Set<string>>(
    new Set()
  );
  const [selectAll, setSelectAll] = useState(false);
  const { exportThreads, isExporting } = useThreadExport();
  const {
    deleteThreads,
    confirmDelete,
    cancelDelete,
    isDeleting,
    showDeleteDialog,
    pendingThreadCount,
  } = useThreadDeletion();

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedThreads(new Set());
    } else {
      setSelectedThreads(
        new Set(threads?.map((t: Doc<"threads">) => t._id) || [])
      );
    }
    setSelectAll(!selectAll);
  };

  const handleThreadSelect = (threadId: string) => {
    const newSelected = new Set(selectedThreads);
    if (newSelected.has(threadId)) {
      newSelected.delete(threadId);
    } else {
      newSelected.add(threadId);
    }
    setSelectedThreads(newSelected);
    setSelectAll(newSelected.size === threads?.length);
  };

  const clearSelection = () => {
    setSelectedThreads(new Set());
    setSelectAll(false);
  };

  const handleExport = async () => {
    if (!threads) return;

    // Get threadIds for the selected threads
    const selectedThreadIds = threads
      .filter((thread) => selectedThreads.has(thread._id))
      .map((thread) => thread.threadId);

    await exportThreads(selectedThreadIds);
  };

  const handleDelete = async () => {
    if (!threads) return;

    // Get threadIds for the selected threads
    const selectedThreadIds = threads
      .filter((thread) => selectedThreads.has(thread._id))
      .map((thread) => thread.threadId);

    await deleteThreads(selectedThreadIds);
  };

  const handleConfirmDelete = async () => {
    await confirmDelete();
    // Clear selection after successful deletion
    clearSelection();
  };

  const handleDeleteAllHistory = async () => {
    if (!threads || threads.length === 0) {
      toast.error("No chat history to delete", {
        duration: 3000,
      });
      return;
    }

    // Get all thread IDs
    const allThreadIds = threads.map((thread) => thread.threadId);
    await deleteThreads(allThreadIds);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <SettingsLayout defaultTab="history">
      <TabsContent value="history" className="space-y-8">
        <div className="space-y-12">
          <section className="space-y-2">
            <h2 className="text-2xl font-bold">Message History</h2>
            <div className="space-y-6">
              <p className="text-muted-foreground/80">
                Save your history as JSON, or delete it.
              </p>
              <div className="space-y-2">
                <div className="mb-2 flex h-10 items-end justify-between gap-2">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="flex items-center gap-2.5 px-4 py-2 text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md cursor-pointer transition-colors"
                        onClick={handleSelectAll}
                        style={{
                          opacity: !threads ? 0.5 : 1,
                          pointerEvents: !threads ? "none" : "auto",
                        }}
                      >
                        <Checkbox
                          checked={selectAll}
                          className="h-4 w-4 shrink-0"
                        />
                        <span className="hidden text-sm md:inline">
                          Select All
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`flex gap-1 whitespace-nowrap text-sm ${selectedThreads.size === 0 ? "invisible" : ""}`}
                      onClick={clearSelection}
                    >
                      Clear<span className="hidden md:inline"> Selection</span>
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      disabled={selectedThreads.size === 0 || isExporting}
                      onClick={handleExport}
                    >
                      {isExporting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      <span className="sr-only md:not-sr-only">
                        {isExporting
                          ? "Exporting..."
                          : selectedThreads.size > 0
                            ? `Export (${selectedThreads.size})`
                            : "Export"}
                      </span>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex items-center gap-2"
                      disabled={selectedThreads.size === 0 || isDeleting}
                      onClick={handleDelete}
                    >
                      {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      <span className="sr-only md:not-sr-only">
                        {isDeleting
                          ? "Deleting..."
                          : selectedThreads.size > 0
                            ? `Delete (${selectedThreads.size})`
                            : "Delete"}
                      </span>
                    </Button>
                  </div>
                </div>
                <div
                  className="w-full rounded border"
                  style={{ height: "240px" }}
                >
                  <div className="h-full overflow-y-auto custom-scrollbar">
                    {!threads ? (
                      // Loading skeleton
                      <ul className="divide-y">
                        {Array.from({ length: 8 }).map((_, i) => (
                          <ThreadSkeleton key={i} />
                        ))}
                      </ul>
                    ) : (
                      <ul className="divide-y border-b">
                        {threads.length === 0 ? (
                          <li className="flex items-center justify-center py-8">
                            <p className="text-muted-foreground">
                              No chat history found
                            </p>
                          </li>
                        ) : (
                          threads.map((thread: Doc<"threads">) => (
                            <li
                              key={thread._id}
                              className="grid cursor-pointer grid-cols-[auto_1fr_auto_auto] items-center gap-3 px-4 py-2 hover:bg-muted/50"
                              style={{ minHeight: "2.5rem" }}
                              onClick={() => handleThreadSelect(thread._id)}
                            >
                              <div
                                className="h-4 w-4 shrink-0 bg-background rounded-sm border border-input flex items-center justify-center"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleThreadSelect(thread._id);
                                }}
                              >
                                <Checkbox
                                  checked={selectedThreads.has(thread._id)}
                                  className="h-4 w-4 border-0 bg-transparent"
                                />
                              </div>
                              <div className="flex items-center gap-1 min-w-0">
                                {thread.branchParentThreadId && (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-4 w-4 text-muted-foreground/50 shrink-0"
                                  >
                                    <path d="M6.02,5.78m0,15.31V4.55m0,0v-1.91m0,3.14v-1.23m0,1.23c0,1.61,1.21,3.11,3.2,3.94l4.58,1.92c1.98,.83,3.2,2.32,3.2,3.94v3.84"></path>
                                    <path d="M20.53,17.59l-3.41,3.66-3.66-3.41"></path>
                                  </svg>
                                )}
                                <span className="truncate">
                                  {thread.title || "Untitled Chat"}
                                </span>
                              </div>
                              <span className="flex w-8 justify-center">
                                {thread.pinned && (
                                  <div data-state="closed">
                                    <Pin className="h-4 w-4 text-primary" />
                                  </div>
                                )}
                              </span>
                              <span className="w-32 select-none text-right text-xs text-muted-foreground">
                                {formatDate(thread.createdAt)}
                              </span>
                            </li>
                          ))
                        )}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="w-fit space-y-2 border-0 border-muted-foreground/10">
            <h2 className="text-2xl font-bold">Danger Zone</h2>
            <div className="space-y-2">
              <p className="px-px py-1.5 text-sm text-muted-foreground/80">
                Permanently delete your history from both your local device and
                our servers.
                <span className="mx-0.5 text-base font-medium">*</span>
              </p>
              <div className="flex flex-row gap-2">
                <Button
                  variant="destructive"
                  className="border border-red-800/20 bg-red-800/80 hover:bg-red-600 disabled:opacity-50 dark:bg-red-800/20 hover:dark:bg-red-800"
                  disabled={!threads || threads.length === 0 || isDeleting}
                  onClick={handleDeleteAllHistory}
                >
                  {isDeleting ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-5 w-5" />
                  )}
                  Delete Chat History
                </Button>
              </div>
            </div>
          </section>

          <p className="text-sm text-muted-foreground/40">
            <span className="mx-0.5 text-base font-medium">*</span>
            The retention policies of our LLM hosting partners may vary.
          </p>
        </div>

        <DeleteThreadsDialog
          isOpen={showDeleteDialog}
          onClose={cancelDelete}
          onConfirmDelete={handleConfirmDelete}
          threadCount={pendingThreadCount}
        />
      </TabsContent>
    </SettingsLayout>
  );
}
