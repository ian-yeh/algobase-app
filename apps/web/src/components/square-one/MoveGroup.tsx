import React from "react";

export const MoveGroup: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex items-center gap-1">
    <span className="font-mono text-[11px] text-foreground/35 mr-0.5">{label}</span>
    {children}
  </div>
);
