import React from 'react';
import { StoreSettings } from '../types';
import { UtensilsCrossed, Package, ShoppingBag, History, BarChart3, Settings, AlertTriangle } from 'lucide-react';

interface HeaderProps {
  currentTab: 'pos' | 'menu' | 'inventory' | 'history' | 'reports';
  setCurrentTab: (tab: 'pos' | 'menu' | 'inventory' | 'history' | 'reports') => void;
  settings: StoreSettings;
  onOpenSettings: () => void;
  lowStockCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  settings,
  onOpenSettings,
  lowStockCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-stone-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-8">
          
          {/* Zone 1: Single text element Brand wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              FO
            </div>
            <div>
              <div className="text-base font-bold text-stone-900 tracking-tight leading-tight whitespace-nowrap">
                {settings.storeName || 'Kasir Fitria Oktafiani'}
              </div>
              <div className="text-xs text-stone-500 whitespace-nowrap">
                {settings.address || 'Jl. Cabesar 02/08 Majenang'}
              </div>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setCurrentTab('pos')}
              className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                currentTab === 'pos'
                  ? 'bg-amber-50 text-amber-900 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-amber-600" />
              <span>Kasir (POS)</span>
            </button>

            <button
              onClick={() => setCurrentTab('menu')}
              className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                currentTab === 'menu'
                  ? 'bg-amber-50 text-amber-900 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4 text-amber-600" />
              <span>Kelola Menu & Foto</span>
            </button>

            <button
              onClick={() => setCurrentTab('inventory')}
              className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap relative ${
                currentTab === 'inventory'
                  ? 'bg-amber-50 text-amber-900 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Package className="w-4 h-4 text-amber-600" />
              <span>Stok Bahan Otomatis</span>
              {lowStockCount > 0 && (
                <span className="ml-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                  {lowStockCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentTab('history')}
              className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                currentTab === 'history'
                  ? 'bg-amber-50 text-amber-900 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <History className="w-4 h-4 text-amber-600" />
              <span>Riwayat Penjualan</span>
            </button>

            <button
              onClick={() => setCurrentTab('reports')}
              className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                currentTab === 'reports'
                  ? 'bg-amber-50 text-amber-900 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-amber-600" />
              <span>Laporan & Analitik</span>
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action (Cashier Profile / Settings) */}
          <div className="flex items-center gap-2 shrink-0">
            {lowStockCount > 0 && (
              <button
                onClick={() => setCurrentTab('inventory')}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-800 bg-amber-100/80 rounded-lg hover:bg-amber-200 transition-colors whitespace-nowrap"
                title={`${lowStockCount} bahan perlu restock`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                <span>{lowStockCount} Stok Menipis</span>
              </button>
            )}

            <button
              onClick={onOpenSettings}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors whitespace-nowrap"
            >
              <Settings className="w-4 h-4 text-stone-600" />
              <span className="hidden sm:inline">Kasir:</span>
              <strong className="text-stone-900">{settings.cashierName}</strong>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-1 border-t border-stone-100 text-xs scrollbar-none">
          <button
            onClick={() => setCurrentTab('pos')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 ${
              currentTab === 'pos' ? 'bg-amber-600 text-white font-medium' : 'text-stone-600 bg-stone-100'
            }`}
          >
            Kasir (POS)
          </button>
          <button
            onClick={() => setCurrentTab('menu')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 ${
              currentTab === 'menu' ? 'bg-amber-600 text-white font-medium' : 'text-stone-600 bg-stone-100'
            }`}
          >
            Menu & Foto
          </button>
          <button
            onClick={() => setCurrentTab('inventory')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 flex items-center gap-1 ${
              currentTab === 'inventory' ? 'bg-amber-600 text-white font-medium' : 'text-stone-600 bg-stone-100'
            }`}
          >
            <span>Stok Bahan</span>
            {lowStockCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] bg-red-600 text-white rounded-full">
                {lowStockCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setCurrentTab('history')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 ${
              currentTab === 'history' ? 'bg-amber-600 text-white font-medium' : 'text-stone-600 bg-stone-100'
            }`}
          >
            Riwayat
          </button>
          <button
            onClick={() => setCurrentTab('reports')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 ${
              currentTab === 'reports' ? 'bg-amber-600 text-white font-medium' : 'text-stone-600 bg-stone-100'
            }`}
          >
            Laporan
          </button>
        </div>
      </div>
    </header>
  );
};
