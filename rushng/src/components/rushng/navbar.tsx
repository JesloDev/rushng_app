'use client';

import { useAppStore } from '@/store/app-store';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, Zap, ArrowLeft, Store, LayoutDashboard, Globe, HelpCircle, CreditCard, MapPin, User, LogOut, Settings } from 'lucide-react';

const navItems = [
  { label: 'Home', view: 'home', icon: <Zap className="w-4 h-4" /> },
  { label: 'Track Order', view: 'track', icon: <MapPin className="w-4 h-4" /> },
  { label: 'How It Works', view: 'how-it-works', icon: <HelpCircle className="w-4 h-4" /> },
  { label: 'Pricing', view: 'pricing', icon: <CreditCard className="w-4 h-4" /> },
];

export function Navbar() {
  const { currentView, setView, goBack, mobileMenuOpen, setMobileMenuOpen } = useAppStore();
  const { user, isAuthenticated, logout } = useAuth();
  const showBack = currentView !== 'home';

  const handleLogout = async () => {
    await logout();
    setView('home');
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo & Back */}
        <div className="flex items-center gap-3">
          {showBack && (
            <Button variant="ghost" size="icon" onClick={goBack} className="shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <button onClick={() => setView('home')} className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <div className="gradient-rush rounded-lg p-1.5">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight">
              <span className="gradient-text">RUSH</span>
              <span className="text-foreground/70">NG</span>
            </span>
          </button>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Button
              key={item.view}
              variant={currentView === item.view ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView(item.view)}
              className={`gap-2 text-sm ${currentView === item.view ? 'gradient-rush border-0 text-white' : ''}`}
            >
              {item.icon}
              {item.label}
            </Button>
          ))}
          
          {isAuthenticated && user?.role === 'merchant' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setView('merchant-dashboard')}
                className="gap-2 text-sm"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setView('merchant-builder')}
                className="gap-2 text-sm"
              >
                <Store className="h-4 w-4" />
                Store
              </Button>
            </>
          )}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setView('booking')}
            className="hidden gradient-rush border-0 text-white sm:flex"
          >
            Book Now
          </Button>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-600 text-white">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                {user?.role === 'merchant' && (
                  <>
                    <DropdownMenuItem onClick={() => setView('merchant-dashboard')}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setView('merchant-builder')}>
                      <Store className="mr-2 h-4 w-4" />
                      Manage Store
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={() => setView('track')}>
                  <MapPin className="mr-2 h-4 w-4" />
                  Track Orders
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => setView('login')} className="hidden sm:flex">
                Login
              </Button>
              <Button size="sm" onClick={() => setView('signup')} className="hidden gradient-rush border-0 text-white sm:flex">
                Sign Up
              </Button>
            </>
          )}

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="flex flex-col gap-6 pt-8">
                <button onClick={() => { setView('home'); setMobileMenuOpen(false); }} className="flex items-center gap-2">
                  <div className="gradient-rush rounded-lg p-1.5"><Zap className="h-5 w-5 text-white" /></div>
                  <span className="text-xl font-extrabold">
                    <span className="gradient-text">RUSH</span><span className="text-foreground/70">NG</span>
                  </span>
                </button>

                <nav className="flex flex-col gap-1">
                  {navItems.map((item) => (
                    <Button
                      key={item.view}
                      variant={currentView === item.view ? 'default' : 'ghost'}
                      className="justify-start gap-3"
                      onClick={() => { setView(item.view); setMobileMenuOpen(false); }}
                    >
                      {item.icon}{item.label}
                    </Button>
                  ))}
                  
                  {isAuthenticated && user?.role === 'merchant' && (
                    <>
                      <Button
                        variant="ghost"
                        className="justify-start gap-3"
                        onClick={() => { setView('merchant-dashboard'); setMobileMenuOpen(false); }}
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Button>
                      <Button
                        variant="ghost"
                        className="justify-start gap-3"
                        onClick={() => { setView('merchant-builder'); setMobileMenuOpen(false); }}
                      >
                        <Store className="h-4 w-4" />
                        Manage Store
                      </Button>
                    </>
                  )}
                </nav>

                <div className="border-t pt-4">
                  {isAuthenticated ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 px-3 py-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-600 text-white">
                          {user?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{user?.name}</p>
                          <p className="text-xs text-muted-foreground">{user?.email}</p>
                        </div>
                      </div>
                      <Button onClick={handleLogout} variant="outline" className="w-full justify-center text-red-600">
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Button
                        onClick={() => { setView('login'); setMobileMenuOpen(false); }}
                        variant="outline"
                        className="w-full"
                      >
                        Login
                      </Button>
                      <Button
                        onClick={() => { setView('signup'); setMobileMenuOpen(false); }}
                        className="w-full gradient-rush border-0 text-white"
                      >
                        Sign Up
                      </Button>
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => { setView('booking'); setMobileMenuOpen(false); }}
                  className="w-full gradient-rush border-0 text-white"
                >
                  Book Now
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}