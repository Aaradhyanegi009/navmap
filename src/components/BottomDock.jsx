import React from 'react';
import {
  Home,
  CheckCircle2,
  Table2,
  FileText,
  Layers,
  Plus,
} from 'lucide-react';

const DOCK_TABS = [
  { id: 'navigate', label: 'Navigate', icon: Home },
  { id: 'visualizer', label: 'Algorithm Visualizer', icon: CheckCircle2 },
  { id: 'editor', label: 'Graph Editor', icon: Table2 },
  { id: 'api', label: 'API Inspector', icon: FileText },
  { id: 'layers', label: 'Layers', icon: Layers },
];

export default function BottomDock({
  activeTab,
  onSelectTab,
  onFabClick,
  isAddingCustomNode,
}) {
  return (
    <div className="flex items-center justify-between gap-3 w-full">
      {/* Matte Pill Navigation Dock (#18181C) */}
      <nav
        aria-label="Primary Navigation"
        className="flex-1 bg-[#18181C]/95 backdrop-blur-2xl border border-white/[0.09] rounded-full px-2 py-1.5 flex items-center justify-between shadow-[0_16px_40px_rgba(0,0,0,0.75)]"
      >
        {DOCK_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              title={tab.label}
              aria-label={tab.label}
              className={`relative h-11 px-3.5 rounded-full flex items-center justify-center transition-all duration-200 ${
                isActive
                  ? 'bg-white text-[#09090B] shadow-md scale-[1.02]'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon
                className="w-5 h-5"
                strokeWidth={isActive ? 2.2 : 1.8}
              />
            </button>
          );
        })}
      </nav>

      {/* Detached Lavender Circular FAB (+ / Custom Node & Instant Route) */}
      <button
        onClick={onFabClick}
        title="Add Custom Map Node (+)"
        aria-label="Add Custom Map Node"
        className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 shadow-[0_10px_28px_rgba(165,148,249,0.35)] transition-all duration-200 active:scale-95 ${
          isAddingCustomNode
            ? 'bg-[#4ADE80] text-[#09090B] rotate-45'
            : 'bg-[#A594F9] text-[#09090B] hover:brightness-110'
        }`}
      >
        <Plus className="w-6 h-6" strokeWidth={2.4} />
      </button>
    </div>
  );
}
