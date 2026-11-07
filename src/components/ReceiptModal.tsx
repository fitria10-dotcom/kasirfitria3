import React, { useState } from 'react';
import { Transaction, StoreSettings } from '../types';
import { formatRupiah } from '../utils/storage';
import { Printer, CheckCircle, ChevronDown, ChevronUp, X, Sparkles } from 'lucide-react';

interface ReceiptModalProps {
  transaction: Transaction;
  settings: StoreSettings;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ transaction, settings, onClose }) => {
  const [showStockAudit, setShowStockAudit] = useState(true);

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(transaction.date).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-stone-50 border-b border-stone-200 no-print">
          <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span>Transaksi Berhasil Disimpan</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Paper */}
        <div id="printable-receipt" className="p-6 bg-white font-mono text-xs text-stone-800">
          
          {/* Store Lockup */}
          <div className="text-center pb-4 border-b border-dashed border-stone-300">
            <h2 className="text-base font-bold text-stone-950 uppercase tracking-wide">
              {settings.storeName || 'KASIR FITRIA OKTAFIANI'}
            </h2>
            <p className="text-stone-600 mt-0.5">{settings.address || 'Jl. Cabesar 02/08 Majenang'}</p>
            {settings.phone && <p className="text-stone-500">Telp: {settings.phone}</p>}
          </div>

          {/* Transaction Metadata */}
          <div className="py-3 border-b border-dashed border-stone-300 space-y-1">
            <div className="flex justify-between">
              <span className="text-stone-500">No. Order:</span>
              <span className="font-semibold text-stone-900">{transaction.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Tanggal:</span>
              <span>{formattedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Kasir:</span>
              <span className="font-semibold text-stone-900">{transaction.cashierName || 'Fitria Oktafiani'}</span>
            </div>
            {transaction.customerName && (
              <div className="flex justify-between">
                <span className="text-stone-500">Pelanggan:</span>
                <span>{transaction.customerName}</span>
              </div>
            )}
          </div>

          {/* Items Purchased */}
          <div className="py-3 border-b border-dashed border-stone-300 space-y-2">
            {transaction.items.map((item, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between font-medium text-stone-900">
                  <span>{item.productName}</span>
                  <span className="tabular-nums">{formatRupiah(item.subtotal)}</span>
                </div>
                <div className="flex justify-between text-stone-500 text-[11px]">
                  <span>
                    {item.quantity} x {formatRupiah(item.price)}
                  </span>
                  {item.notes && <span className="italic text-stone-400">({item.notes})</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Payment & Totals */}
          <div className="py-3 border-b border-dashed border-stone-300 space-y-1.5">
            <div className="flex justify-between font-bold text-sm text-stone-950 pt-1">
              <span>TOTAL</span>
              <span className="tabular-nums text-base">{formatRupiah(transaction.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Metode Pembayaran:</span>
              <span className="font-medium text-stone-900">{transaction.paymentMethod}</span>
            </div>
            {transaction.paymentMethod === 'Tunai' && transaction.cashGiven !== undefined && (
              <>
                <div className="flex justify-between text-stone-600">
                  <span>Uang Diterima:</span>
                  <span className="tabular-nums">{formatRupiah(transaction.cashGiven)}</span>
                </div>
                <div className="flex justify-between font-semibold text-stone-900">
                  <span>Kembalian:</span>
                  <span className="tabular-nums text-emerald-700">{formatRupiah(transaction.change || 0)}</span>
                </div>
              </>
            )}
          </div>

          {/* Automatic Inventory Deduction Proof / Transparency */}
          {transaction.stockDeductions && transaction.stockDeductions.length > 0 && (
            <div className="py-3 border-b border-dashed border-stone-300">
              <div
                onClick={() => setShowStockAudit(!showStockAudit)}
                className="flex items-center justify-between cursor-pointer py-1 text-stone-600 hover:text-stone-900 no-print"
              >
                <div className="flex items-center gap-1.5 font-sans font-semibold text-xs text-amber-800">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Stok Bahan Otomatis Terpotong ({transaction.stockDeductions.length} bahan)</span>
                </div>
                {showStockAudit ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </div>

              {showStockAudit && (
                <div className="mt-2 p-2.5 bg-stone-50 rounded-lg space-y-1 border border-stone-200">
                  <div className="text-[10px] font-sans text-stone-500 font-medium mb-1">
                    Sistem otomatis mengurangi bahan dari gudang:
                  </div>
                  {transaction.stockDeductions.map((ded, i) => (
                    <div key={i} className="flex justify-between text-[11px] text-stone-700">
                      <span>• {ded.ingredientName}</span>
                      <span className="tabular-nums font-medium text-amber-800">
                        -{ded.deductedAmount} {ded.unit} (Sisa: {ded.remainingStock} {ded.unit})
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Footer Note */}
          <div className="text-center pt-4 text-stone-500 text-[11px] space-y-1">
            <p className="font-sans font-medium text-stone-700">
              {settings.receiptFooterMessage || 'Terima kasih atas kunjungan Anda!'}
            </p>
            <p className="text-[10px]">Struk resmi Kasir Fitria Oktafiani</p>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex items-center justify-end gap-3 no-print">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-100 transition-colors"
          >
            Tutup
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Struk</span>
          </button>
        </div>

      </div>
    </div>
  );
};
