// ==========================================
// i18n Messages - Drive Cleaner
// ==========================================

export const messages = {
  // Layout
  appTitle: "DRIVE_CLEANER",
  back: "戻る",
  minimize: "最小化",
  maximize: "最大化",
  close: "閉じる",
  
  // Navigation
  navDashboard: "DASHBOARD",
  navFiles: "FILES",
  navConfig: "CONFIG",
  navLogs: "LOGS",
  
  // Modes
  modeBrowser: "FILE_BROWSER",
  modeDuplicates: "DUPLICATE_SCAN",
  modeLargeFiles: "LARGE_FILE_SCAN",
  modeEmptyFolders: "EMPTY_FOLDER_SCAN",
  modeOldFiles: "OLD_FILE_SCAN",
  modeFileTypes: "FILE_TYPE_ANALYSIS",
  modeDiskUsage: "DISK_USAGE_ANALYSIS",
  modeTempCleaner: "TEMP_CLEANER",
  
  // Modes
  modeSimilarImages: "SIMILAR_IMAGE_SCAN",

  // Quick Actions
  qaLargeFiles: "大容量ファイル",
  qaLargeFilesDesc: "トップ100件を検出",
  qaEmptyFolders: "空フォルダ",
  qaEmptyFoldersDesc: "空のフォルダを検出",
  qaOldFiles: "古いファイル",
  qaOldFilesDesc: "1年以上未更新",
  qaFileTypes: "種別分析",
  qaFileTypesDesc: "カテゴリ別集計",
  qaDiskUsage: "ディスク使用量",
  qaDiskUsageDesc: "フォルダ別サイズ",
  qaTempCleaner: "一時クリーン",
  qaTempCleanerDesc: "一時ファイル削除",
  qaDuplicates: "重複スキャン",
  qaDuplicatesDesc: "重複ファイル検出",
  qaSimilarImages: "類似画像",
  qaSimilarImagesDesc: "視覚的に類似した画像を検出",
  
  // Common
  preview: "プレビュー",
  delete: "ゴミ箱へ",
  secureDelete: "セキュア削除",
  scanning: "スキャン中...",
  preparing: "準備中...",
  filesProcessed: "ファイル処理済み",
  files: "ファイル",
  folders: "フォルダ",
  total: "合計",
  
  // Browse
  folderEmpty: "フォルダは空です",
  loading: "読み込み中...",
  sortName: "名前",
  sortSize: "サイズ",
  goUp: "親フォルダへ",
  dropToScan: "DROP_FOLDER_TO_SCAN",
  
  // Duplicates
  duplicateGroups: "グループ",
  duplicateGroup: "重複グループ",
  saveable: "節約可能",
  keep: "KEEP",
  wastedSpace: "無駄にしている容量",
  noDuplicatesFound: "重複ファイルは見つかりませんでした（1MB以上）",
  
  // Large Files
  noLargeFilesFound: "大容量ファイルは見つかりませんでした",
  largeFilesMin: "（1 MB 以上）",
  largeFilesCount: "個の大容量ファイル",
  
  // Empty Folders
  noEmptyFoldersFound: "空フォルダは見つかりませんでした",
  emptyFoldersCount: "個の空フォルダ",
  deleteAll: "すべて削除",
  
  // Old Files
  noOldFilesFound: "1年以上未更新のファイルは見つかりませんでした",
  oldFilesCount: "個の古いファイル（1年以上未更新）",
  daysAgo: "日前",
  
  // File Types
  noFilesFound: "ファイルが見つかりませんでした",
  categories: "カテゴリ",
  
  // Disk Usage
  selectFolder: "フォルダを選択してください",
  noSubfolders: "サブフォルダがありません",
  
  // Temp Cleaner
  noTempFilesFound: "一時ファイルは見つかりませんでした",
  tempFiles: "一時ファイル",
  cleanAll: "すべてクリーン",
  clean: "クリーン",
  cleaning: "クリーン中...",
  processing: "処理中...",
  executePurge: "EXECUTE_PURGE",
  fileList: "ファイル一覧",
  
  // TempCleanerView
  tempCleanerViewTitle: "一時クリーンビュー",
  tempCleanerViewSubtitle: "一時ファイルをクリーンする",
  tempCleanerViewDescription: "一時ファイルをクリーンするには、以下のボタンをクリックしてください。",
  tempCleanerViewButton: "クリーン",
  
  // Preview Modal
  previewTitle: "プレビュー",
  cannotPreview: "このファイル形式はプレビューできません",
  binaryFile: "バイナリファイル",
  
  // Error
  unexpectedError: "予期せぬエラーが発生しました",
  reloadApp: "アプリをリロード",
  
  // Drive Overview
  driveOverviewTitle: "DRIVE_STATUS",
  driveUsed: "使用中",
  driveFree: "空き",
  driveTotal: "合計",
  driveLoading: "ドライブ情報を取得中...",
  driveNone: "ドライブが見つかりません",

  // Recycle Bin
  recycleBin: "ゴミ箱",
  recycleBinItems: "個のアイテム",
  recycleBinEmpty: "ゴミ箱は空です",
  recycleBinEmptyAction: "空にする",
  recycleBinEmptyConfirm: "ゴミ箱を空にします。この操作は元に戻せません。よろしいですか？",

  // Duplicates - bulk actions
  bulkDelete: "一括削除",
  bulkDeleteSelected: "選択削除",
  exportJson: "JSON",
  exportCsv: "CSV",
  selectAll: "全選択（1枚保持）",
  selectShortest: "最短パス保持",
  clearSelection: "選択解除",
  selectedCount: "件選択中",

  // Status bar labels (hardcoded text to messages)
  emptyFolders: "空フォルダ",
  autoSelect: "自動選択:",
  fileSize: "サイズ",
  markForDeletion: "削除",
  directFiles: "（直接ファイル）",

  // Similar Images
  noSimilarImagesFound: "類似画像は見つかりませんでした",
  similarImagesGroup: "類似グループ",
  similarImagesGroups: "グループ",
  hammingDistance: "距離",

  // Move / Rename / Organize
  move: "移動",
  rename: "リネーム",
  organizeByType: "タイプ別に整理",
  moveItem: "ファイルを移動",
  moveConfirm: "移動先フォルダを選択してください",
  moveSuccess: "移動しました",
  moveFailed: "移動に失敗しました",
  renameTitle: "リネーム",
  renameCurrentName: "現在の名前",
  renameNewName: "新しい名前",
  renamePlaceholder: "新しいファイル名を入力...",
  renameConfirm: "確定",
  renameCancel: "キャンセル",
  renameSuccess: "リネームしました",
  renameFailed: "リネームに失敗しました",
  bulkMoveSelected: "まとめて移動",
  bulkMoveSuccess: "件移動しました",
  bulkMoveFailed: "件失敗しました",
  organizeSuccess: "件のファイルを整理しました",
  organizeConfirm: "このフォルダ内のファイルをタイプ別（Images / Documents / Videos / Music / Archives / Others）に整理します。よろしいですか？",
  organizeFailed: "整理に失敗しました",

  // Placeholder
  comingSoon: "COMING_SOON",
  configModule: "CONFIG_MODULE",
  logViewer: "LOG_VIEWER",
} as const;

export type MessageKey = keyof typeof messages;
