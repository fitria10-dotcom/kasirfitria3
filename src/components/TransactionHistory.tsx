import React, { useState } from 'react';
import { Transaction, StoreSettings } from '../types';
import { formatRupiah } from '../utils/storage';
import {
  History,
  Search,
  Printer,
  ChevronRight,
  Sparkles,
  Calendar,
  CreditCard,
  Banknote,
  QrCode
} from 'lucide-react';

interface TransactionHistoryProps {
  transactions: Transaction[];
  settings: StoreSettings;
  onOpenReceipt: (transaction: Transaction) => void;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  settings,
  onOpenReceipt,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const filtered = transactions.filter((t) => {
    const q = searchQuery.toLowerCase();
    return (
      t.orderNumber.toLowerCase().includes(q) ||
      (t.customerName && t.customerName.toLowerCase().includes(q)) ||
      t.items.some((i) => i.productName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-stone-900">Riwayat Transaksi Penjualan</h1>
            <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2.5 py-0.5 rounded-full">
              {transactions.length} Transaksi
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Kasir: {settings.cashierName || 'Fitria Oktafiani'} · Lokasi: {settings.address || 'Jl. Cabesar 02/08 Majenang'}
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari No. Order atau Menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-hidden focus:ring-1 focus:ring-amber-500 bg-stone-50"
          />
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-stone-400 text-xs">
            <History className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>Belum ada riwayat transaksi penjualan.</p>
            <p className="text-[11px] text-stone-400 mt-1">Pesanan yang diselesaikan di Kasir akan tercatat di sini.</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {filtered.map((t) => (
              <div
                key={t.id}
                className="p-4 hover:bg-stone-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-stone-900">{t.orderNumber}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 flex items-center gap-1">
                      {t.paymentMethod === 'Tunai' ? (
                        <Banknote className="w-3 h-3 text-emerald-600" />
                      ) : t.paymentMethod === 'QRIS' ? (
                        <QrCode className="w-3 h-3 text-purple-600" />
                      ) : (
                        <CreditCard className="w-3 h-3 text-blue-600" />
                      )}
                      <span>{t.paymentMethod}</span>
                    </span>
                    {t.customerName && (
                      <span className="text-xs text-stone-500">· Pelanggan: <strong>{t.customerName}</strong></span>
                    )}
                  </div>

                  {/* Summary of items */}
                  <div className="text-xs text-stone-600 flex flex-wrap gap-x-2 gap-y-1">
                    {t.items.map((item, idx) => (
                      <span key={idx} className="bg-stone-50 px-2 py-0.5 rounded border border-stone-200/60">
                        {item.quantity}x {item.productName}
                      </span>
                    ))}
                  </div>

                  <div className="text-[11px] text-stone-400 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(t.date).toLocaleString('id-ID', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                    <span>Kasir: {t.cashierName}</span>
                    {t.stockDeductions && t.stockDeductions.length > 0 && (
                      <span className="text-amber-700 flex items-center gap-0.5">
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        <span>{t.stockDeductions.length} bahan terpotong</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Amount & Actions */}
                <div className="flex items-center justify-between md:justify-end gap-4 shrink-0">
                  <div className="text-right">
                    <div className="text-xs text-stone-400">Total Transaksi</div>
                    <div className="text-base font-bold text-stone-900 tabular-nums">
                      {formatRupiah(t.totalAmount)}
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenReceipt(t)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-amber-50 text-stone-700 hover:text-amber-800 rounded-xl text-xs font-semibold transition-colors border border-stone-200"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak Struk</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
