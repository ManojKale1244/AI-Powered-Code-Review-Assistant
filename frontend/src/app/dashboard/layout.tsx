'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/auth-store';
import {
  Code2,
  LayoutDashboard,
  FolderOpen,
  History,
  Settings,
  LogOut,
  MessageSquare,
  Menu,
  X,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/projects', label: 'Projects', icon: FolderOpen },
  { href: '/dashboard/reviews', label: 'Reviews', icon: History },
  { href: '/dashboard/chat', label: 'AI Chat', icon: MessageSquare },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

function SidebarBrand() {
  return (
    <div className="sidebar-brand">
      <div className="sidebar-brand-inner">
        <div className="sidebar-brand-icon">
          <Code2 size={20} color="white" strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <p className="sidebar-brand-title gradient-text">AI Code Review</p>
          <p className="sidebar-brand-tagline">Intelligent code analysis</p>
        </div>
      </div>
    </div>
  );
}

function SidebarNav({ pathname }: { pathname: string | null }) {
  return (
    <nav className="sidebar-nav" aria-label="Main navigation">
      <p className="sidebar-section-label">Menu</p>
      <ul className="sidebar-nav-list">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname?.startsWith(item.href));

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`sidebar-nav-link ${isActive ? 'sidebar-nav-link--active' : ''}`}
              >
                <item.icon size={20} strokeWidth={isActive ? 2.25 : 2} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function SidebarFooter({
  user,
  onLogout,
}: {
  user: { name?: string; email?: string } | null;
  onLogout: () => void;
}) {
  return (
    <footer className="sidebar-footer">
      <div className="sidebar-user-card">
        <div className="sidebar-user-avatar">
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="sidebar-user-name truncate">{user?.name}</p>
            <span
              className="badge shrink-0 text-[10px] font-extrabold uppercase tracking-wide"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                color: 'white',
                padding: '3px 8px',
              }}
            >
              PRO
            </span>
          </div>
          <p className="sidebar-user-email truncate">{user?.email}</p>
        </div>
      </div>
      <button type="button" onClick={onLogout} className="sidebar-sign-out">
        <LogOut size={18} />
        Sign Out
      </button>
    </footer>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isLoading, isAuthenticated, checkAuth, logout } =
    useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  if (isLoading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: 'var(--bg-primary)' }}
      >
        <div className="loader" style={{ width: '40px', height: '40px' }} />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div
      className="flex min-h-screen flex-col md:flex-row"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Mobile top bar */}
      <div
        className="sticky top-0 z-40 flex items-center justify-between border-b px-5 py-4 md:hidden"
        style={{
          background: 'var(--bg-secondary)',
          borderColor: 'var(--border-primary)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="sidebar-brand-icon"
            style={{ width: '2.25rem', height: '2.25rem' }}
          >
            <Code2 size={18} color="white" />
          </div>
          <span className="text-base font-bold gradient-text">AI Code Review</span>
        </div>
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="rounded-lg p-2.5 text-gray-300 transition-colors hover:bg-white/10"
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Sidebar drawer (mobile) / column (desktop) */}
      <aside
        className={`dashboard-sidebar fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          <SidebarBrand />
          <SidebarNav pathname={pathname} />
          <SidebarFooter user={user} onLogout={handleLogout} />
        </div>
      </aside>

      {isMobileMenuOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}

      <main className="min-w-0 flex-1 overflow-auto p-6 sm:p-8 md:p-10 lg:p-12">
        {children}
      </main>
    </div>
  );
}
