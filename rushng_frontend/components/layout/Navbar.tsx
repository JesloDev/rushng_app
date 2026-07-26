'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu,
  X,
  User,
  LogOut,
  Settings,
  Briefcase,
  ClipboardList,
  Home,
  Search,
  Users,
  Package,
  PlusCircle,
  Truck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store/app-store';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { setView } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/jobs', label: 'Find Jobs & Dispatch', icon: Search },
    { href: '/providers', label: 'Artisans & Riders', icon: Users },
  ];

  const handleLogoClick = () => {
    setView('home');
    router.push('/');
    setIsOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
    setIsOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-md shadow-xs">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Brand Logo */}
          <button
            onClick={handleLogoClick}
            className="flex items-center gap-2.5 transition-opacity hover:opacity-85 group"
            aria-label="Go to home page"
          >
            <div className="relative h-9 w-9 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 p-1.5 shadow-sm transition-transform group-hover:scale-105 shrink-0 flex items-center justify-center">
              {!logoError ? (
                <Image
                  src="/rushng-logo.png"
                  alt="RUSHNG Logo"
                  width={24}
                  height={24}
                  className="h-6 w-6 object-contain brightness-0 invert"
                  onError={() => setLogoError(true)}
                  priority
                />
              ) : (
                <Package className="h-5 w-5 text-white" />
              )}
            </div>
            <span className="text-2xl font-black tracking-tight">
              <span className="text-orange-500">RUSH</span>
              <span className="text-slate-800">NG</span>
            </span>
          </button>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-orange-500 ${
                    isActive ? 'text-orange-600 font-semibold' : 'text-slate-600'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}

            {/* Post Job / Dispatch Action Button */}
            <Link href="/jobs/new">
              <Button
                variant="outline"
                size="sm"
                className="hidden lg:flex gap-1.5 border-orange-200 text-orange-600 hover:bg-orange-50 hover:text-orange-700 font-medium"
              >
                <PlusCircle className="h-4 w-4" />
                Post Request
              </Button>
            </Link>

            {/* Desktop Auth Section */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link href="/jobs/my">
                  <Button variant="ghost" size="sm" className="gap-1.5 text-slate-700 hover:text-orange-600 hover:bg-orange-50/50">
                    <ClipboardList className="h-4 w-4 text-orange-500" />
                    My Deliveries & Jobs
                  </Button>
                </Link>

                {user?.role === 'provider' && (
                  <Link href="/providers/me">
                    <Button variant="ghost" size="sm" className="gap-1.5 text-slate-700 hover:text-orange-600 hover:bg-orange-50/50">
                      <Truck className="h-4 w-4 text-orange-500" />
                      Rider & Artisan Portal
                    </Button>
                  </Link>
                )}

                {/* Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 hover:ring-2 hover:ring-orange-400 focus-visible:ring-2 focus-visible:ring-orange-500 transition-all">
                      <Avatar className="h-9 w-9 border border-orange-200">
                        <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-600 text-white text-xs font-bold">
                          {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 p-1.5 shadow-lg border-slate-200">
                    <DropdownMenuLabel className="p-2">
                      <div className="flex flex-col space-y-0.5">
                        <p className="text-sm font-semibold text-slate-900 truncate">{user?.full_name}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded w-fit">
                          {user?.role || 'User'}
                        </span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-100">
                        <User className="h-4 w-4 text-slate-500" />
                        <span>Profile Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/jobs/my" className="cursor-pointer flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-100">
                        <ClipboardList className="h-4 w-4 text-slate-500" />
                        <span>My Requests</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="cursor-pointer flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-100">
                        <Settings className="h-4 w-4 text-slate-500" />
                        <span>Account Preferences</span>
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
            ) : (
              <div className="flex items-center gap-2.5">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-slate-700 hover:text-orange-600 hover:bg-orange-50">
                    Log In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-gradient-to-r from-orange-500 to-amber-600 text-white font-medium hover:from-orange-600 hover:to-amber-700 shadow-sm transition-all duration-200">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden rounded-lg p-2 text-slate-700 hover:bg-slate-100 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-slate-100 space-y-3">
            <div className="flex flex-col space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                      isActive ? 'text-orange-600 bg-orange-50' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-100">
              {isAuthenticated ? (
                <div className="space-y-1">
                  <div className="px-3 py-2 mb-2 rounded-lg bg-slate-50 flex items-center gap-3">
                    <Avatar className="h-8 w-8 border border-orange-200">
                      <AvatarFallback className="bg-orange-500 text-white text-xs font-bold">
                        {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="overflow-hidden">
                      <p className="text-xs font-semibold text-slate-800 truncate">{user?.full_name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                    </div>
                  </div>

                  <Link
                    href="/jobs/new"
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-orange-600 hover:bg-orange-50"
                    onClick={() => setIsOpen(false)}
                  >
                    <PlusCircle className="h-4 w-4" />
                    Post New Request
                  </Link>

                  <Link
                    href="/jobs/my"
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-50"
                    onClick={() => setIsOpen(false)}
                  >
                    <ClipboardList className="h-4 w-4" />
                    My Jobs & Dispatch
                  </Link>

                  {user?.role === 'provider' && (
                    <Link
                      href="/providers/me"
                      className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-50"
                      onClick={() => setIsOpen(false)}
                    >
                      <Briefcase className="h-4 w-4" />
                      Rider / Artisan Dashboard
                    </Link>
                  )}

                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-50"
                    onClick={() => setIsOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    Profile Settings
                  </Link>

                  <button
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    Log Out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 pt-1">
                  <Link
                    href="/login"
                    className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100 border border-slate-200"
                    onClick={() => setIsOpen(false)}
                  >
                    Log In
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-xs"
                    onClick={() => setIsOpen(false)}
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}