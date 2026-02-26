import React from 'react';

interface ScrambleDisplayProps {
    scramble: string;
}

const ScrambleDisplay: React.FC<ScrambleDisplayProps> = ({ scramble }) => {
    return (
        <div className="w-full text-center py-8">
            <div className="text-xl md:text-2xl font-medium tracking-wide text-foreground leading-relaxed max-w-3xl mx-auto px-4">
                {scramble}
            </div>
        </div>
    );
};

export default ScrambleDisplay;
