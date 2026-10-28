import React from 'react';

interface CubeLogoProps {
    className?: string;
}

const CubeLogo: React.FC<CubeLogoProps> = ({ className = "w-8 h-8" }) => {
    return (
        <img
            src="/cube.png"
            alt="Algobase"
            className={`object-contain mix-blend-multiply dark:mix-blend-normal ${className}`}
        />
    );
};

export default CubeLogo;
