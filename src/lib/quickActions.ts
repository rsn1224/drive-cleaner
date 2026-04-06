// ==========================================
// Quick Actions Builder
// ==========================================

import {
    BarChart3,
    Clock,
    FolderOpen,
    HardDrive,
    Images,
    PieChart,
    Search,
    Trash,
} from "lucide-react";

import type { ScanActions } from "../hooks/useScanActions";
import { messages } from "../i18n/messages";

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
      label: messages.qaLargeFiles,
      description: messages.qaLargeFilesDesc,
      color: "#22c55e",
      onClick: actions.scanLargeFiles,
    },
    {
      id: "empty_folders",
      icon: FolderOpen,
      label: messages.qaEmptyFolders,
      description: messages.qaEmptyFoldersDesc,
      color: "#f59e0b",
      onClick: actions.scanEmptyFolders,
    },
    {
      id: "old_files",
      icon: Clock,
      label: messages.qaOldFiles,
      description: messages.qaOldFilesDesc,
      color: "#ef4444",
      onClick: actions.scanOldFiles,
    },
    {
      id: "file_types",
      icon: BarChart3,
      label: messages.qaFileTypes,
      description: messages.qaFileTypesDesc,
      color: "#8b5cf6",
      onClick: actions.scanFileTypes,
    },
    {
      id: "disk_usage",
      icon: PieChart,
      label: messages.qaDiskUsage,
      description: messages.qaDiskUsageDesc,
      color: "#06b6d4",
      onClick: actions.scanDiskUsage,
    },
    {
      id: "temp_cleaner",
      icon: Trash,
      label: messages.qaTempCleaner,
      description: messages.qaTempCleanerDesc,
      color: "#f97316",
      onClick: actions.scanTempFiles,
    },
    {
      id: "duplicates",
      icon: Search,
      label: messages.qaDuplicates,
      description: messages.qaDuplicatesDesc,
      color: "#6366f1",
      onClick: actions.scanDuplicates,
    },
    {
      id: "similar_images",
      icon: Images,
      label: messages.qaSimilarImages,
      description: messages.qaSimilarImagesDesc,
      color: "#ec4899",
      onClick: actions.scanSimilarImages,
    },
  ];
}
