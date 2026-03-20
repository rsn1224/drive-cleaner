// ==========================================
// Quick Actions Component for Dashboard
// ==========================================

import type { ReactElement } from "react";

import type { QuickAction } from "../lib/quickActions";

interface QuickActionsProps {
  actions: QuickAction[];
  disabled: boolean;
}

export function QuickActions({ actions, disabled }: QuickActionsProps): ReactElement {
  return (
    <div className="grid grid-cols-2 gap-px bg-primary/5">
      {actions.map((action) => {
        const Icon = action.icon;
        
        return (
          <div
            key={action.id}
            onClick={disabled ? undefined : action.onClick}
            className={`
              bg-black border border-white/5 p-4 cursor-pointer
              hover:border-primary/40 transition-all relative
              hud-bracket
              ${disabled ? "opacity-50 pointer-events-none" : ""}
            `}
            style={{ borderTopColor: action.color, borderTopWidth: "2px" }}
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white/5">
                <Icon size={20} style={{ color: action.color }} className="glow-cyan" />
              </div>
              <div>
                <div className="font-mono font-bold text-sm tracking-widest text-white/90 uppercase">
                  {action.label}
                </div>
                <div className="text-[10px] text-white/40 uppercase font-bold tracking-wider">
                  {action.description}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default QuickActions;
