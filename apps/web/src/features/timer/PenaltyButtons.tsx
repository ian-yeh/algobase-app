import type { Penalty } from '@/lib/stats';

const OPTIONS: { value: Penalty; label: string }[] = [
    { value: 'none', label: 'OK' },
    { value: 'plus2', label: '+2' },
    { value: 'dnf', label: 'DNF' },
];

// Segmented OK / +2 / DNF control for one solve.
const PenaltyButtons = ({ penalty, onChange }: { penalty: Penalty; onChange: (penalty: Penalty) => void }) => (
    <div role="group" aria-label="Penalty" className="inline-flex rounded-md border border-foreground/10 p-0.5">
        {OPTIONS.map(({ value, label }) => (
            <button
                key={value}
                type="button"
                aria-pressed={penalty === value}
                // Inside the timer's touch area: don't start a hold, and don't keep focus so Space still starts the next solve.
                onTouchStart={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onChange(value)}
                className={`min-w-12 rounded px-3 py-1 text-sm font-medium tabular-nums transition-colors ${
                    penalty === value ? 'bg-foreground text-background' : 'text-foreground/60 hover:bg-foreground/5 hover:text-foreground'
                }`}
            >
                {label}
            </button>
        ))}
    </div>
);

export default PenaltyButtons;
