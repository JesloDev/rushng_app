'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Settings,
  LogOut,
  Home,
  ClipboardList,
  DollarSign,
  User,
  ChevronDown,
  Package,
  PlusCircle,
  Truck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface SidebarProps {
  className?: string;
  onClose?: () => void;
}

export function Sidebar({ className, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [logoError, setLogoError] = useState(false);

  const isProvider = user?.role === 'provider';

  const navItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: isProvider ? 'Assigned Jobs' : 'My Requests',
      href: '/jobs/my',
      icon: ClipboardList,
    },
    {
      title: isProvider ? 'Find Delivery & Jobs' : 'Request Dispatch',
      href: isProvider ? '/jobs' : '/jobs/new',
      icon: isProvider ? Briefcase : PlusCircle,
    },
    {
      title: 'Artisans & Riders',
      href: '/providers',
      icon: Users,
    },
    ...(isProvider
      ? [
          {
            title: 'Provider Portal',
            href: '/providers/me',
            icon: Truck,
          },
        ]
      : []),
    {
      title: 'Payments & Wallet',
      href: '/payments',
      icon: DollarSign,
    },
    {
      title: 'Profile Settings',
      href: '/profile',
      icon: User,
    },
    {
      title: 'Preferences',
      href: '/settings',
      icon: Settings,
    },
  ];

  const handleLogout = async () => {
    await logout();
    onClose?.();
  };

  return (
    <div className={cn('flex h-full flex-col bg-white border-r border-slate-200/80', className)}>
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-slate-100 px-6">
        <Link
          href="/"
          onClick={onClose}
          className="flex items-center gap-2.5 transition-opacity hover:opacity-85 group"
          aria-label="Go to home"
        >
          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 p-1.5 shadow-sm transition-transform group-hover:scale-105">
            {!logoError ? (
              <Image
                src="/rushng-logo.png"
                alt="RUSHNG"
                width={20}
                height={20}
                className="h-5 w-5 object-contain brightness-0 invert"
                onError={() => setLogoError(true)}
                priority
              />
            ) : (
              <Package className="h-4 w-4 text-white" />
            )}
          </div>
          <span className="text-xl font-black tracking-tight">
            <span className="text-orange-500">RUSH</span>
            <span className="text-slate-800">NG</span>
          </span>
        </Link>
      </div>

      {/* Primary Navigation */}
      <nav className="flex-1 space-y-1.5 px-3 py-4 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          // Exact match or sub-route check (avoiding false positives like /jobs matching /jobs/my)
          const isActive =
            pathname === item.href ||
            (item.href !== '/' &&
              item.href !== '/jobs' &&
              pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-orange-50 text-orange-600 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-orange-600' : 'text-slate-400')} />
              <span className="truncate">{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Section Footer */}
      <div className="border-t border-slate-100 p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between gap-2 px-2.5 py-2 hover:bg-slate-50 h-auto"
            >
              <div className="flex items-center gap-3 overflow-hidden text-left">
                <Avatar className="h-8 w-8 border border-orange-200 shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-600 text-white text-xs font-bold">
                    {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="overflow-hidden">
                  <p className="text-xs font-semibold text-slate-800 truncate">{user?.full_name || 'Account'}</p>
                  <p className="text-[10px] text-slate-500 capitalize truncate">{user?.role || 'User'}</p>
                </div>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-1.5 shadow-lg border-slate-200">
            <DropdownMenuLabel className="p-2">
              <div className="flex flex-col space-y-0.5">
                <p className="text-sm font-semibold text-slate-900 truncate">{user?.full_name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href="/"
                onClick={onClose}
                className="cursor-pointer flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
              >
                <Home className="h-4 w-4 text-slate-500" />
                <span>Home Page</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/settings"
                onClick={onClose}
                className="cursor-pointer flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
              >
                <Settings className="h-4 w-4 text-slate-500" />
                <span>Account Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-red-600 focus:bg-red-50 focus:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              <span>Log Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}