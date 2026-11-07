import React, { useMemo } from 'react';
import { Transaction, StockMovementLog, StoreSettings } from '../types';
import { formatRupiah } from '../utils/storage';
import {
  BarChart3,
  TrendingUp,
  CreditCard,
  ShoppingBag,
  Sparkles,
  Download,
  Calendar,
  Utensils
} from 'lucide-react';

interface ReportsViewProps {
  transactions: Transaction[];
  stockLogs: StockMovementLog[];
  settings: StoreSettings;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  transactions,
  stockLogs,
  settings,
}) => {
  // Aggregate revenue & orders
  const totalRevenue = useMemo(() => {
    return transactions.reduce((acc, t) => acc + t.totalAmount, 0);
  }, [transactions]);

  const averageOrderValue = transactions.length > 0 ? totalRevenue / transactions.length : 0;

  // Best selling products
  const productStats = useMemo(() => {
    const stats: Record<string, { name: string; quantity: number; revenue: number }> = {};
    for (const t of transactions) {
      for (const item of t.items) {
        if (!stats[item.productId]) {
          stats[item.productId] = { name: item.productName, quantity: 0, revenue: 0 };
        }
        stats[item.productId].quantity += item.quantity;
        stats[item.productId].revenue += item.subtotal;
      }
    }
    return Object.values(stats).sort((a, b) => b.quantity - a.quantity);
  }, [transactions]);

  // Ingredient consumption breakdown from automatic deduction logs
  const ingredientConsumption = useMemo(() => {
    const usage: Record<string, { name: string; amount: number; unit: string }> = {};
    for (const log of stockLogs) {
      if (log.type === 'Deduction_Order' && log.quantity < 0) {
        if (!usage[log.ingredientId]) {
          usage[log.ingredientId] = {
            name: log.ingredientName,
            amount: 0,
            unit: log.unit,
          };
        }
        usage[log.ingredientId].amount += Math.abs(log.quantity);
      }
    }
    return Object.values(usage).sort((a, b) => b.amount - a.amount);
  }, [stockLogs]);

  // Payment method breakdown
  const paymentStats = useMemo(() => {
    const counts: Record<string, number> = { Tunai: 0, QRIS: 0, 'Transfer Bank': 0, 'Kartu Debit': 0 };
    for (const t of transactions) {
      counts[t.paymentMethod] = (counts[t.paymentMethod] || 0) + t.totalAmount;
    }
    return counts;
  }, [transactions]);

  const handleExportCSV = () => {
    if (transactions.length === 0) {
      alert('Belum ada transaksi untuk diekspor!');
      return;
    }

    const headers = ['No Order', 'Tanggal', 'Kasir', 'Pelanggan', 'Metode', 'Total (Rp)'];
    const rows = transactions.map((t) => [
      t.orderNumber,
      `"${new Date(t.date).toLocaleString('id-ID')}"`,
      `"${t.cashierName}"`,
      `"${t.customerName || '-'}"`,
      t.paymentMethod,
      t.totalAmount,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Kasir_Fitria_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Page Title & Export */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-stone-900">Laporan & Analitik Penjualan</h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Kasir: {settings.cashierName || 'Fitria Oktafiani'} · Alamat: {settings.address || 'Jl. Cabesar 02/08 Majenang'}
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold transition-colors border border-stone-200"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Ekspor CSV</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Total Pendapatan</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-stone-900 mt-2 tabular-nums">
            {formatRupiah(totalRevenue)}
          </div>
          <span className="text-[11px] text-stone-400">Dari {transactions.length} transaksi selesai</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Jumlah Transaksi</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-stone-900 mt-2 tabular-nums">
            {transactions.length}
          </div>
          <span className="text-[11px] text-stone-400">Pesanan terlayani di kasir</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Rata-rata per Pesanan (AOV)</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-stone-900 mt-2 tabular-nums">
            {formatRupiah(averageOrderValue)}
          </div>
          <span className="text-[11px] text-stone-400">Nilai rata-rata per transaksi</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Selling Products */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <Utensils className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-stone-900">Menu Paling Laris</h3>
            </div>
            <span className="text-xs text-stone-400">Urut berdasarkan porsi</span>
          </div>

          <div className="space-y-3">
            {productStats.length === 0 ? (
              <p className="text-xs text-stone-400 py-6 text-center">Belum ada data penjualan.</p>
            ) : (
              productStats.slice(0, 5).map((p, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-md bg-stone-100 font-bold text-stone-700 flex items-center justify-center text-[11px]">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="font-semibold text-stone-900">{p.name}</div>
                      <div className="text-[11px] text-stone-400">{p.quantity} porsi terjual</div>
                    </div>
                  </div>
                  <div className="font-bold text-stone-900 tabular-nums">
                    {formatRupiah(p.revenue)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Automatic Ingredient Consumption Analytics */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-stone-900">Konsumsi Bahan Baku Otomatis</h3>
            </div>
            <span className="text-xs text-stone-400">Terpotong dari pesanan</span>
          </div>

          <div className="space-y-3">
            {ingredientConsumption.length === 0 ? (
              <p className="text-xs text-stone-400 py-6 text-center">
                Belum ada konsumsi bahan baku dari transaksi.
              </p>
            ) : (
              ingredientConsumption.slice(0, 5).map((ing, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="font-semibold text-stone-900">{ing.name}</span>
                  </div>
                  <div className="font-bold text-amber-800 tabular-nums">
                    {Math.round(ing.amount * 100) / 100} {ing.unit}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Payment methods breakdown */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-3">
          Distribusi Metode Pembayaran
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(paymentStats).map(([method, amount]) => (
            <div key={method} className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-xs text-stone-500 font-medium">{method}</span>
              <div className="text-base font-bold text-stone-900 tabular-nums mt-1">
                {formatRupiah(amount)}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
