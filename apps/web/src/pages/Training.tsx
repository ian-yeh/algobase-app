import { Link } from "react-router-dom";

const TRAINING_OPTIONS = [
    {
        id: "square1-csp",
        name: "Square-1 CSP",
        description: "Practice cube shape planning on an interactive Square-1.",
        path: "/training/square1-csp",
    },
];

const Training = () => (
    <div className="max-w-2xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-semibold mb-6">Training</h1>
        <div className="space-y-3">
            {TRAINING_OPTIONS.map((option) => (
                <Link
                    key={option.id}
                    to={option.path}
                    className="block w-full text-left p-4 rounded-lg border border-foreground/10 hover:border-foreground/25 hover:bg-foreground/[0.03] transition-colors"
                >
                    <div className="font-medium">{option.name}</div>
                    <div className="text-sm text-foreground/45">{option.description}</div>
                </Link>
            ))}
        </div>
    </div>
);

export default Training;
