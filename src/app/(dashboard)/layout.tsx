// apps/bar-dashboard/src/app/(dashboard)/layout.tsx

'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useBarStore } from '@/store/barStore';
import { LogOut, Store } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, token } = useAuthStore();
  const selectedBar = useBarStore((state) => state.selectedBar);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Vérifier l'authentification au montage
    const checkAuth = () => {
      const storedToken = localStorage.getItem('bar_dashboard_token');
      
      console.log('🔐 [DashboardLayout] Checking auth...'); // ⭐ DEBUG
      console.log('🔐 [DashboardLayout] Token in localStorage:', storedToken ? 'YES' : 'NO'); // ⭐ DEBUG
      console.log('🔐 [DashboardLayout] Current pathname:', pathname); // ⭐ DEBUG

      if (!storedToken) {
        console.log('❌ [DashboardLayout] No token, redirecting to login'); // ⭐ DEBUG
        router.replace('/login'); // ⭐ Utiliser replace au lieu de push
        return;
      }

      console.log('✅ [DashboardLayout] Token found, user authenticated'); // ⭐ DEBUG
      setIsChecking(false);
    };

    checkAuth();
  }, [router, pathname]);

  const handleLogout = () => {
    console.log('🚪 [DashboardLayout] Logging out'); // ⭐ DEBUG
    logout();
    router.replace('/login');
  };

  // Pendant la vérification, afficher un loader
  if (isChecking) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mb-4"></div>
          <div className="text-white text-xl">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Top Navbar */}
      <nav className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                <Store className="text-white" size={24} />
              </div>
              <div>
                <div className="text-white font-bold text-lg">Bar Dashboard</div>
                {selectedBar && (
                  <div className="text-slate-400 text-xs">{selectedBar.name}</div>
                )}
              </div>
            </Link>

            {/* Navigation */}
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="text-slate-300 hover:text-white transition-colors"
              >
                Mes bars
              </Link>
              
              {selectedBar && (
                <>
                  <Link
                    href={`/bars/${selectedBar.id}`}
                    className="text-slate-300 hover:text-white transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href={`/bars/${selectedBar.id}/orders`}
                    className="text-slate-300 hover:text-white transition-colors"
                  >
                    Commandes
                  </Link>
                  <Link
                    href={`/bars/${selectedBar.id}/photos`}
                    className="text-slate-300 hover:text-white transition-colors"
                  >
                    Photos
                  </Link>
                  <Link
                    href={`/bars/${selectedBar.id}/menu`}
                    className="text-slate-300 hover:text-white transition-colors"
                  >
                    Menu
                  </Link>
                  <Link
                    href={`/bars/${selectedBar.id}/team`}
                    className="text-slate-300 hover:text-white transition-colors"
                  >
                    Équipe
                  </Link>
                  <Link
                    href="/catalog"
                    className="text-slate-300 hover:text-white transition-colors"
                  >
                    Catalogue
                  </Link>
                  <Link
                    href={`/bars/${selectedBar.id}/qrcode`}
                    className="text-slate-300 hover:text-white transition-colors"
                  >
                    QR Code
                  </Link>
                </>
              )}

              {/* Admin link - visible seulement pour les super admins */}
              {user?.isSuperAdmin && (
                <Link
                  href="/admin"
                  className="text-red-400 hover:text-red-300 transition-colors font-semibold"
                >
                  🔐 Admin
                </Link>
              )}
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-white text-sm font-medium">{user?.name}</div>
                <div className="text-slate-400 text-xs">{user?.email}</div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                title="Déconnexion"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main>{children}</main>
    </div>
  );
}