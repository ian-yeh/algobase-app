"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User, Settings, Mail, Info } from 'lucide-react';

export const Sidebar = () => {
  const pathname = usePathname();
  
  const navItems = [
    { href: "/home", icon: Home, label: "Dashboard" },
    { href: "/profile", icon: User, label: "Profile" },
    { href: "/settings", icon: Settings, label: "Settings" },
    { href: "/contact", icon: Mail, label: "Contact" },
    { href: "/about", icon: Info, label: "About" },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <div className="font-sans flex flex-col bg-background border-r border-border h-full w-full rounded-lg">
      <div className="flex-1 p-4 h-full">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
          GENERAL
        </div>
        <div className="space-y-1">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-colors ${
                isActive(href)
                  ? "text-primary-foreground bg-primary"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
