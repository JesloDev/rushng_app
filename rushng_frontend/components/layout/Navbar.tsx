'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Menu, X, User, LogOut, Settings, Briefcase, ClipboardList, Home, Search, Users } from 'lucide-react';
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
import { useState } from 'react';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { setView } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/jobs', label: 'Find Jobs', icon: Search },
    { href: '/providers', label: 'Providers', icon: Users },
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
    <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo - Clickable to home */}
          <button
            onClick={handleLogoClick}
            className="flex items-center gap-2 transition-opacity hover:opacity-80 group"
            aria-label="Go to home"
          >
            <div className="relative h-9 w-9 rounded-lg bg-gradient-to-r from-orange-500 to-amber-600 p-1.5 shadow-md transition-transform group-hover:scale-105">
              {/* Custom Logo Image */}
              <Image
                src="/rushng-logo.png"
                alt="RUSHNG Logo"
                width={24}
                height={24}
                className="h-6 w-6 object-contain brightness-0 invert"
                priority
              />
            </div>
            <span className="text-2xl font-bold">
              <span className="text-orange-500">RUSH</span>
              <span className="text-gray-700">NG</span>
            </span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-orange-500 ${
                    pathname === item.href ? 'text-orange-500' : 'text-gray-600'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}

            {/* Auth Links */}
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link href="/jobs/my">
                  <Button variant="ghost" size="sm" className="gap-1.5 hover:text-orange-500">
                    <ClipboardList className="h-4 w-4" />
                    My Jobs
                  </Button>
                </Link>
                {user?.role === 'provider' && (
                  <Link href="/providers/me">
                    <Button variant="ghost" size="sm" className="gap-1.5 hover:text-orange-500">
                      <Briefcase className="h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-orange-50">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-600 text-white text-sm font-semibold">
                          {user?.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.full_name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/jobs/my" className="cursor-pointer">
                        <ClipboardList className="mr-2 h-4 w-4" />
                        <span>My Jobs</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer text-red-600 focus:text-red-600 hover:bg-red-50"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="hover:text-orange-500">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-gradient-to-r from-orange-500 to-amber-600 text-white hover:from-orange-600 hover:to-amber-700 shadow-md hover:shadow-lg transition-all duration-300">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden rounded-md p-2 hover:bg-gray-100 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-md transition-colors hover:bg-orange-50 hover:text-orange-500 ${
                      pathname === item.href ? 'text-orange-500 bg-orange-50' : 'text-gray-600'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}

              <div className="border-t my-2 pt-2">
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/jobs/my"
                      className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-md hover:bg-orange-50 hover:text-orange-500"
                      onClick={() => setIsOpen(false)}
                    >
                      <ClipboardList className="h-4 w-4" />
                      My Jobs
                    </Link>
                    {user?.role === 'provider' && (
                      <Link
                        href="/providers/me"
                        className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-md hover:bg-orange-50 hover:text-orange-500"
                        onClick={() => setIsOpen(false)}
                      >
                        <Briefcase className="h-4 w-4" />
                        Dashboard
                      </Link>
                    )}
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-md hover:bg-orange-50 hover:text-orange-500"
                      onClick={() => setIsOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                    <button
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-md text-red-600 hover:bg-red-50"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-md hover:bg-orange-50 hover:text-orange-500"
                      onClick={() => setIsOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-gradient-to-r from-orange-500 to-amber-600 px-3 py-2.5 text-sm font-medium text-white hover:from-orange-600 hover:to-amber-700 transition-all duration-300"
                      onClick={() => setIsOpen(false)}
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}