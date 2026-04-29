'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WalletConnect } from '@/components/wallet/WalletConnect';
import { Shield, LayoutDashboard, PlusCircle, BarChart3, Activity, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/create', label: 'Create', icon: PlusCircle },
  { href: '/metrics', label: 'Metrics', icon: BarChart3 },
  { href: '/monitoring', label: 'Monitor', icon: Activity },
  { href: '/feedback', label: 'Feedback', icon: MessageSquare },
];

interface NavbarProps {
  variant?: 'default' | 'transparent';
}

export function Navbar({ variant = 'default' }: NavbarProps) {
  const pathname = usePathname();

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-colors',
        variant === 'transparent'
          ? 'bg-transparent'
          : 'bg-white/80 backdrop-blur-lg border-b border-slate-200/60'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <nav className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 rounded-lg blur-md group-hover:bg-blue-500/30 transition-colors" />
              <Shield className="relative h-7 w-7 text-blue-600" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              Commit<span className="text-blue-600">Lock</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </Link>
              );
            })}
          </div>

          <WalletConnect />
        </nav>
      </div>
    </header>
  );
}
