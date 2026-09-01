import React from "react";

export const MoveButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }
> = ({ children, className, ...props }) => (
  <button
    {...props}
    className={`font-mono text-[11px] leading-none rounded-md border border-foreground/10 text-foreground/45 px-2 py-1.5 hover:border-foreground/25 hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors ${className ?? ""}`}
  >
    {children}
  </button>
);
