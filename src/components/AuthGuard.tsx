// apps/bar-dashboard/src/components/AuthGuard.tsx

'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    // Pages publiques
    const publicPaths = ['/login', '/register'];
    const isPublicPath = publicPaths.includes(pathname);

    // Rediriger vers login si non authentifié sur page protégée
    if (!isAuthenticated && !isPublicPath) {
      router.replace('/login');
    }

    // Rediriger vers dashboard si authentifié sur page publique
    if (isAuthenticated && isPublicPath) {
      router.replace('/');
    }
  }, [isAuthenticated, pathname, router]);

  return <>{children}</>;
}