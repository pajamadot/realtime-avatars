'use client';

interface ProgressTrackerProps {
  sections: Array<{
    id: string;
    label: string;
  }>;
  currentSection: string;
  color?: string;
}

export default function ProgressTracker({
  sections,
  currentSection,
  color = 'var(--accent)',
}: ProgressTrackerProps) {
  const currentIndex = sections.findIndex((s) => s.id === currentSection);

  return (
    <div className="sticky top-20 z-40 bg-[var(--bg)] py-3 border-b border-[var(--border)] mb-8">
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {sections.map((section, index) => {
          const isActive = section.id === currentSection;
          const isComplete = index < currentIndex;

          return (
            <a
              key={section.id}
              href={`#${section.id}`}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-full text-sm whitespace-nowrap
                transition-colors
                ${isActive
                  ? 'font-medium'
                  : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                }
              `}
              style={isActive ? { backgroundColor: color, color: 'white' } : undefined}
            >
              <span
                className={`
                  w-5 h-5 rounded-full flex items-center justify-center text-xs
                  ${isComplete ? 'bg-green-500 text-white' : ''}
                  ${!isComplete && !isActive ? 'border border-[var(--border)]' : ''}
                `}
                style={isActive ? { backgroundColor: 'rgba(255,255,255,0.3)' } : undefined}
              >
                {isComplete ? '✓' : index + 1}
              </span>
              <span className="hidden sm:inline">{section.label}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
