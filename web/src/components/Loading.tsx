import React from 'react';

const Loading: React.FC = () => {
    return (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none animate-reveal">
            <div className="dots">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
            </div>
        </div>
    );
};

export default Loading;
