// @AC AC-TempCleanerView
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TempCleanerView } from './TempCleanerView';

const baseProps = {
  scanResult: null,
  scanning: false,
  scanProgress: null,
  cleaning: false,
  recycleBinInfo: null,
  onCleanAll: vi.fn(),
  onCleanCategory: vi.fn(),
  onEmptyRecycleBin: vi.fn(),
};

describe('TempCleanerView', () => {
  it('スキャン中にスピナーを表示する', () => {
    render(
      <TempCleanerView
        {...baseProps}
        scanning={true}
        scanProgress={{ phase: 'スキャン中...', scanned_files: 0 }}
      />,
    );
    expect(document.querySelector('.animate-spin')).toBeTruthy();
  });

  it('結果なしで空メッセージを表示する', () => {
    render(<TempCleanerView {...baseProps} scanning={false} />);
    expect(screen.getByText(/一時ファイル|見つかり/)).toBeTruthy();
  });
});
