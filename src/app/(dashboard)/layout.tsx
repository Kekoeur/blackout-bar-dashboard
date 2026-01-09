'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useBarStore } from '@/store/barStore';
import { LogOut, Store } from 'lucide-react';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const { token, user, logout, hydrated } = useAuthStore();
  const selectedBar = useBarStore((state) => state.selectedBar);

  useEffect(() => {
    if (!hydrated) return;

    console.log('🔐 [DashboardLayout] hydrated:', hydrated);
    console.log('🔐 [DashboardLayout] token:', token ? 'YES' : 'NO');

    if (!token) {
      console.log('❌ [DashboardLayout] No token → redirect login');
      router.replace('/login');
    }
  }, [hydrated, token, router, pathname]);

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        Chargement…
      </div>
    );
  }

  if (!token) return null;

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <nav className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
              <Store className="text-white" size={24} />
            </div>
            <div>
              <div className="text-white font-bold">Bar Dashboard</div>
              {selectedBar && (
                <div className="text-slate-400 text-xs">
                  {selectedBar.name}
                </div>
              )}
            </div>
          </Link>

          <div className="flex items-center gap-6">
            <Link href="/" className="text-slate-300 hover:text-white">
              Mes bars
            </Link>

            {user?.isSuperAdmin && (
              <Link
                href="/admin"
                className="text-red-400 font-semibold"
              >
                🔐 Admin
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-white"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      <main>{children}</main>
    </div>
  );
}
