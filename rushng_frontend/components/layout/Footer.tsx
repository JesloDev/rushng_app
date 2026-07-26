'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/app-store';
import {
  Package,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Loader2,
  Truck,
  Wrench,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function Footer() {
  const router = useRouter();
  const { setView } = useAppStore();
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const handleLogoClick = () => {
    setView('home');
    router.push('/');
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubscribing(true);
    try {
      // Simulate API response for newsletter subscription
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.success('Subscribed to RushNG updates! 🎉');
      setEmail('');
    } catch {
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setIsSubscribing(false);
    }
  };

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com/rushng', label: 'Facebook' },
    { icon: Twitter, href: 'https://twitter.com/rushng', label: 'Twitter' },
    { icon: Instagram, href: 'https://instagram.com/rushng', label: 'Instagram' },
    { icon: Linkedin, href: 'https://linkedin.com/company/rushng', label: 'LinkedIn' },
    { icon: Youtube, href: 'https://youtube.com/rushng', label: 'YouTube' },
  ];

  return (
    <footer className="bg-slate-950 text-slate-100 mt-20 border-t border-slate-800/80">
      <div className="container mx-auto px-4">
        {/* Main Footer Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-12">
          {/* Column 1: Brand & Bio */}
          <div className="space-y-4">
            <button
              onClick={handleLogoClick}
              className="flex items-center gap-2.5 transition-opacity hover:opacity-90 group text-left"
              aria-label="Go to home page"
            >
              <div className="relative rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 p-2 shadow-md transition-transform group-hover:scale-105 shrink-0">
                {!logoError ? (
                  <Image
                    src="/rushng-logo.png"
                    alt="RUSHNG"
                    width={24}
                    height={24}
                    className="h-6 w-6 object-contain brightness-0 invert"
                    onError={() => setLogoError(true)}
                    priority
                  />
                ) : (
                  <Package className="h-6 w-6 text-white" />
                )}
              </div>
              <span className="text-xl font-black tracking-tight">
                <span className="text-orange-500">RUSH</span>
                <span className="text-slate-300">NG</span>
              </span>
            </button>

            <p className="text-slate-400 text-xs md:text-sm max-w-xs leading-relaxed">
              Nigeria's premier logistics and artisan marketplace. Connecting you with verified dispatch riders and skilled handymen on demand.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-orange-500 hover:border-orange-500/40 transition-all duration-200"
                    aria-label={social.label}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Column 2: Popular Services */}
          <div>
            <h3 className="font-bold mb-4 text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5 text-orange-500" />
              Services & Logistics
            </h3>
            <ul className="space-y-2.5 text-xs md:text-sm">
              {[
                { label: 'Dispatch & Express Delivery', href: '/jobs?category=dispatch_delivery' },
                { label: 'Plumbing Services', href: '/jobs?category=plumbing' },
                { label: 'Electrical & Solar', href: '/jobs?category=electrical' },
                { label: 'Carpentry & Furniture', href: '/jobs?category=carpentry' },
                { label: 'Cleaning & Laundry', href: '/jobs?category=cleaning' },
                { label: 'Errands & Shopping', href: '/jobs?category=errands' },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-slate-400 hover:text-orange-500 transition-colors duration-200 hover:pl-1 inline-block"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Company Navigation */}
          <div>
            <h3 className="font-bold mb-4 text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Wrench className="h-3.5 w-3.5 text-orange-500" />
              Company
            </h3>
            <ul className="space-y-2.5 text-xs md:text-sm">
              {[
                { label: 'About RushNG', href: '/about' },
                { label: 'How It Works', href: '/how-it-works' },
                { label: 'Contact Support', href: '/contact' },
                { label: 'Blog & News', href: '/blog' },
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms of Service', href: '/terms' },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-slate-400 hover:text-orange-500 transition-colors duration-200 hover:pl-1 inline-block"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact & Newsletter */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-orange-500" />
              Get in Touch
            </h3>

            <div className="space-y-2.5 text-xs md:text-sm text-slate-400">
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-orange-500 shrink-0" />
                <span>+234 123 456 7890</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-orange-500 shrink-0" />
                <span>hello@rushng.com</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 text-orange-500 shrink-0" />
                <span>Lagos, Nigeria</span>
              </div>
            </div>

            {/* Newsletter Subscription Form */}
            <div className="pt-2">
              <p className="text-xs text-slate-300 font-medium mb-2">Subscribe to operational updates</p>
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="flex-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all"
                  disabled={isSubscribing}
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubscribing}
                  className="gradient-rush text-white font-semibold text-xs h-9 shadow-sm shrink-0"
                >
                  {isSubscribing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Subscribe'}
                </Button>
              </form>
              <p className="text-[10px] text-slate-500 mt-1.5">No spam. Unsubscribe anytime.</p>
            </div>
          </div>
        </div>

        {/* Footer Sub-Bar */}
        <div className="border-t border-slate-800/80 py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <p>&copy; {new Date().getFullYear()} RUSHNG. All rights reserved.</p>

          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-orange-500 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-orange-500 transition-colors">
              Terms
            </Link>
            <Link href="/cookies" className="hover:text-orange-500 transition-colors">
              Cookies
            </Link>
          </div>

          <p className="flex items-center gap-1.5">
            Made with <span className="text-red-500 text-sm leading-none animate-pulse">❤️</span> in Nigeria
          </p>
        </div>
      </div>
    </footer>
  );
}