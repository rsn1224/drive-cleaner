// ==========================================
// Global Confirm Context
// Provides an in-app confirm() replacement for native ask()
// which hides behind frameless windows on Windows.
// ==========================================

import {
  createContext,
  type ReactElement,
  type ReactNode,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import { ConfirmModal } from '../components/ConfirmModal';

type ConfirmFn = (message: string, title?: string) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

interface PendingConfirm {
  message: string;
  title: string;
  resolve: (value: boolean) => void;
}

export function ConfirmProvider({ children }: { children: ReactNode }): ReactElement {
  const [pending, setPending] = useState<PendingConfirm | null>(null);
  // Use ref to avoid stale closure in confirm()
  const pendingRef = useRef<PendingConfirm | null>(null);

  const confirm = useCallback((message: string, title = '確認'): Promise<boolean> => {
    return new Promise((resolve) => {
      const entry: PendingConfirm = { message, title, resolve };
      pendingRef.current = entry;
      setPending(entry);
    });
  }, []);

  const handleConfirm = useCallback((): void => {
    pendingRef.current?.resolve(true);
    pendingRef.current = null;
    setPending(null);
  }, []);

  const handleCancel = useCallback((): void => {
    pendingRef.current?.resolve(false);
    pendingRef.current = null;
    setPending(null);
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {pending && (
        <ConfirmModal
          message={pending.message}
          title={pending.title}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used inside ConfirmProvider');
  return ctx;
}
