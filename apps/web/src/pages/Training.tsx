import { useState } from "react";
import SquareOne from "@/components/square-one";

type TrainingOption = "square1-csp";

const TRAINING_OPTIONS: { id: TrainingOption; name: string; description: string }[] = [
    {
        id: "square1-csp",
        name: "Square-1 CSP",
        description: "Practice cube shape planning on an interactive Square-1.",
    },
];

const Training = () => {
    const [selected, setSelected] = useState<TrainingOption | null>(null);

    if (!selected) {
        return (
            <div className="max-w-2xl mx-auto py-10 px-4">
                <h1 className="text-2xl font-semibold mb-6">Training</h1>
                <div className="space-y-3">
                    {TRAINING_OPTIONS.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => setSelected(option.id)}
                            className="w-full text-left p-4 rounded-lg border border-foreground/10 hover:border-foreground/25 hover:bg-foreground/[0.03] transition-colors"
                        >
                            <div className="font-medium">{option.name}</div>
                            <div className="text-sm text-foreground/45">{option.description}</div>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto py-10 px-4">
            <button
                onClick={() => setSelected(null)}
                className="text-sm text-foreground/45 hover:text-foreground mb-6"
            >
                &larr; Back to training
            </button>
            <h1 className="text-2xl font-semibold mb-6">Square-1 CSP</h1>
            <SquareOne className="h-[28rem] w-full rounded-xl overflow-hidden relative border border-foreground/10" />
        </div>
    );
};

export default Training;
