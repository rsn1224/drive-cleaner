import {
  createContext,
  type ReactElement,
  type ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";

type ToastKind = "success" | "error" | "info" | "warning";

interface Toast {
  id: number;
  message: string;
  kind: ToastKind;
}

type NotifyFn = (message: string, kind?: ToastKind) => void;

const ToastContext = createContext<NotifyFn | null>(null);

export function ToastProvider({ children }: { children: ReactNode }): ReactElement {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = useCallback((message: string, kind: ToastKind = "info"): void => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, kind }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-2 font-mono text-xs border max-w-xs break-words ${
              toast.kind === "error"
                ? "bg-black border-error/60 text-error"
                : toast.kind === "success"
                  ? "bg-black border-secondary/60 text-secondary"
                  : toast.kind === "warning"
                    ? "bg-black border-warning/60 text-warning"
                    : "bg-black border-primary/60 text-primary"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): NotifyFn {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
