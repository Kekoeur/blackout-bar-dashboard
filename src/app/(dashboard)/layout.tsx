// apps/bar-dashboard/src/app/(dashboard)/layout.tsx

'use client';

import { useAuthStore } from '@/store/authStore';
import { useBarStore } from '@/store/barStore';
import { LogOut, Store, Settings, BarChart3 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const selectedBar = useBarStore((state) => state.selectedBar);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

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