// ==========================================
// File Browser Hook for Drive Cleaner
// ==========================================

import { open } from "@tauri-apps/plugin-dialog";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useConfirm } from "../lib/confirmContext";
import { extractErrorMessage, invoke } from "../lib/tauri";
import { useToast } from "../lib/toastContext";
import { DEFAULT_PATH, getParentPath, parseBreadcrumb } from "../lib/utils";
import type { BulkMoveResult, FileNode, FilePreview, SortDir, SortKey } from "../types";

export function useFileBrowser() {
  const confirm = useConfirm();
  const notify = useToast();

  // State
  const [currentPath, setCurrentPath] = useState(DEFAULT_PATH);
  const [nodes, setNodes] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [preview, setPreview] = useState<FilePreview | null>(null);
  const [previewPath, setPreviewPath] = useState("");

  // Selection state
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());

  // Rename modal state
  const [renameTarget, setRenameTarget] = useState<{ path: string; name: string } | null>(null);

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
    setSelectedPaths(new Set());
    try {
      const data = await invoke<FileNode[]>("get_directory_contents", { path });
      setNodes(data);
      setCurrentPath(path);
    } catch (e) {
      const msg = extractErrorMessage(e);
      notify(`ディレクトリを開けません: ${msg}`, "error");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  // Initial load — capture path in ref to avoid re-running on navigation
  const initialPathRef = useRef(currentPath);
  useEffect(() => {
    loadDirectory(initialPathRef.current);
  }, [loadDirectory]);

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

  // File operations — delete
  const handleDeleteItem = useCallback(async (path: string) => {
    const ok = await confirm(
      "このアイテムをゴミ箱に移動します。よろしいですか？",
      "削除確認",
    );
    if (!ok) return;

    try {
      await invoke("delete_item", { path });
      setNodes((prev) => prev.filter((n) => n.path !== path));
      setSelectedPaths((prev) => {
        const next = new Set(prev);
        next.delete(path);
        return next;
      });
    } catch (e) {
      const msg = extractErrorMessage(e);
      notify(`削除に失敗しました: ${msg}`, "error");
    }
  }, [confirm, notify]);

  const handleSecureDeleteItem = useCallback(async (path: string) => {
    const ok = await confirm(
      "このファイルを3パス上書き後に完全削除します（復元不可）。よろしいですか？",
      "セキュア削除確認",
    );
    if (!ok) return;

    try {
      await invoke("secure_delete_item", { path });
      setNodes((prev) => prev.filter((n) => n.path !== path));
      setSelectedPaths((prev) => {
        const next = new Set(prev);
        next.delete(path);
        return next;
      });
    } catch (e) {
      const msg = extractErrorMessage(e);
      notify(`セキュア削除に失敗しました: ${msg}`, "error");
    }
  }, [confirm, notify]);

  // File operations — move
  const handleMoveItem = useCallback(async (path: string) => {
    const dest = await open({ directory: true, title: "移動先フォルダを選択" });
    if (!dest || typeof dest !== "string") return;

    // Extract filename from source path
    const filename = path.replace(/\\/g, "/").split("/").filter(Boolean).pop() ?? "";
    const to = `${dest}\\${filename}`;

    try {
      await invoke("move_item", { from: path, to });
      setNodes((prev) => prev.filter((n) => n.path !== path));
      setSelectedPaths((prev) => {
        const next = new Set(prev);
        next.delete(path);
        return next;
      });
      notify("移動しました", "success");
    } catch (e) {
      const msg = extractErrorMessage(e);
      notify(`移動に失敗しました: ${msg}`, "error");
    }
  }, [notify]);

  // File operations — rename
  const handleRenameStart = useCallback((path: string, name: string) => {
    setRenameTarget({ path, name });
  }, []);

  const handleRenameSubmit = useCallback(async (newName: string) => {
    if (!renameTarget) return;
    const { path } = renameTarget;

    try {
      const newPath = await invoke<string>("rename_item", { path, newName });
      setNodes((prev) =>
        prev.map((n) =>
          n.path === path ? { ...n, name: newName, path: newPath } : n,
        ),
      );
      setSelectedPaths((prev) => {
        const next = new Set(prev);
        if (next.has(path)) {
          next.delete(path);
          next.add(newPath);
        }
        return next;
      });
      setRenameTarget(null);
      notify(`リネームしました: ${newName}`, "success");
    } catch (e) {
      const msg = extractErrorMessage(e);
      notify(`リネームに失敗しました: ${msg}`, "error");
    }
  }, [renameTarget, notify]);

  const handleRenameClear = useCallback(() => {
    setRenameTarget(null);
  }, []);

  // File operations — bulk move
  const handleBulkMove = useCallback(async () => {
    if (selectedPaths.size === 0) return;

    const dest = await open({ directory: true, title: "移動先フォルダを選択" });
    if (!dest || typeof dest !== "string") return;

    try {
      const result = await invoke<BulkMoveResult>("bulk_move", {
        paths: Array.from(selectedPaths),
        destDir: dest,
      });
      await loadDirectory(currentPath);
      if (result.errors.length === 0) {
        notify(`${result.moved_count}件移動しました`, "success");
      } else {
        notify(
          `${result.moved_count}件移動、${result.errors.length}件失敗しました`,
          "warning",
        );
      }
    } catch (e) {
      const msg = extractErrorMessage(e);
      notify(`移動に失敗しました: ${msg}`, "error");
    }
  }, [selectedPaths, currentPath, loadDirectory, notify]);

  // File operations — organize by type
  const handleOrganizeByType = useCallback(async () => {
    const ok = await confirm(
      "このフォルダ内のファイルをタイプ別（Images / Documents / Videos / Music / Archives / Others）に整理します。よろしいですか？",
      "タイプ別に整理",
    );
    if (!ok) return;

    try {
      const result = await invoke<BulkMoveResult>("organize_by_type", {
        targetDir: currentPath,
      });
      await loadDirectory(currentPath);
      if (result.errors.length === 0) {
        notify(`${result.moved_count}件のファイルを整理しました`, "success");
      } else {
        notify(
          `${result.moved_count}件整理、${result.errors.length}件失敗しました`,
          "warning",
        );
      }
    } catch (e) {
      const msg = extractErrorMessage(e);
      notify(`整理に失敗しました: ${msg}`, "error");
    }
  }, [currentPath, confirm, loadDirectory, notify]);

  // Selection helpers
  const toggleSelect = useCallback((path: string) => {
    setSelectedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedPaths(new Set());
  }, []);

  const handlePreview = useCallback(async (path: string) => {
    try {
      const data = await invoke<FilePreview>("get_file_preview", { path });
      setPreview(data);
      setPreviewPath(path);
    } catch (e) {
      const msg = extractErrorMessage(e);
      notify(`プレビューできません: ${msg}`, "error");
    }
  }, [notify]);

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
    selectedPaths,
    renameTarget,
    loadDirectory,
    toggleSort,
    handleSelectFolder,
    handleGoUp,
    handleDeleteItem,
    handleSecureDeleteItem,
    handleMoveItem,
    handleRenameStart,
    handleRenameSubmit,
    handleRenameClear,
    handleBulkMove,
    handleOrganizeByType,
    toggleSelect,
    clearSelection,
    handlePreview,
    setPreview,
  };
}
