interface StatCardProps {
    label: string;
    value: string;
    className?: string;
}

const StatCard = ({ label, value, className = '' }: StatCardProps) => (
    <div className={`bg-background px-5 py-4 ${className}`}>
        <dt className="text-sm text-foreground/55">{label}</dt>
        <dd className="mt-1 text-2xl font-mono font-medium tracking-tight tabular-nums">{value}</dd>
    </div>
);

export default StatCard;
