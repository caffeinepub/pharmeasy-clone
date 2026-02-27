import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { User, Mail, Phone, MapPin, Edit2, Save, X, LogOut, Package, Loader2 } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import LoginButton from '../components/LoginButton';
import type { UserProfile } from '../backend';

export default function Profile() {
  const navigate = useNavigate();
  const { identity, clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: userProfile, isLoading } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();

  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Omit<UserProfile, 'addresses'>>({
    name: '',
    email: '',
    phone: '',
  });

  const isAuthenticated = !!identity;

  const handleStartEdit = () => {
    if (userProfile) {
      setFormData({
        name: userProfile.name,
        email: userProfile.email,
        phone: userProfile.phone,
      });
    }
    setEditing(true);
  };

  const handleSave = async () => {
    if (!userProfile) return;
    await saveProfile.mutateAsync({
      ...formData,
      addresses: userProfile.addresses,
    });
    setEditing(false);
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/' });
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-pharma-surface rounded-full flex items-center justify-center mx-auto mb-6">
          <User className="w-10 h-10 text-muted-foreground/40" />
        </div>
        <h2 className="text-xl font-display font-bold mb-2">Login to view profile</h2>
        <p className="text-muted-foreground mb-6">Please login to access your profile and orders</p>
        <LoginButton className="w-full" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Skeleton className="h-32 w-full rounded-2xl mb-4" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  const userInitial = userProfile?.name?.charAt(0)?.toUpperCase() || 'U';

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 animate-fade-in">
      <h1 className="text-2xl font-display font-bold mb-6">My Profile</h1>

      {/* Profile Card */}
      <div className="pharma-card p-6 mb-4">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                {userInitial}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold">{userProfile?.name || 'User'}</h2>
              <p className="text-sm text-muted-foreground">{userProfile?.email || 'No email set'}</p>
            </div>
          </div>
          {!editing && (
            <Button variant="outline" size="sm" className="rounded-pill" onClick={handleStartEdit}>
              <Edit2 className="w-3.5 h-3.5 mr-1.5" /> Edit
            </Button>
          )}
        </div>

        {editing ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 rounded-pill"
                onClick={() => setEditing(false)}
              >
                <X className="w-4 h-4 mr-1.5" /> Cancel
              </Button>
              <Button
                className="flex-1 rounded-pill"
                onClick={handleSave}
                disabled={saveProfile.isPending}
              >
                {saveProfile.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                ) : (
                  <><Save className="w-4 h-4 mr-1.5" /> Save</>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-pharma-surface rounded-xl">
              <Mail className="w-4 h-4 text-primary shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{userProfile?.email || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-pharma-surface rounded-xl">
              <Phone className="w-4 h-4 text-primary shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-sm font-medium">{userProfile?.phone || '—'}</p>
              </div>
            </div>
            {userProfile?.addresses && userProfile.addresses.length > 0 && (
              <div className="flex items-start gap-3 p-3 bg-pharma-surface rounded-xl">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Saved Address</p>
                  {userProfile.addresses.map((addr, i) => (
                    <p key={i} className="text-sm font-medium">
                      {addr.street}, {addr.city}, {addr.state} - {addr.zip}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="pharma-card p-4 mb-4">
        <h3 className="font-semibold text-sm mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate({ to: '/orders' })}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent transition-colors text-left"
          >
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">My Orders</p>
              <p className="text-xs text-muted-foreground">Track orders</p>
            </div>
          </button>
          <button
            onClick={() => navigate({ to: '/medicines', search: { q: '', category: '' } })}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent transition-colors text-left"
          >
            <div className="w-10 h-10 bg-pharma-orange/10 rounded-xl flex items-center justify-center">
              <MapPin className="w-5 h-5 text-pharma-orange" />
            </div>
            <div>
              <p className="font-semibold text-sm">Browse</p>
              <p className="text-xs text-muted-foreground">Shop medicines</p>
            </div>
          </button>
        </div>
      </div>

      {/* Logout */}
      <Button
        variant="outline"
        className="w-full rounded-pill text-destructive border-destructive/30 hover:bg-destructive/5"
        onClick={handleLogout}
      >
        <LogOut className="w-4 h-4 mr-2" /> Logout
      </Button>
    </div>
  );
}
