// ==========================================
// Drive Overview Component
// ==========================================

import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';

import { messages } from '../i18n/messages';
import { invoke } from '../lib/tauri';
import { formatSize } from '../lib/utils';
import type { DriveInfo } from '../types';

function UsageBar({ pct }: { pct: number }): ReactElement {
  const color = pct >= 90 ? 'bg-error' : pct >= 70 ? 'bg-warning' : 'bg-primary';
  return (
    <div className="h-1.5 w-full bg-white/10 mt-2 mb-1">
      <div
        className={`h-full transition-all ${color}`}
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  );
}

export function DriveOverview(): ReactElement {
  const [drives, setDrives] = useState<DriveInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    invoke<DriveInfo[]>('get_drive_info')
      .then(setDrives)
      .catch(() => {
        // 失敗時は drives=[] のまま → messages.driveNone が表示される
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="hud-label text-white/40 text-center py-2">{messages.driveLoading}</p>;
  }

  if (drives.length === 0) {
    return <p className="hud-label text-white/40 text-center py-2">{messages.driveNone}</p>;
  }

  return (
    <div>
      <p className="hud-label text-white/40 text-[10px] mb-2 tracking-widest">
        {messages.driveOverviewTitle}
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {drives.map((drive) => {
          const pct = drive.total > 0 ? Math.round((drive.used / drive.total) * 100) : 0;
          const textColor = pct >= 90 ? 'text-error' : pct >= 70 ? 'text-warning' : 'text-primary';

          return (
            <div
              key={drive.mount_point}
              className="bg-black border border-white/10 p-3 hover:border-primary/40 transition-colors"
            >
              <div className="flex justify-between items-baseline">
                <span className={`font-mono font-bold text-base ${textColor}`}>{drive.name}</span>
                <span className="text-[10px] text-white/30 font-mono">{drive.fs_type}</span>
              </div>

              <UsageBar pct={pct} />

              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-white/50">
                  {messages.driveUsed} {formatSize(drive.used)}
                </span>
                <span className={textColor}>{pct}%</span>
              </div>
              <div className="text-[10px] text-white/30 font-mono mt-0.5">
                {messages.driveFree} {formatSize(drive.free)} / {messages.driveTotal}{' '}
                {formatSize(drive.total)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
