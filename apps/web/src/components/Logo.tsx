import React from 'react';

interface LogoProps {
    className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "" }) => {
    return (
        <span className={`text-xl font-sans font-semibold tracking-tight ${className}`}>
            Algobase
        </span>
    );
};

export default Logo;
