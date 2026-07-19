'use client';

import { useAuth } from '@/hooks/useAuth';
import { redirect } from 'next/navigation';

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    redirect('/login');
  }

  if (user.role === 'provider') {
    redirect('/dashboard/provider');
  } else if (user.role === 'admin') {
    redirect('/dashboard/admin');
  } else {
    redirect('/dashboard/customer');
  }
}