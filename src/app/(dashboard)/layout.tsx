'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useBarStore } from '@/store/barStore';
import {
  LogOut,
  Store,
  ChevronDown,
  LayoutDashboard,
  ShoppingCart,
  Image,
  BookOpen,
  QrCode,
  Users,
  Package,
} from 'lucide-react';
import Link from 'next/link';
import { Menu } from '@headlessui/react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const { token, user, logout, hydrated } = useAuthStore();
  const selectedBar = useBarStore((state) => state.selectedBar);

  useEffect(() => {
    if (!hydrated) return;

    if (!token) {
      router.replace('/login');
    }
  }, [hydrated, token, router]);

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
      {/* NAVBAR */}
      <nav className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          {/* LOGO */}
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

          {/* NAVIGATION */}
          <div className="flex items-center gap-6">
            <Link href="/" className="text-slate-300 hover:text-white">
              Mes bars
            </Link>

            {selectedBar && (
              <>
                {/* DROPDOWN BAR */}
                <Menu as="div" className="relative">
                  <Menu.Button className="flex items-center gap-1 text-slate-300 hover:text-white">
                    Bar <ChevronDown size={16} />
                  </Menu.Button>
                  <Menu.Items className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-lg shadow-lg overflow-hidden">
                    <DropdownItem
                      href={`/bars/${selectedBar.id}`}
                      icon={LayoutDashboard}
                      label="Dashboard"
                    />
                    <DropdownItem
                      href={`/bars/${selectedBar.id}/orders`}
                      icon={ShoppingCart}
                      label="Commandes"
                    />
                    <DropdownItem
                      href={`/bars/${selectedBar.id}/photos`}
                      icon={Image}
                      label="Photos"
                    />
                    <DropdownItem
                      href={`/bars/${selectedBar.id}/menu`}
                      icon={BookOpen}
                      label="Menu"
                    />
                    <DropdownItem
                      href={`/bars/${selectedBar.id}/qrcode`}
                      icon={QrCode}
                      label="QR Code"
                    />
                  </Menu.Items>
                </Menu>

                {/* DROPDOWN GESTION */}
                <Menu as="div" className="relative">
                  <Menu.Button className="flex items-center gap-1 text-slate-300 hover:text-white">
                    Gestion <ChevronDown size={16} />
                  </Menu.Button>
                  <Menu.Items className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-lg shadow-lg overflow-hidden">
                    <DropdownItem
                      href={`/bars/${selectedBar.id}/team`}
                      icon={Users}
                      label="Équipe"
                    />
                    <DropdownItem
                      href="/catalog"
                      icon={Package}
                      label="Catalogue"
                    />
                  </Menu.Items>
                </Menu>
              </>
            )}

            {user?.isSuperAdmin && (
              <Link
                href="/admin"
                className="text-red-400 font-semibold hover:text-red-300"
              >
                🔐 Admin
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-white"
              title="Déconnexion"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* CONTENT */}
      <main>{children}</main>
    </div>
  );
}

/* ========================= */
/* Dropdown Item Component   */
/* ========================= */
function DropdownItem({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: any;
  label: string;
}) {
  return (
    <Menu.Item>
      {({ active }) => (
        <Link
          href={href}
          className={`flex items-center gap-3 px-4 py-3 text-sm ${
            active
              ? 'bg-slate-700 text-white'
              : 'text-slate-300'
          }`}
        >
          <Icon size={16} />
          {label}
        </Link>
      )}
    </Menu.Item>
  );
}
