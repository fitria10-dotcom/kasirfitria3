import React, { useState } from 'react';
import { Ingredient, StockMovementLog, Product } from '../types';
import { formatRupiah } from '../utils/storage';
import {
  Package,
  AlertTriangle,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  Sparkles,
  History,
  CheckCircle,
  X,
  PlusCircle,
  Clock
} from 'lucide-react';

interface InventoryManagementProps {
  ingredients: Ingredient[];
  stockLogs: StockMovementLog[];
  products: Product[];
  onUpdateIngredients: (ingredients: Ingredient[], newLog?: StockMovementLog) => void;
}

export const InventoryManagement: React.FC<InventoryManagementProps> = ({
  ingredients,
  stockLogs,
  products,
  onUpdateIngredients,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [activeTab, setActiveTab] = useState<'stock' | 'logs'>('stock');
  
  // Restock Modal
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(10);
  const [restockNote, setRestockNote] = useState<string>('Pembelian pasokan pasar Majenang');

  // New Ingredient Modal
  const [isNewIngredientOpen, setIsNewIngredientOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<Ingredient['category']>('Bahan Pokok');
  const [newStock, setNewStock] = useState<number>(10);
  const [newUnit, setNewUnit] = useState<Ingredient['unit']>('kg');
  const [newMinThreshold, setNewMinThreshold] = useState<number>(3);
  const [newCost, setNewCost] = useState<number>(15000);

  const categories = [
    'Semua',
    'Bahan Pokok',
    'Daging & Telur',
    'Bumbu & Saus',
    'Minuman & Pemanis',
    'Sayuran & Pelengkap',
  ];

  const filteredIngredients = ingredients.filter((ing) => {
    return selectedCategory === 'Semua' || ing.category === selectedCategory;
  });

  const lowStockItems = ingredients.filter((ing) => ing.currentStock <= ing.minThreshold);

  // Total stock asset value
  const totalAssetValue = ingredients.reduce(
    (sum, ing) => sum + ing.currentStock * ing.costPerUnit,
    0
  );

  const handleOpenRestock = (ing: Ingredient) => {
    setSelectedIngredient(ing);
    setRestockAmount(ing.unit === 'kg' ? 5 : ing.unit === 'g' || ing.unit === 'ml' ? 1000 : 10);
    setRestockNote('Restock pasokan baru Majenang');
    setIsRestockOpen(true);
  };

  const handleSaveRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIngredient || restockAmount <= 0) return;

    const newStockVal = Math.round((selectedIngredient.currentStock + restockAmount) * 100) / 100;
    const updated = ingredients.map((ing) =>
      ing.id === selectedIngredient.id
        ? { ...ing, currentStock: newStockVal, lastUpdated: new Date().toISOString() }
        : ing
    );

    const log: StockMovementLog = {
      id: `log-${Date.now()}`,
      ingredientId: selectedIngredient.id,
      ingredientName: selectedIngredient.name,
      type: 'Restock',
      quantity: restockAmount,
      unit: selectedIngredient.unit,
      timestamp: new Date().toISOString(),
      notes: restockNote.trim() || 'Penambahan stok manual',
    };

    onUpdateIngredients(updated, log);
    setIsRestockOpen(false);
  };

  const handleSaveNewIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newIng: Ingredient = {
      id: `ing-${Date.now()}`,
      name: newName.trim(),
      category: newCategory,
      currentStock: Number(newStock) || 0,
      unit: newUnit,
      minThreshold: Number(newMinThreshold) || 1,
      costPerUnit: Number(newCost) || 0,
      lastUpdated: new Date().toISOString(),
    };

    const log: StockMovementLog = {
      id: `log-${Date.now()}`,
      ingredientId: newIng.id,
      ingredientName: newIng.name,
      type: 'Restock',
      quantity: newIng.currentStock,
      unit: newIng.unit,
      timestamp: new Date().toISOString(),
      notes: 'Pendaftaran bahan baku baru di kasir',
    };

    onUpdateIngredients([...ingredients, newIng], log);
    setIsNewIngredientOpen(false);
    setNewName('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner & Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Stat 1 */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-stone-500 font-medium">Total Bahan Gudang</span>
            <div className="text-2xl font-bold text-stone-900 tabular-nums">
              {ingredients.length} Jenis
            </div>
            <span className="text-[11px] text-stone-400">Terkoneksi ke menu kasir</span>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              lowStockItems.length > 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
            }`}
          >
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-stone-500 font-medium">Bahan Perlu Restock</span>
            <div
              className={`text-2xl font-bold tabular-nums ${
                lowStockItems.length > 0 ? 'text-red-600' : 'text-emerald-700'
              }`}
            >
              {lowStockItems.length} Bahan
            </div>
            <span className="text-[11px] text-stone-400">
              {lowStockItems.length > 0 ? 'Stok di bawah batas minimum' : 'Semua stok dalam batas aman'}
            </span>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <span className="text-xs text-stone-500 font-medium">Estimasi Nilai Persediaan</span>
            <div className="text-2xl font-bold text-stone-900 tabular-nums">
              {formatRupiah(totalAssetValue)}
            </div>
            <span className="text-[11px] text-stone-400">Total modal bahan saat ini</span>
          </div>
        </div>

      </div>

      {/* Critical Stock Alert Banner */}
      {lowStockItems.length > 0 && (
        <div className="p-4 bg-red-50 rounded-2xl border border-red-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 text-red-700 rounded-lg shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-red-900">
                Peringatan: {lowStockItems.length} Bahan Baku Menipis!
              </h4>
              <p className="text-xs text-red-700 mt-0.5">
                {lowStockItems.map((i) => `${i.name} (Sisa: ${i.currentStock} ${i.unit})`).join(' · ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => handleOpenRestock(lowStockItems[0])}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors whitespace-nowrap self-start sm:self-auto shadow-xs"
          >
            Restock Sekarang
          </button>
        </div>
      )}

      {/* Controls Bar: Tabs & Categories */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          
          {/* Sub-tabs */}
          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl text-xs font-medium">
            <button
              onClick={() => setActiveTab('stock')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'stock'
                  ? 'bg-white text-stone-900 font-bold shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Package className="w-4 h-4 text-amber-600" />
              <span>Daftar Stok Bahan</span>
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'logs'
                  ? 'bg-white text-stone-900 font-bold shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <History className="w-4 h-4 text-amber-600" />
              <span>Log Mutasi Otomatis ({stockLogs.length})</span>
            </button>
          </div>

          <button
            onClick={() => setIsNewIngredientOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-amber-600" />
            <span>Tambah Bahan Baku Baru</span>
          </button>
        </div>

        {/* Category Pills (Only in stock tab) */}
        {activeTab === 'stock' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-amber-600 text-white font-semibold'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Tab Content */}
      {activeTab === 'stock' ? (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase font-semibold text-[11px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Nama Bahan Baku</th>
                  <th className="py-3.5 px-4">Kategori</th>
                  <th className="py-3.5 px-4 text-right">Stok Gudang</th>
                  <th className="py-3.5 px-4 text-right">Batas Min.</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Biaya/Satuan</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-800">
                {filteredIngredients.map((ing) => {
                  const isLow = ing.currentStock <= ing.minThreshold;
                  return (
                    <tr key={ing.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3 px-4 font-semibold text-stone-900">
                        {ing.name}
                      </td>
                      <td className="py-3 px-4 text-stone-500">
                        {ing.category}
                      </td>
                      <td className="py-3 px-4 text-right font-bold tabular-nums text-stone-900">
                        {ing.currentStock} {ing.unit}
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums text-stone-400">
                        {ing.minThreshold} {ing.unit}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Menipis</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle className="w-3 h-3" />
                            <span>Aman</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums text-stone-600">
                        {formatRupiah(ing.costPerUnit)} / {ing.unit}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleOpenRestock(ing)}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
                        >
                          + Restock
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* AUTOMATED STOCK MUTATION LOGS */
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
          <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wide">
                Histori Mutasi & Pemotongan Otomatis
              </h3>
            </div>
            <span className="text-xs text-stone-500">
              Setiap pesanan kasir memotong stok secara real-time
            </span>
          </div>

          <div className="divide-y divide-stone-100 max-h-[550px] overflow-y-auto">
            {stockLogs.length === 0 ? (
              <div className="p-12 text-center text-stone-400 text-xs">
                Belum ada log mutasi stok. Lakukan transaksi di menu Kasir untuk melihat pemotongan otomatis.
              </div>
            ) : (
              stockLogs.map((log) => {
                const isDeduction = log.quantity < 0;
                return (
                  <div key={log.id} className="p-3.5 hover:bg-stone-50/80 transition-colors flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isDeduction
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isDeduction ? (
                          <ArrowDownRight className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-stone-900">
                          {log.ingredientName}
                        </div>
                        <div className="text-[11px] text-stone-500">
                          {log.notes} {log.referenceId && `(Ref: #${log.referenceId})`}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`font-bold tabular-nums text-sm ${
                          isDeduction ? 'text-amber-800' : 'text-emerald-700'
                        }`}
                      >
                        {isDeduction ? '' : '+'}
                        {log.quantity} {log.unit}
                      </div>
                      <div className="text-[10px] text-stone-400">
                        {new Date(log.timestamp).toLocaleString('id-ID', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* RESTOCK MODAL */}
      {isRestockOpen && selectedIngredient && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-stone-200">
            <div className="flex items-center justify-between px-6 py-4 bg-stone-50 border-b border-stone-200">
              <h3 className="text-base font-bold text-stone-900">
                Restock Bahan: {selectedIngredient.name}
              </h3>
              <button
                onClick={() => setIsRestockOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRestock} className="p-6 space-y-4">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs flex justify-between">
                <span className="text-stone-500">Stok Saat Ini:</span>
                <span className="font-bold text-stone-900 tabular-nums">
                  {selectedIngredient.currentStock} {selectedIngredient.unit}
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 block">
                  JUMLAH TAMBAH STOK ({selectedIngredient.unit.toUpperCase()})
                </label>
                <input
                  type="number"
                  min={0.1}
                  step={0.1}
                  required
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-base font-bold bg-white rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 tabular-nums"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 block">
                  CATATAN / SUPPLIER
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Belanja Pasar Majenang, Toko Sumber Rejeki"
                  value={restockNote}
                  onChange={(e) => setRestockNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsRestockOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs"
                >
                  Simpan Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW INGREDIENT MODAL */}
      {isNewIngredientOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-stone-200">
            <div className="flex items-center justify-between px-6 py-4 bg-stone-50 border-b border-stone-200">
              <h3 className="text-base font-bold text-stone-900">Tambah Bahan Baku Baru</h3>
              <button
                onClick={() => setIsNewIngredientOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewIngredient} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 block">NAMA BAHAN BAKU</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bawang Goreng Gurih"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 block">KATEGORI</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-hidden"
                  >
                    <option value="Bahan Pokok">Bahan Pokok</option>
                    <option value="Daging & Telur">Daging & Telur</option>
                    <option value="Bumbu & Saus">Bumbu & Saus</option>
                    <option value="Minuman & Pemanis">Minuman & Pemanis</option>
                    <option value="Sayuran & Pelengkap">Sayuran & Pelengkap</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 block">SATUAN UKUR</label>
                  <select
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-hidden"
                  >
                    <option value="kg">kg (Kilogram)</option>
                    <option value="g">g (Gram)</option>
                    <option value="liter">liter</option>
                    <option value="ml">ml (Mililiter)</option>
                    <option value="butir">butir</option>
                    <option value="potong">potong</option>
                    <option value="buah">buah</option>
                    <option value="bungkus">bungkus</option>
                    <option value="porsi">porsi</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 block">STOK AWAL</label>
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={newStock}
                    onChange={(e) => setNewStock(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-hidden tabular-nums"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 block">BATAS MINIMUM (ALERT)</label>
                  <input
                    type="number"
                    min={1}
                    value={newMinThreshold}
                    onChange={(e) => setNewMinThreshold(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-hidden tabular-nums"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 block">BIAYA PER SATUAN (RP)</label>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={newCost}
                  onChange={(e) => setNewCost(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-hidden tabular-nums"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewIngredientOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 bg-stone-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs"
                >
                  Daftarkan Bahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
