// @AC AC-DuplicateGroupCard
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DuplicateGroupCard } from './DuplicateGroupCard';

const group = {
  hash: 'abc123',
  size: 1024,
  paths: ['/keep/file.txt', '/dup/file.txt', '/dup2/file.txt'],
};

const baseProps = {
  group,
  selectedPaths: new Set<string>(),
  onTogglePath: vi.fn(),
  onPreview: vi.fn(),
  onDelete: vi.fn(),
};

describe('DuplicateGroupCard', () => {
  it('全パスを表示する', () => {
    render(<DuplicateGroupCard {...baseProps} />);
    for (const p of group.paths) {
      expect(screen.getByText(p)).toBeTruthy();
    }
  });

  it('最初のパスに KEEP バッジを表示する', () => {
    render(<DuplicateGroupCard {...baseProps} />);
    expect(screen.getByText('KEEP')).toBeTruthy();
  });

  it('選択済みパスに削除バッジを表示する', () => {
    render(
      <DuplicateGroupCard
        {...baseProps}
        selectedPaths={new Set<string>(group.paths.slice(1, 2))}
      />,
    );
    expect(screen.getByText(/削除/)).toBeTruthy();
  });

  it('チェックボックス変更で onTogglePath を呼ぶ', async () => {
    const onTogglePath = vi.fn();
    render(<DuplicateGroupCard {...baseProps} onTogglePath={onTogglePath} />);
    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes[0]?.click();
    expect(onTogglePath).toHaveBeenCalledWith(group.paths[0]);
  });
});
