'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WalletConnect } from '@/components/wallet/WalletConnect';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Shield, LayoutDashboard, PlusCircle, BarChart3, Activity, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/create', label: 'Create', icon: PlusCircle },
  { href: '/metrics', label: 'Metrics', icon: BarChart3 },
  { href: '/monitoring', label: 'Monitor', icon: Activity },
  { href: '/feedback', label: 'Feedback', icon: MessageSquare },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 inset-x-0 z-50 flex justify-center px-4 pt-6 pb-4 pointer-events-none transition-all duration-500">
      {/* Background active glow when scrolled */}
      <div 
        className={cn(
          "absolute inset-0 bg-gradient-to-b from-background/80 via-background/40 to-transparent backdrop-blur-md transition-opacity duration-700 pointer-events-none -z-10",
          scrolled ? "opacity-100" : "opacity-0"
        )} 
      />

      <header
        className={cn(
          'pointer-events-auto w-full max-w-5xl rounded-full transition-all duration-500 group relative',
          scrolled
            ? 'glass-panel bg-background/60 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.4)] border border-white/10 dark:border-white/5 py-2 px-4'
            : 'bg-background/20 backdrop-blur-sm border border-transparent py-4 px-2'
        )}
      >
        {/* Subtle animated border gradient on scroll */}
        <div className={cn(
          "absolute inset-0 rounded-full bg-gradient-to-r from-primary/30 via-transparent to-primary/30 opacity-0 transition-opacity duration-1000 -z-10",
          scrolled && "group-hover:opacity-100 animate-pulse"
        )} />

        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center justify-center gap-3 group/logo px-4 transition-transform hover:scale-105 active:scale-95">
            <div className="relative p-2 bg-gradient-to-tr from-primary to-primary/60 rounded-xl shadow-lg shadow-primary/20 overflow-hidden">
              <div className="absolute inset-0 bg-white/20 blur-md rounded-full -translate-x-full group-hover/logo:translate-x-full transition-transform duration-1000" />
              <Shield className="h-5 w-5 text-primary-foreground relative z-10" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-extrabold tracking-tighter text-foreground drop-shadow-sm flex items-center">
              Commit<span className="text-primary opacity-80 font-medium tracking-normal ml-0.5">Lock</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center justify-center gap-1.5 p-1.5 bg-muted/40 rounded-full border border-border/30 shadow-inner backdrop-blur-md">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'relative flex items-center gap-2.5 px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 group/nav overflow-hidden',
                    isActive
                      ? 'text-primary shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {/* Active background pill */}
                  {isActive && (
                    <div className="absolute inset-0 bg-background/80 dark:bg-background border border-border/50 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.1)] -z-10" />
                  )}
                  
                  {/* Hover background pill */}
                  {!isActive && (
                    <div className="absolute inset-0 bg-foreground/5 opacity-0 group-hover/nav:opacity-100 transition-opacity duration-300 rounded-full -z-10" />
                  )}

                  <Icon className={cn(
                    "h-4 w-4 transition-transform duration-300",
                    isActive ? "scale-110" : "group-hover/nav:scale-110"
                  )} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="relative z-10">{label}</span>
                  
                  {/* Active bottom glow */}
                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-primary rounded-t-full shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center justify-center gap-3 pl-4">
            <ThemeToggle />
            <div className="pl-2 border-l border-border/40">
              <WalletConnect />
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
