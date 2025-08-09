import Link from 'next/link';
import Image from 'next/image';
import { Search, Mail, Bell } from 'lucide-react';
import Logo from "@/components/Logo";

interface HeaderProps {
  userAvatar?: string;
  userName?: string;
  userEmail?: string;
}

export default function Header({ userAvatar, userName, userEmail }: HeaderProps) {
  const getUserInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header className='font-sans bg-white border-b border-gray-200 px-6 py-4'>
      <div className='flex items-center justify-between'>
        {/* Left side - Logo */}
        <Link href="/home" className='flex items-center gap-2'>
          <Logo />
          <span className='text-xl font-semibold text-gray-900'>Algobase</span>
        </Link>

        {/* Center - Search */}
        <div className='flex-1 max-w-md mx-8'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
            <input
              type='text'
              placeholder='Search algorithms, users, competitions...'
              className='w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent'
            />
            <span className='absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 font-mono'>⌘F</span>
          </div>
        </div>

        {/* Right side - Icons and Profile */}
        <div className='flex items-center gap-4'>
          {/* Mail */}
          <button className='p-2 hover:bg-gray-100 rounded-lg transition-colors'>
            <Mail className='h-5 w-5 text-gray-600' />
          </button>

          {/* Notifications */}
          <button className='p-2 hover:bg-gray-100 rounded-lg transition-colors'>
            <Bell className='h-5 w-5 text-gray-600' />
          </button>

          {/* Profile */}
          <Link href={'/profile'}>
            <div className='flex items-center gap-3 hover:bg-gray-100'>
              {userAvatar ? (
                <Image
                  src={userAvatar}
                  alt={userName || 'Profile'}
                  width={32}
                  height={32}
                  className='rounded-full object-cover'
                />
              ) : (
                <div className='w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white font-medium text-sm'>
                  {getUserInitials(userName || 'User')}
                </div>
              )}
              <div className='hidden md:block'>
                <p className='text-sm font-medium text-gray-900'>{userName || 'User'}</p>
                <p className='text-xs text-gray-500'>{userEmail || 'user@email.com'}</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
