// ==========================================
// File Browser Hook for Drive Cleaner
// ==========================================

import { ask, message, open } from "@tauri-apps/plugin-dialog";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { extractErrorMessage, invoke } from "../lib/tauri";
import { DEFAULT_PATH, getParentPath, parseBreadcrumb } from "../lib/utils";
import type { FileNode, FilePreview, SortDir, SortKey } from "../types";

export function useFileBrowser() {
  // State
  const [currentPath, setCurrentPath] = useState(DEFAULT_PATH);
  const [nodes, setNodes] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [preview, setPreview] = useState<FilePreview | null>(null);
  const [previewPath, setPreviewPath] = useState("");

  // Refs
  const listContainerRef = useRef<HTMLDivElement | null>(null);
  const [listHeight, setListHeight] = useState(400);

  // ResizeObserver for list height
  useEffect(() => {
    const container = listContainerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setListHeight(entry.contentRect.height);
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Window title
  useEffect(() => {
    document.title = `Drive Cleaner — ${currentPath}`;
  }, [currentPath]);

  // Directory loading
  const loadDirectory = useCallback(async (path: string) => {
    setLoading(true);
    try {
      const data = await invoke<FileNode[]>("get_directory_contents", { path });
      setNodes(data);
      setCurrentPath(path);
    } catch (e) {
      const msg = extractErrorMessage(e);
      await message(`ディレクトリを開けません: ${msg}`, {
        title: "エラー",
        kind: "error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadDirectory(currentPath);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sorting
  const sortedNodes = useMemo(() => {
    return [...nodes].sort((a, b) => {
      // Folders always first
      if (a.is_dir !== b.is_dir) return a.is_dir ? -1 : 1;

      let cmp = 0;
      if (sortKey === "name") {
        cmp = a.name.toLowerCase().localeCompare(b.name.toLowerCase());
      } else {
        cmp = a.size - b.size;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [nodes, sortKey, sortDir]);

  const toggleSort = useCallback((key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }, [sortKey]);

  // Navigation
  const handleSelectFolder = useCallback(async () => {
    const selected = await open({ directory: true });
    if (selected && typeof selected === "string") {
      loadDirectory(selected);
    }
  }, [loadDirectory]);

  const handleGoUp = useCallback(() => {
    const parent = getParentPath(currentPath);
    if (parent !== currentPath) loadDirectory(parent);
  }, [currentPath, loadDirectory]);

  // File operations
  const handleDeleteItem = useCallback(async (path: string) => {
    const confirmed = await ask(
      "このアイテムを完全に削除します。よろしいですか？",
      { title: "削除確認", kind: "warning" }
    );
    if (!confirmed) return;

    try {
      await invoke("delete_item", { path });
      setNodes((prev) => prev.filter((n) => n.path !== path));
    } catch (e) {
      const msg = extractErrorMessage(e);
      await message(`削除に失敗しました: ${msg}`, {
        title: "エラー",
        kind: "error",
      });
    }
  }, []);

  const handlePreview = useCallback(async (path: string) => {
    try {
      const data = await invoke<FilePreview>("get_file_preview", { path });
      setPreview(data);
      setPreviewPath(path);
    } catch (e) {
      const msg = extractErrorMessage(e);
      await message(`プレビューできません: ${msg}`, {
        title: "エラー",
        kind: "error",
      });
    }
  }, []);

  // Breadcrumbs
  const breadcrumbs = useMemo(() => parseBreadcrumb(currentPath), [currentPath]);

  return {
    currentPath,
    nodes,
    loading,
    sortKey,
    sortDir,
    sortedNodes,
    breadcrumbs,
    listContainerRef,
    listHeight,
    preview,
    previewPath,
    loadDirectory,
    toggleSort,
    handleSelectFolder,
    handleGoUp,
    handleDeleteItem,
    handlePreview,
    setPreview,
  };
}
