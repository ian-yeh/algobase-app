interface StatCardProps {
    label: string;
    value: string;
}

const StatCard = ({ label, value }: StatCardProps) => (
    <div className="bg-surface border border-line rounded-2xl p-6 sm:p-7 transition-colors hover:border-foreground/15">
        <span className="text-foreground/45 text-[11px] font-semibold tracking-[0.12em] uppercase">
            {label}
        </span>
        <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-mono font-medium tracking-tight tabular-nums">
                {value}
            </span>
            {!value.includes(':') && value !== '--' && (
                <span className="text-foreground/30 text-sm font-mono">s</span>
            )}
        </div>
    </div>
);

export default StatCard;
