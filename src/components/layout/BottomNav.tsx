import type { ReactElement } from 'react';
import { messages } from '../../i18n/messages';

type NavTab = 'dashboard' | 'files' | 'settings' | 'logs';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  hidden?: boolean;
}

const TABS: { id: NavTab; icon: string; label: string }[] = [
  { id: 'dashboard', icon: 'dashboard', label: messages.navDashboard },
  { id: 'files', icon: 'folder_open', label: messages.navFiles },
  { id: 'settings', icon: 'settings', label: messages.navConfig },
  { id: 'logs', icon: 'terminal', label: messages.navLogs },
];

export function BottomNav({ activeTab, onTabChange, hidden }: BottomNavProps): ReactElement | null {
  if (hidden) return null;

  return (
    <nav
      className="fixed bottom-0 w-full z-50 bg-black/98 backdrop-blur-2xl border-t border-primary/10 safe-bottom safe-x"
      aria-label="メインナビゲーション"
    >
      <div className="flex justify-around items-stretch h-16">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center px-2 sm:px-4 transition-all relative focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${
                isActive ? 'text-primary' : 'text-white/40 hover:text-primary'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && (
                <div className="absolute -top-px w-10 h-0.5 bg-primary shadow-glow-primary" />
              )}
              <span className="material-symbols-outlined mb-1 text-xl">{tab.icon}</span>
              <span className="hud-label text-[9px]">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
