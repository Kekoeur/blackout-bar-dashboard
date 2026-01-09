'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  // 🔐 On récupère ce qui EXISTE vraiment dans le store
  const user = useAuthStore((state) => state.user);
  const isHydrated = useAuthStore((state) => state.hydrated);

  // ✅ Dérivé localement
  const isAuthenticated = !!user;

  useEffect(() => {
    if (!isHydrated) return;

    const publicPaths = ['/login', '/register'];
    const isPublicPath = publicPaths.includes(pathname);

    // Non authentifié → page protégée
    if (!isAuthenticated && !isPublicPath) {
      router.replace('/login');
    }

    // Authentifié → page publique
    if (isAuthenticated && isPublicPath) {
      router.replace('/');
    }
  }, [isAuthenticated, isHydrated, pathname, router]);

  // ⏳ Pendant l’hydratation → rien
  if (!isHydrated) {
    return null; // ou loader
  }

  return <>{children}</>;
}
