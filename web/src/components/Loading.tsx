import React from 'react';

const Loading: React.FC = () => {
    return (
        <div className="flex items-center justify-center min-h-full py-20">
            <div className="scene">
                <div className="cube">
                    <div className="face front"></div>
                    <div className="face back"></div>
                    <div className="face left"></div>
                    <div className="face right"></div>
                    <div className="face top"></div>
                    <div className="face bottom"></div>
                </div>
            </div>
        </div>
    );
};

export default Loading;
