'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, MessageCircle, Bell, MenuIcon, Home, User, Info, Settings, Mail } from 'lucide-react';

interface HeaderProps {
  userAvatar?: string;
  userName?: string;
}

export default function Header({ userAvatar, userName }: HeaderProps) {
  const [menu, setMenu] = useState(false)

  const getUserInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header className='text-black h-[60px] flex justify-center items-center border-b-2'>
      <div className='w-[1200px] h-full flex items-center justify-between px-4'>
        {/* Left side - Logo and Search */}
        <div className='flex items-center gap-6'>
          <Link href={"/dashboard/home"}>
            <div className='flex items-center'>
              <div className="relative w-8 h-8 mr-3">
                <div className="absolute w-8 h-8 border-2 border-black rotate-45 transform transition-all duration-300 hover:rotate-[135deg]"></div>
                <div className="absolute w-8 h-8 border-2 border-black rotate-[15deg] transform transition-all duration-300 hover:rotate-[105deg]"></div>
              </div>
              <h1 className='text-xl font-semibold'>Algobase</h1>
            </div>
          </Link>

          {/* Search Bar */}
          <div className='relative'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <Search className='h-4 w-4 text-gray-400' />
            </div>
            <input
              type='text'
              placeholder='Search...'
              className='block w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
            />
          </div>
        </div>

        {/* Right side - Icons and Profile Picture */}
        <div className='flex items-center gap-6'>
          {/* Messages */}
          <Link href='/dashboard/messages' className='flex flex-col items-center gap-1 hover:text-blue-600 transition-colors'>
            <MessageCircle className='h-6 w-6' />
            <span className='text-xs font-medium'>Messages</span>
          </Link>

          {/* Notifications */}
          <Link href='/dashboard/notifications' className='flex flex-col items-center gap-1 hover:text-blue-600 transition-colors'>
            <Bell className='h-6 w-6' />
            <span className='text-xs font-medium'>Notifications</span>
          </Link>

          {/* Profile Picture */}
          <Link href='/dashboard/profile' className='flex flex-col items-center gap-1 hover:text-blue-600 transition-colors'>
            {userAvatar ? (
              <Image
                src={userAvatar}
                alt={userName || 'Profile'}
                width={24}
                height={24}
                className='rounded-full object-cover'
              />
            ) : (
              <div className='w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-xs'>
                {getUserInitials(userName || 'User')}
              </div>
            )}
            <span className='text-xs font-medium'>Me</span>
          </Link>

          <div className='flex flex-col items-center gap-1 hover:text-blue-600 transition-colors'>
            <button onClick={() => (setMenu(!menu))}>
              <MenuIcon className='h-6 w-6'/>
            </button>
            <span className='text-xs font-medium'>Training</span>
          </div>
        </div>
      </div>

      {menu && (
        <div>
          {/* Overlay - takes up 85% of screen */}
          <div
            className="fixed inset-0 bg-black bg-opacity-60 z-1000"
            onClick={() => setMenu(false)}
          />

          {/* Menu - takes up 15% of right screen */}
          <div className="fixed top-0 right-0 h-full w-[15%] bg-white z-1000 shadow-xl">
            <div className="p-6 space-y-4">
              <Link
                href="/"
                className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded"
                onClick={() => setMenu(false)}
              >
                <Home size={20} />
                <span>Home</span>
              </Link>

              <Link
                href="/profile"
                className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded"
                onClick={() => setMenu(false)}
              >
                <User size={20} />
                <span>Profile</span>
              </Link>

              <Link
                href="/settings"
                className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded"
                onClick={() => setMenu(false)}
              >
                <Settings size={20} />
                <span>Settings</span>
              </Link>

              <Link
                href="/contact"
                className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded"
                onClick={() => setMenu(false)}
              >
                <Mail size={20} />
                <span>Contact</span>
              </Link>

              <Link
                href="/about"
                className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded"
                onClick={() => setMenu(false)}
              >
                <Info size={20} />
                <span>About</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
