import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from '@tanstack/react-router';
import {
  ShoppingCart, Search, Menu, X, Home, Grid3X3, ClipboardList,
  User, Upload, ChevronDown, LogOut, TestTube2,
  Heart, Bell, Phone
} from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useCart } from '../context/CartContext';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const CONTACT_NUMBER = '8886918989';

interface LayoutProps {
  children: React.ReactNode;
  onUploadPrescription?: () => void;
}

export default function Layout({ children, onUploadPrescription }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { totalItems } = useCart();
  const { data: userProfile } = useGetCallerUserProfile();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/' });
  };

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: unknown) {
      const err = error as Error;
      if (err.message === 'User is already authenticated') {
        await clear();
        setTimeout(() => login(), 300);
      }
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate({ to: '/medicines', search: { q: searchQuery, category: '' } });
      setSearchQuery('');
    }
  };

  const userInitial = userProfile?.name?.charAt(0)?.toUpperCase() || 'U';

  const navLinks = [
    { to: '/' as const, label: 'Home' },
    { to: '/medicines' as const, label: 'Medicines', search: { q: '', category: '' } },
    { to: '/lab-tests' as const, label: 'Lab Tests' },
    { to: '/articles' as const, label: 'Health Articles' },
  ];

  const bottomNavItems = [
    { to: '/' as const, icon: Home, label: 'Home' },
    { to: '/medicines' as const, icon: Grid3X3, label: 'Medicines', search: { q: '', category: '' } },
    { to: '/lab-tests' as const, icon: TestTube2, label: 'Lab Tests' },
    { to: '/orders' as const, icon: ClipboardList, label: 'Orders' },
    { to: '/profile' as const, icon: User, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-xs">
        <div className="max-w-7xl mx-auto px-4">
          {/* Top bar */}
          <div className="flex items-center gap-3 h-16">
            {/* Logo */}
            <Link to="/" className="shrink-0 flex items-center gap-2">
              <img
                src="/assets/generated/jd-health-lab-logo.dim_320x80.png"
                alt="JD Health Lab"
                className="h-9 w-auto"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const sibling = target.nextElementSibling as HTMLElement;
                  if (sibling) sibling.style.removeProperty('display');
                }}
              />
              <span className="font-display font-bold text-xl text-primary hidden" aria-hidden="true">
                JD Health Lab
              </span>
            </Link>

            {/* Search Bar - Desktop */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search medicines, health products..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-pill border border-border bg-pharma-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
            </form>

            <div className="flex items-center gap-2 ml-auto">
              {/* Contact Number - Desktop */}
              <a
                href={`tel:${CONTACT_NUMBER}`}
                className="hidden lg:flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                <Phone className="w-4 h-4" />
                {CONTACT_NUMBER}
              </a>

              {/* Upload Prescription */}
              <Button
                variant="outline"
                size="sm"
                className="hidden md:flex items-center gap-1.5 rounded-pill border-primary text-primary hover:bg-primary/5"
                onClick={onUploadPrescription}
              >
                <Upload className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">Upload Rx</span>
              </Button>

              {/* Cart */}
              <Link to="/cart" className="relative p-2 rounded-full hover:bg-accent transition-colors">
                <ShoppingCart className="w-5 h-5 text-foreground" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary text-primary-foreground rounded-full">
                    {totalItems > 99 ? '99+' : totalItems}
                  </Badge>
                )}
              </Link>

              {/* Auth */}
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1.5 rounded-full hover:bg-accent p-1 transition-colors">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                          {userInitial}
                        </AvatarFallback>
                      </Avatar>
                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden md:block" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {userProfile && (
                      <div className="px-3 py-2 border-b border-border">
                        <p className="font-semibold text-sm truncate">{userProfile.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{userProfile.email}</p>
                      </div>
                    )}
                    <DropdownMenuItem onClick={() => navigate({ to: '/profile' })}>
                      <User className="w-4 h-4 mr-2" /> Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate({ to: '/orders' })}>
                      <ClipboardList className="w-4 h-4 mr-2" /> My Orders
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                      <LogOut className="w-4 h-4 mr-2" /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  size="sm"
                  className="rounded-pill font-semibold"
                >
                  {isLoggingIn ? 'Logging in...' : 'Login'}
                </Button>
              )}

              {/* Mobile menu toggle */}
              <button
                className="md:hidden p-2 rounded-full hover:bg-accent transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden pb-3">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search medicines..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-pill border border-border bg-pharma-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
            </form>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 pb-2">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                search={'search' in link ? link.search : undefined}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card px-4 py-3 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                search={'search' in link ? link.search : undefined}
                className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-accent transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <a
              href={`tel:${CONTACT_NUMBER}`}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-primary hover:bg-primary/5"
            >
              <Phone className="w-4 h-4" /> {CONTACT_NUMBER}
            </a>
            <button
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-primary hover:bg-primary/5 w-full"
              onClick={() => { onUploadPrescription?.(); setMobileMenuOpen(false); }}
            >
              <Upload className="w-4 h-4" /> Upload Prescription
            </button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-0">
        {children}
      </main>

      {/* Footer - Desktop */}
      <footer className="hidden md:block bg-card border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <img
                  src="/assets/generated/jd-health-lab-logo.dim_320x80.png"
                  alt="JD Health Lab"
                  className="h-8 w-auto"
                  onError={(e) => {
                    const t = e.target as HTMLImageElement;
                    t.style.display = 'none';
                  }}
                />
              </div>
              <p className="font-display font-bold text-lg text-primary mb-2">JD Health Lab</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your trusted health lab. Quality diagnostics delivered to your doorstep.
              </p>
              <a
                href={`tel:${CONTACT_NUMBER}`}
                className="flex items-center gap-1.5 mt-3 text-sm font-semibold text-primary hover:underline"
              >
                <Phone className="w-4 h-4" /> {CONTACT_NUMBER}
              </a>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/medicines" search={{ q: '', category: '' }} className="hover:text-primary transition-colors">Medicines</Link></li>
                <li><Link to="/lab-tests" className="hover:text-primary transition-colors">Lab Tests</Link></li>
                <li><Link to="/articles" className="hover:text-primary transition-colors">Health Articles</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Account</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/profile" className="hover:text-primary transition-colors">My Profile</Link></li>
                <li><Link to="/orders" className="hover:text-primary transition-colors">My Orders</Link></li>
                <li><Link to="/cart" className="hover:text-primary transition-colors">Cart</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-1.5"><Heart className="w-3.5 h-3.5 text-primary" /> 24/7 Support</li>
                <li className="flex items-center gap-1.5"><Bell className="w-3.5 h-3.5 text-primary" /> Notifications</li>
                <li>
                  <a href={`tel:${CONTACT_NUMBER}`} className="flex items-center gap-1.5 hover:text-primary transition-colors">
                    <Phone className="w-3.5 h-3.5 text-primary" /> {CONTACT_NUMBER}
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} JD Health Lab. All rights reserved.</p>
            <p>
              Built with <Heart className="inline w-3 h-3 text-primary fill-primary" /> using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'jd-health-lab')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* Bottom Navigation - Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
        <div className="flex items-center justify-around py-2">
          {bottomNavItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                search={'search' in item ? item.search : undefined}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                <span className={`text-[10px] font-medium ${isActive ? 'text-primary' : ''}`}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
