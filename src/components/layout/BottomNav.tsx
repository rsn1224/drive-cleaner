import type { ReactElement } from "react";

type NavTab = "dashboard" | "files" | "settings" | "logs";

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  hidden?: boolean;
}

const TABS: { id: NavTab; icon: string; label: string }[] = [
  { id: "dashboard", icon: "dashboard", label: "DASHBOARD" },
  { id: "files", icon: "folder_open", label: "FILES" },
  { id: "settings", icon: "settings", label: "CONFIG" },
  { id: "logs", icon: "terminal", label: "LOGS" },
];

export function BottomNav({ activeTab, onTabChange, hidden }: BottomNavProps): ReactElement | null {
  if (hidden) return null;

  return (
    <nav className="fixed bottom-0 w-full z-50 flex justify-around items-center h-16 bg-black/98 backdrop-blur-2xl border-t border-primary/10">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center px-4 h-full transition-all relative ${
              isActive
                ? "text-primary"
                : "text-white/40 hover:text-primary"
            }`}
          >
            {isActive && (
              <div className="absolute -top-px w-10 h-0.5 bg-primary shadow-[0_0_12px_#00F0FF]" />
            )}
            <span className="material-symbols-outlined mb-1 text-xl">{tab.icon}</span>
            <span className="hud-label text-[9px]">{isActive ? tab.label : tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default BottomNav;
