'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, hydrated } = useAuthStore();

  useEffect(() => {
    if (!hydrated) return;

    console.log('🔐 [AuthLayout] hydrated:', hydrated);
    console.log('🔐 [AuthLayout] token:', token ? 'YES' : 'NO');

    if (token) {
      console.log('✅ [AuthLayout] Already logged → redirect dashboard');
      router.replace('/');
    }
  }, [hydrated, token, router, pathname]);

  if (!hydrated) return null;

  return <>{children}</>;
}
