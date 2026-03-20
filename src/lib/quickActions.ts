// ==========================================
// Quick Actions Builder
// ==========================================

import {
  BarChart3,
  Clock,
  FolderOpen,
  HardDrive,
  PieChart,
  Search,
  Trash,
} from "lucide-react";

import type { ScanActions } from "../hooks/useScanActions";

export interface QuickAction {
  id: string;
  icon: React.ElementType;
  label: string;
  description: string;
  color: string;
  onClick: () => void;
}

export function buildQuickActions(actions: ScanActions): QuickAction[] {
  return [
    {
      id: "large_files",
      icon: HardDrive,
      label: "大容量ファイル",
      description: "トップ100件を検出",
      color: "#22c55e",
      onClick: actions.scanLargeFiles,
    },
    {
      id: "empty_folders",
      icon: FolderOpen,
      label: "空フォルダ",
      description: "空のフォルダを検出",
      color: "#f59e0b",
      onClick: actions.scanEmptyFolders,
    },
    {
      id: "old_files",
      icon: Clock,
      label: "古いファイル",
      description: "1年以上未更新",
      color: "#ef4444",
      onClick: actions.scanOldFiles,
    },
    {
      id: "file_types",
      icon: BarChart3,
      label: "種別分析",
      description: "カテゴリ別集計",
      color: "#8b5cf6",
      onClick: actions.scanFileTypes,
    },
    {
      id: "disk_usage",
      icon: PieChart,
      label: "ディスク使用量",
      description: "フォルダ別サイズ",
      color: "#06b6d4",
      onClick: actions.scanDiskUsage,
    },
    {
      id: "temp_cleaner",
      icon: Trash,
      label: "一時クリーン",
      description: "一時ファイル削除",
      color: "#f97316",
      onClick: actions.scanTempFiles,
    },
    {
      id: "duplicates",
      icon: Search,
      label: "重複スキャン",
      description: "重複ファイル検出",
      color: "#6366f1",
      onClick: actions.scanDuplicates,
    },
  ];
}
