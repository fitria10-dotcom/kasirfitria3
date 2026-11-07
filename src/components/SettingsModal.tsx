import React, { useState } from 'react';
import { StoreSettings } from '../types';
import { X, Save, RotateCcw, Building2, User, MapPin, Phone, Percent, MessageSquare } from 'lucide-react';

interface SettingsModalProps {
  settings: StoreSettings;
  onSaveSettings: (settings: StoreSettings) => void;
  onResetData: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onSaveSettings,
  onResetData,
  onClose,
}) => {
  const [storeName, setStoreName] = useState(settings.storeName || 'Kasir Fitria Oktafiani');
  const [cashierName, setCashierName] = useState(settings.cashierName || 'Fitria Oktafiani');
  const [address, setAddress] = useState(settings.address || 'Jl. Cabesar 02/08 Majenang');
  const [phone, setPhone] = useState(settings.phone || '0812-3456-7890');
  const [taxRate, setTaxRate] = useState<number>(settings.taxRate || 0);
  const [receiptFooterMessage, setReceiptFooterMessage] = useState(
    settings.receiptFooterMessage ||
      'Terima kasih telah berbelanja di Kasir Fitria Oktafiani! Semoga berkah dan sehat selalu.'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      storeName: storeName.trim(),
      cashierName: cashierName.trim(),
      address: address.trim(),
      phone: phone.trim(),
      taxRate: Number(taxRate) || 0,
      receiptFooterMessage: receiptFooterMessage.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-stone-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-stone-50 border-b border-stone-200">
          <div>
            <h3 className="text-base font-bold text-stone-900">Pengaturan Profil & Kasir</h3>
            <p className="text-xs text-stone-500">Konfigurasi nama kasir, alamat Majenang, dan cetak struk</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-amber-600" />
              <span>NAMA USAHA / TOKO</span>
            </label>
            <input
              type="text"
              required
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-600" />
              <span>NAMA KASIR</span>
            </label>
            <input
              type="text"
              required
              value={cashierName}
              onChange={(e) => setCashierName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
            />
            <span className="text-[10px] text-stone-400">Nama kasir tercetak di struk belanja & sistem.</span>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              <span>ALAMAT TOKO</span>
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
            />
            <span className="text-[10px] text-stone-400">Contoh: Jl. Cabesar 02/08 Majenang</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-600" />
                <span>NO. TELEPON / WA</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-amber-600" />
                <span>PAJAK (%)</span>
              </label>
              <input
                type="number"
                min={0}
                max={50}
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-hidden focus:ring-1 focus:ring-amber-500 tabular-nums"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
              <span>PESAN KAKI STRUK (FOOTER)</span>
            </label>
            <textarea
              rows={2}
              value={receiptFooterMessage}
              onChange={(e) => setReceiptFooterMessage(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Reset Demo Data */}
          <div className="pt-3 border-t border-stone-200">
            <button
              type="button"
              onClick={() => {
                if (confirm('Kembalikan semua data ke pengaturan awal (menu lengkap, bahan, foto)?')) {
                  onResetData();
                  onClose();
                }
              }}
              className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 hover:underline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Semua Data ke Standar Awal</span>
            </button>
          </div>

          {/* Submit */}
          <div className="pt-3 flex justify-end gap-3 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 bg-stone-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Pengaturan</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
