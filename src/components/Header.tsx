import React from 'react';

export type ActiveTab = 'scanner' | 'guide' | 'schedule' | 'caregiver' | 'database';

interface HeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onQuickScan: () => void;
  unreviewedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onQuickScan,
  unreviewedCount
}) => {
  const navItems: { id: ActiveTab; label: string }[] = [
    { id: 'scanner', label: 'Scan Prescription' },
    { id: 'guide', label: 'Medicine Guide' },
    { id: 'schedule', label: 'Daily Schedule' },
    { id: 'caregiver', label: 'Caregiver View' },
    { id: 'database', label: 'Drug Database' }
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#FAF8F5]/95 backdrop-blur-sm border-b border-zinc-200/80">
      <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-8 px-6 py-4">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#scanner"
          onClick={(e) => {
            e.preventDefault();
            onSelectTab('scanner');
          }}
          className="font-display text-xl font-bold tracking-tight text-zinc-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D96B27]"
        >
          RxLens
        </a>

        {/* Zone 2: 5 concise single-line text navigation links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-600"
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  onSelectTab(item.id);
                }}
                aria-current={isActive ? 'page' : undefined}
                className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                  isActive
                    ? 'border-[#D96B27] text-zinc-950 font-semibold'
                    : 'border-transparent text-zinc-600 hover:text-zinc-900 hover:border-zinc-300'
                }`}
              >
                {item.label}
                {item.id === 'scanner' && unreviewedCount > 0 ? ` (${unreviewedCount})` : ''}
              </a>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onQuickScan}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#D96B27] rounded-lg hover:bg-[#C05A1C] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D96B27]"
          >
            Upload Prescription Photo
          </button>
        </div>
      </div>

      {/* Mobile navigation strip */}
      <nav
        aria-label="Mobile Navigation"
        className="flex md:hidden items-center gap-5 overflow-x-auto px-6 py-2.5 border-t border-zinc-200/70 bg-white text-xs font-medium text-zinc-600"
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`py-1 whitespace-nowrap shrink-0 border-b-2 transition-colors ${
                isActive
                  ? 'border-[#D96B27] text-zinc-950 font-semibold'
                  : 'border-transparent text-zinc-600'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
