"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Search, Mail, Bell, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Logo from "@/components/logo";

interface HeaderProps {
  userAvatar?: string;
  userName?: string;
  userEmail?: string;
}

export default function Header({ userAvatar, userName, userEmail }: HeaderProps) {
  const { setTheme } = useTheme();

  const getUserInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header className='font-sans bg-background border-b border-border px-6 py-4'>
      <div className='flex items-center justify-between'>
        {/* Left side - Logo */}
        <Link href="/home" className='flex items-center gap-2'>
          <Logo />
          <span className='text-xl font-semibold text-foreground'>Algobase</span>
        </Link>

        {/* Center - Search */}
        <div className='flex-1 max-w-md mx-8'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input
              type='text'
              placeholder='Search algorithms, users, competitions...'
              className='w-full pl-10 pr-16 bg-muted/50 border-input focus:ring-2 focus:ring-ring'
            />
            <span className='absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground font-mono'>⌘F</span>
          </div>
        </div>

        {/* Right side - Icons and Profile */}
        <div className='flex items-center gap-2'>
          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 w-9 px-0">
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mail */}
          <Button variant="ghost" size="sm" className="h-9 w-9 px-0">
            <Mail className='h-4 w-4' />
            <span className="sr-only">Messages</span>
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="h-9 w-9 px-0">
            <Bell className='h-4 w-4' />
            <span className="sr-only">Notifications</span>
          </Button>

          {/* Profile */}
          <Link href={'/profile'}>
            <Button variant="ghost" className="h-auto p-2 justify-start">
              <div className='flex items-center gap-3'>
                {userAvatar ? (
                  <Image
                    src={userAvatar}
                    alt={userName || 'Profile'}
                    width={32}
                    height={32}
                    className='rounded-full object-cover'
                  />
                ) : (
                  <div className='w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-medium text-sm'>
                    {getUserInitials(userName || 'User')}
                  </div>
                )}
                <div className='hidden md:block text-left'>
                  <p className='text-sm font-medium text-foreground'>{userName || 'User'}</p>
                  <p className='text-xs text-muted-foreground'>{userEmail || 'user@email.com'}</p>
                </div>
              </div>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
