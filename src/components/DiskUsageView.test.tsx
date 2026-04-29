// @AC AC-DiskUsageView
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DiskUsageView } from './DiskUsageView';

const baseProps = {
  currentFolder: null,
  scanning: false,
  scanProgress: null,
  breadcrumbs: [],
  onDrillDown: vi.fn(),
  onNavigateUp: vi.fn(),
};

describe('DiskUsageView', () => {
  it('スキャン中にスピナーを表示する', () => {
    render(
      <DiskUsageView
        {...baseProps}
        scanning={true}
        scanProgress={{ phase: 'スキャン中...', scanned_files: 0 }}
      />,
    );
    expect(document.querySelector('.animate-spin')).toBeTruthy();
  });

  it('フォルダ未選択で空メッセージを表示する', () => {
    render(<DiskUsageView {...baseProps} scanning={false} />);
    expect(screen.getByText(/フォルダ|選択/)).toBeTruthy();
  });
});
