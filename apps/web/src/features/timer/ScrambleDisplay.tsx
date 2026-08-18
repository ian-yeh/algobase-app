import React from 'react';
import { RefreshCw } from 'lucide-react';

interface ScrambleDisplayProps {
    scramble: string;
    onNewScramble?: () => void;
}

const ScrambleDisplay: React.FC<ScrambleDisplayProps> = ({ scramble, onNewScramble }) => {
    return (
        <div className="w-full text-center py-8">
            <div className="text-xl md:text-2xl font-sans font-medium tracking-wide text-foreground leading-relaxed max-w-3xl mx-auto px-4">
                {scramble}
            </div>
            {onNewScramble && (
                <button
                    type="button"
                    onClick={onNewScramble}
                    title="New scramble"
                    aria-label="New scramble"
                    className="mt-4 p-2 text-foreground/30 hover:text-foreground transition-colors active:scale-90"
                >
                    <RefreshCw size={16} />
                </button>
            )}
        </div>
    );
};

export default ScrambleDisplay;
