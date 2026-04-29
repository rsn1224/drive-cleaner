// @AC AC-LargeFilesView
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { LargeFilesView } from './LargeFilesView';

const baseProps = {
  largeFiles: [],
  scanning: false,
  scanProgress: null,
  totalSize: 0,
  onPreview: vi.fn(),
  onDelete: vi.fn(),
};

describe('LargeFilesView', () => {
  it('スキャン中にスピナーを表示する', () => {
    render(
      <LargeFilesView
        {...baseProps}
        scanning={true}
        scanProgress={{ phase: 'スキャン中...', scanned_files: 0 }}
      />,
    );
    expect(document.querySelector('.animate-spin')).toBeTruthy();
  });

  it('ファイルなしで空メッセージを表示する', () => {
    render(<LargeFilesView {...baseProps} scanning={false} />);
    expect(screen.getByText(/ファイル|見つかり/)).toBeTruthy();
  });
});
