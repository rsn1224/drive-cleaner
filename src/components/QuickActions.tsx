// ==========================================
// Quick Actions Component for Dashboard
// ==========================================

import type { ReactElement } from "react";
import type { LucideIcon } from "lucide-react";

interface QuickAction {
  id: string;
  icon: LucideIcon;
  label: string;
  description: string;
  color: string;
  onClick: () => void;
}

interface QuickActionsProps {
  actions: QuickAction[];
  disabled: boolean;
}

export function QuickActions({ actions, disabled }: QuickActionsProps): ReactElement {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 flex-shrink-0">
      {actions.map((action) => {
        const Icon = action.icon;
        
        return (
          <div
            key={action.id}
            onClick={disabled ? undefined : action.onClick}
            className={`
              min-w-[140px] bg-[#111827] border border-[#1f2937] rounded-lg p-3 cursor-pointer
              hover:bg-[#1f2937] transition-all
              ${disabled ? "opacity-50 pointer-events-none" : ""}
            `}
            style={{
              borderTopColor: action.color,
              borderTopWidth: "3px",
            }}
          >
            <div className="flex flex-col items-center text-center gap-2">
              {/* Icon with color */}
              <Icon 
                size={24} 
                style={{ color: action.color }}
              />
              
              {/* Label */}
              <div className="text-[#d1d5db] text-sm font-medium">
                {action.label}
              </div>
              
              {/* Description */}
              <div className="text-[11px] text-[#6b7280] leading-tight">
                {action.description}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
