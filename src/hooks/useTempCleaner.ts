import { listen } from '@tauri-apps/api/event';
import { useCallback, useEffect, useState } from 'react';
import { messages } from '../i18n/messages';
import { useConfirm } from '../lib/confirmContext';
import { notifyComplete } from '../lib/notify';
import { extractErrorMessage, invoke } from '../lib/tauri';
import { useToast } from '../lib/toastContext';
import { formatSize } from '../lib/utils';
import type { CleanResult, RecycleBinInfo, ScanProgress, TempScanResult } from '../types';

export function useTempCleaner() {
  const confirm = useConfirm();
  const notify = useToast();

  const [scanResult, setScanResult] = useState<TempScanResult | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<ScanProgress | null>(null);
  const [cleaning, setCleaning] = useState(false);
  const [recycleBinInfo, setRecycleBinInfo] = useState<RecycleBinInfo | null>(null);

  const handleScan = useCallback(async (): Promise<void> => {
    setScanning(true);
    setScanProgress({ phase: '準備中...', scanned_files: 0 });
    setScanResult(null);

    const unlistenProgress = listen<ScanProgress>('scan_progress', (event) => {
      setScanProgress(event.payload);
    });

    try {
      const result = await invoke<TempScanResult>('scan_temp_files', {});
      setScanResult(result);
      await notifyComplete('スキャン完了', `${result.total_files} 件の一時ファイルを検出しました`);
    } catch (e) {
      if (e !== 'Scan was cancelled') {
        const msg = extractErrorMessage(e);
        notify(`スキャンエラー: ${msg}`, 'error');
      }
    } finally {
      setScanning(false);
      setScanProgress(null);
      unlistenProgress.then((fn) => fn());
    }
  }, [notify]);

  const handleCleanAll = useCallback(async (): Promise<void> => {
    if (!scanResult) return;
    const allPaths = scanResult.categories.flatMap((c) => c.items.map((i) => i.path));
    if (allPaths.length === 0) return;

    const ok = await confirm(
      `${allPaths.length} 個の一時ファイルを削除します。よろしいですか？`,
      'クリーン確認',
    );
    if (!ok) return;

    setCleaning(true);
    try {
      const result = await invoke<CleanResult>('clean_temp_files', { paths: allPaths });
      setScanResult(null);
      notify(
        `${result.deleted_count} ファイル削除、${formatSize(result.freed_size)} 解放`,
        'success',
      );
    } catch (e) {
      const msg = extractErrorMessage(e);
      notify(`クリーンエラー: ${msg}`, 'error');
    } finally {
      setCleaning(false);
    }
  }, [scanResult, confirm, notify]);

  const handleCleanCategory = useCallback(
    async (categoryName: string): Promise<void> => {
      if (!scanResult) return;
      const category = scanResult.categories.find((c) => c.name === categoryName);
      if (!category) return;

      const paths = category.items.map((i) => i.path);
      const ok = await confirm(
        `${category.name} の ${paths.length} 個のファイルを削除します。`,
        'クリーン確認',
      );
      if (!ok) return;

      setCleaning(true);
      try {
        const result = await invoke<CleanResult>('clean_temp_files', { paths });
        // 削除したカテゴリを結果から除去
        setScanResult((prev) => {
          if (!prev) return null;
          const updated = prev.categories.filter((c) => c.name !== categoryName);
          return {
            categories: updated,
            total_files: updated.reduce((a, c) => a + c.file_count, 0),
            total_size: updated.reduce((a, c) => a + c.total_size, 0),
          };
        });
        notify(
          `${result.deleted_count} ファイル削除、${formatSize(result.freed_size)} 解放`,
          'success',
        );
      } catch (e) {
        const msg = extractErrorMessage(e);
        notify(`クリーンエラー: ${msg}`, 'error');
      } finally {
        setCleaning(false);
      }
    },
    [scanResult, confirm, notify],
  );

  const handleGetRecycleBinInfo = useCallback(async (): Promise<void> => {
    try {
      const info = await invoke<RecycleBinInfo>('get_recycle_bin_info');
      setRecycleBinInfo(info);
    } catch (e) {
      const msg = extractErrorMessage(e);
      notify(`ゴミ箱情報の取得に失敗しました: ${msg}`, 'error');
    }
  }, [notify]);

  // マウント時にゴミ箱情報を取得（TempCleanerView 側の useEffect を不要にする）
  useEffect(() => {
    void handleGetRecycleBinInfo();
  }, [handleGetRecycleBinInfo]);

  const handleEmptyRecycleBin = useCallback(async (): Promise<void> => {
    const ok = await confirm(messages.recycleBinEmptyConfirm, messages.recycleBin);
    if (!ok) return;

    setCleaning(true);
    try {
      const result = await invoke<CleanResult>('empty_recycle_bin');
      setRecycleBinInfo({ item_count: 0, total_size: 0 });
      notify(
        `${result.deleted_count} ファイル削除、${formatSize(result.freed_size)} 解放`,
        'success',
      );
    } catch (e) {
      const msg = extractErrorMessage(e);
      notify(`ゴミ箱の空にする操作に失敗しました: ${msg}`, 'error');
    } finally {
      setCleaning(false);
    }
  }, [confirm, notify]);

  return {
    scanResult,
    scanning,
    scanProgress,
    cleaning,
    recycleBinInfo,
    handleScan,
    handleCleanAll,
    handleCleanCategory,
    handleGetRecycleBinInfo,
    handleEmptyRecycleBin,
  };
}
