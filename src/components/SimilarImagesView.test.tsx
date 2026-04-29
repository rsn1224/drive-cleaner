// @AC AC-SimilarImagesView
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SimilarImagesView } from './SimilarImagesView';

const baseProps = {
  groups: [],
  scanning: false,
  scanProgress: null,
  onPreview: vi.fn(),
  onDelete: vi.fn(),
};

describe('SimilarImagesView', () => {
  it('スキャン中にスピナーを表示する', () => {
    render(
      <SimilarImagesView
        {...baseProps}
        scanning={true}
        scanProgress={{ phase: 'スキャン中...', scanned_files: 0 }}
      />,
    );
    expect(document.querySelector('.animate-spin')).toBeTruthy();
  });

  it('グループなしで空メッセージを表示する', () => {
    render(<SimilarImagesView {...baseProps} scanning={false} />);
    expect(screen.getByText(/画像|見つかり/)).toBeTruthy();
  });
});
