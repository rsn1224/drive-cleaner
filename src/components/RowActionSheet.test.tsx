import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { FileNode } from '../types';
import { RowActionSheet } from './RowActionSheet';

const node: FileNode = { name: 'report.pdf', path: '/tmp/report.pdf', is_dir: false, size: 1024 };

describe('RowActionSheet', () => {
  it('shows the target name and all actions', () => {
    render(
      <RowActionSheet
        node={node}
        actions={[
          { id: 'preview', icon: 'visibility', label: 'プレビュー', onSelect: vi.fn() },
          { id: 'delete', icon: 'delete', label: 'ゴミ箱へ', tone: 'error', onSelect: vi.fn() },
        ]}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('report.pdf')).toBeInTheDocument();
    expect(screen.getByText('プレビュー')).toBeInTheDocument();
    expect(screen.getByText('ゴミ箱へ')).toBeInTheDocument();
  });

  it('runs the action and closes the sheet', () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();
    render(
      <RowActionSheet
        node={node}
        actions={[{ id: 'delete', icon: 'delete', label: 'ゴミ箱へ', onSelect }]}
        onClose={onClose}
      />,
    );

    fireEvent.click(screen.getByText('ゴミ箱へ'));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on Escape', () => {
    const onClose = vi.fn();
    render(<RowActionSheet node={node} actions={[]} onClose={onClose} />);

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
