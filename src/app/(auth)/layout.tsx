// apps/bar-dashboard/src/app/(auth)/layout.tsx

'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Si déjà connecté, rediriger vers dashboard
    const token = localStorage.getItem('bar_dashboard_token');
    
    console.log('🔐 [AuthLayout] Checking if already authenticated...'); // ⭐ DEBUG
    console.log('🔐 [AuthLayout] Token found:', token ? 'YES' : 'NO'); // ⭐ DEBUG
    console.log('🔐 [AuthLayout] Current pathname:', pathname); // ⭐ DEBUG
    
    if (token) {
      console.log('✅ [AuthLayout] Already authenticated, redirecting to dashboard'); // ⭐ DEBUG
      router.replace('/'); // ⭐ Utiliser replace au lieu de push
    }
  }, [router, pathname]);

  return <>{children}</>;
}