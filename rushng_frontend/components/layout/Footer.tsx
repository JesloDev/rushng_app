'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/app-store';
import { Package, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Footer() {
  const router = useRouter();
  const { setView } = useAppStore();

  const handleLogoClick = () => {
    setView('home');
    router.push('/');
  };

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com/rushng', label: 'Facebook' },
    { icon: Twitter, href: 'https://twitter.com/rushng', label: 'Twitter' },
    { icon: Instagram, href: 'https://instagram.com/rushng', label: 'Instagram' },
    { icon: Linkedin, href: 'https://linkedin.com/company/rushng', label: 'LinkedIn' },
    { icon: Youtube, href: 'https://youtube.com/rushng', label: 'YouTube' },
  ];

  return (
    <footer className="bg-gray-900 text-white mt-20">
      <div className="container mx-auto px-4">
        {/* Main Footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-12">
          {/* Brand */}
          <div>
            <button
              onClick={handleLogoClick}
              className="flex items-center gap-2 mb-4 transition-opacity hover:opacity-80"
            >
              <div className="rounded-lg bg-gradient-to-r from-orange-500 to-amber-600 p-1.5">
                <Package className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">
                <span className="text-orange-500">RUSH</span>
                <span className="text-gray-300">NG</span>
              </span>
            </button>
            <p className="text-gray-400 text-sm max-w-xs">
              Nigeria's premier service marketplace connecting you with trusted providers 
              for plumbing, electrical, carpentry, and more.
            </p>
            <div className="flex gap-3 mt-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-orange-500 transition-colors"
                    aria-label={social.label}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold mb-4 text-gray-200">Services</h3>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Plumbing', href: '/jobs?category=plumbing' },
                { label: 'Electrical', href: '/jobs?category=electrical' },
                { label: 'Carpentry', href: '/jobs?category=carpentry' },
                { label: 'Painting', href: '/jobs?category=painting' },
                { label: 'Cleaning', href: '/jobs?category=cleaning' },
                { label: 'Tiling', href: '/jobs?category=tiling' },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-gray-400 hover:text-orange-500 transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4 text-gray-200">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-orange-500 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-orange-500 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-orange-500 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-gray-400 hover:text-orange-500 transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-orange-500 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-orange-500 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h3 className="font-semibold mb-4 text-gray-200">Get in Touch</h3>
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-orange-500" />
                <span>+234 123 456 7890</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-orange-500" />
                <span>hello@rushng.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-orange-500" />
                <span>Lagos, Nigeria</span>
              </div>
            </div>

            {/* Newsletter */}
            <div className="mt-4">
              <p className="text-sm text-gray-400 mb-2">Subscribe to our newsletter</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
                <Button className="bg-gradient-to-r from-orange-500 to-amber-600 text-white hover:from-orange-600 hover:to-amber-700">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} RUSHNG. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-orange-500 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-orange-500 transition-colors">
              Terms
            </Link>
            <Link href="/cookies" className="hover:text-orange-500 transition-colors">
              Cookies
            </Link>
          </div>
          <p className="flex items-center gap-1">
            Made with ❤️ in Nigeria
          </p>
        </div>
      </div>
    </footer>
  );
}