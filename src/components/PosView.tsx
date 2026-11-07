import React, { useState, useMemo } from 'react';
import { Product, Ingredient, CartItem, Transaction, StoreSettings, StockMovementLog } from '../types';
import { formatRupiah, checkProductStockAvailability, validateCartStock, processOrderStockDeduction } from '../utils/storage';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  QrCode,
  AlertTriangle,
  Receipt,
  Utensils,
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';

interface PosViewProps {
  products: Product[];
  ingredients: Ingredient[];
  settings: StoreSettings;
  stockLogs: StockMovementLog[];
  onOrderCompleted: (
    transaction: Transaction,
    updatedIngredients: Ingredient[],
    updatedLogs: StockMovementLog[]
  ) => void;
  onOpenReceipt: (transaction: Transaction) => void;
}

export const PosView: React.FC<PosViewProps> = ({
  products,
  ingredients,
  settings,
  stockLogs,
  onOrderCompleted,
  onOpenReceipt,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');

  // Payment Modal state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'Tunai' | 'QRIS' | 'Transfer Bank' | 'Kartu Debit'>('Tunai');
  const [cashGiven, setCashGiven] = useState<number>(0);
  const [activeItemNoteId, setActiveItemNoteId] = useState<string | null>(null);

  // Categories
  const categories = ['Semua', 'Makanan Utama', 'Camilan', 'Minuman', 'Paket Spesial'];

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCategory === 'Semua' || p.category === selectedCategory;
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Cart calculations
  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cart]);

  const taxAmount = (cartSubtotal * (settings.taxRate || 0)) / 100;
  const cartTotal = cartSubtotal + taxAmount;

  // Stock validation for cart
  const cartStockCheck = useMemo(() => {
    return validateCartStock(cart, ingredients);
  }, [cart, ingredients]);

  // Add item to cart
  const handleAddToCart = (product: Product) => {
    // Check if ingredient stock allows at least 1 more portion
    const existing = cart.find((i) => i.product.id === product.id);
    const currentQtyInCart = existing ? existing.quantity : 0;
    const stockInfo = checkProductStockAvailability(product, ingredients, currentQtyInCart + 1);

    if (!stockInfo.canMake) {
      alert(
        `Mohon maaf, stok bahan "${stockInfo.limitingIngredient?.name || 'makanan'}" tidak mencukupi untuk menambah porsi ${product.name}!`
      );
      return;
    }

    setCart((prev) => {
      const idx = prev.findIndex((item) => item.product.id === product.id);
      if (idx > -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;

            // Check stock if increasing
            if (delta > 0) {
              const stockInfo = checkProductStockAvailability(item.product, ingredients, newQty);
              if (!stockInfo.canMake) {
                alert(
                  `Stok bahan "${stockInfo.limitingIngredient?.name}" tidak mencukupi untuk ${newQty} porsi!`
                );
                return item;
              }
            }

            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleSetItemNote = (productId: string, note: string) => {
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, notes: note } : item))
    );
  };

  const handleOpenCheckout = () => {
    if (cart.length === 0) return;
    if (!cartStockCheck.isValid) {
      alert('Terdapat bahan yang kurang untuk pesanan ini. Harap kurangi porsi atau cek persediaan!');
      return;
    }
    setCashGiven(cartTotal);
    setIsCheckoutOpen(true);
  };

  const handleProcessPayment = () => {
    if (paymentMethod === 'Tunai' && cashGiven < cartTotal) {
      alert('Uang yang dibayarkan kurang dari total pesanan!');
      return;
    }

    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
    
    // Process automatic stock deduction
    const { updatedIngredients, updatedLogs, deductionRecords } = processOrderStockDeduction(
      orderNumber,
      cart,
      ingredients,
      stockLogs
    );

    const change = paymentMethod === 'Tunai' ? Math.max(0, cashGiven - cartTotal) : 0;

    const newTransaction: Transaction = {
      id: `trx-${Date.now()}`,
      orderNumber,
      date: new Date().toISOString(),
      items: cart.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        subtotal: item.product.price * item.quantity,
        notes: item.notes,
      })),
      totalAmount: cartTotal,
      paymentMethod,
      cashGiven: paymentMethod === 'Tunai' ? cashGiven : cartTotal,
      change,
      cashierName: settings.cashierName || 'Fitria Oktafiani',
      customerName: customerName.trim() || undefined,
      stockDeductions: deductionRecords,
    };

    onOrderCompleted(newTransaction, updatedIngredients, updatedLogs);
    setCart([]);
    setCustomerName('');
    setIsCheckoutOpen(false);
    onOpenReceipt(newTransaction);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Cashier Welcome Banner */}
      <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-xs">
            FO
          </div>
          <div>
            <h1 className="text-base font-bold text-stone-900">
              Kasir Aktif: {settings.cashierName || 'Fitria Oktafiani'}
            </h1>
            <p className="text-xs text-stone-600 flex items-center gap-1.5">
              <span>Lokasi: {settings.address || 'Jl. Cabesar 02/08 Majenang'}</span>
              <span>·</span>
              <span className="text-emerald-700 font-medium">Sistem Pemotong Stok Otomatis Aktif</span>
            </p>
          </div>
        </div>
        <div className="text-xs text-stone-600 bg-white/80 px-3 py-1.5 rounded-lg border border-amber-200/50">
          Katalog Menu: <strong className="text-stone-900">{products.length} Item</strong> · Bahan Baku:{' '}
          <strong className="text-stone-900">{ingredients.length} Jenis</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Main Menu Section (8 columns on desktop) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          
          {/* Search & Category Filter */}
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari makanan atau minuman (contoh: Nasi Goreng, Ayam Bakar, Es Teh)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-600 bg-stone-50/50"
              />
            </div>

            {/* Category tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredProducts.map((product) => {
              const stockInfo = checkProductStockAvailability(product, ingredients, 1);
              const inCart = cart.find((i) => i.product.id === product.id);

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between group"
                >
                  {/* Product Image Header with genuine photo */}
                  <div className="relative aspect-4/3 w-full bg-stone-100 overflow-hidden">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          // Fallback to stylized SVG placeholder if image fails
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}

                    {/* Fallback container */}
                    <div className={`${product.imageUrl ? 'hidden' : ''} w-full h-full flex flex-col items-center justify-center bg-amber-50 text-amber-800 p-4`}>
                      <Utensils className="w-8 h-8 opacity-40 mb-1" />
                      <span className="text-xs font-medium">{product.name}</span>
                    </div>

                    {/* Stock Availability Badge */}
                    <div className="absolute top-2.5 right-2.5">
                      {stockInfo.canMake ? (
                        <span className="px-2 py-0.5 text-[11px] font-semibold bg-white/90 backdrop-blur-xs text-emerald-800 rounded-md shadow-xs">
                          Sisa ~{stockInfo.maxPortions} porsi
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[11px] font-semibold bg-red-600/90 backdrop-blur-xs text-white rounded-md shadow-xs">
                          Bahan Habis
                        </span>
                      )}
                    </div>

                    {/* In-Cart Count Overlay */}
                    {inCart && (
                      <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-amber-600 text-white text-xs font-bold rounded-md shadow-xs">
                        {inCart.quantity} di keranjang
                      </div>
                    )}
                  </div>

                  {/* Product Content */}
                  <div className="p-3.5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-[11px] uppercase tracking-wider font-semibold text-amber-700">
                        {product.category}
                      </div>
                      <h3 className="text-sm font-bold text-stone-900 line-clamp-1 mt-0.5">
                        {product.name}
                      </h3>
                      <p className="text-xs text-stone-500 line-clamp-2 mt-1">
                        {product.description || 'Menu lezat pilihan Kasir Fitria Oktafiani.'}
                      </p>
                    </div>

                    {/* Price and Add button */}
                    <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-stone-400 block">Harga</span>
                        <span className="text-sm font-bold text-stone-900 tabular-nums">
                          {formatRupiah(product.price)}
                        </span>
                      </div>

                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={!stockInfo.canMake}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          stockInfo.canMake
                            ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs active:scale-95'
                            : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="bg-white p-12 text-center rounded-xl border border-stone-200">
              <Utensils className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-stone-700">Tidak ada menu yang sesuai pencarian.</p>
              <p className="text-xs text-stone-400 mt-1">Coba kata kunci lain atau pilih kategori lain.</p>
            </div>
          )}
        </div>

        {/* Right Section: Shopping Cart & Checkout (4 columns on desktop) */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-xl border border-stone-200 shadow-sm sticky top-20 flex flex-col max-h-[calc(100vh-6rem)]">
          
          {/* Cart Header */}
          <div className="p-4 border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-amber-600" />
              <h2 className="text-sm font-bold text-stone-900">Pesanan Kasir</h2>
            </div>
            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
                className="text-xs text-stone-400 hover:text-red-600 transition-colors"
              >
                Kosongkan
              </button>
            )}
          </div>

          {/* Customer input */}
          <div className="px-4 py-3 bg-stone-50 border-b border-stone-200">
            <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1">
              Nama Pelanggan / Meja (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Meja 03 / Bpk. Rudi"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white rounded-lg border border-stone-300 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="py-12 text-center text-stone-400">
                <Utensils className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs">Keranjang pesanan masih kosong</p>
                <p className="text-[11px] mt-1 text-stone-400">Klik tombol Tambah pada daftar menu</p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product.id}
                  className="p-3 bg-stone-50/80 rounded-xl border border-stone-200/80 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-stone-900 truncate">
                        {item.product.name}
                      </h4>
                      <div className="text-[11px] text-stone-500 tabular-nums">
                        {formatRupiah(item.product.price)}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleUpdateQuantity(item.product.id, -1)}
                        className="w-6 h-6 rounded-md bg-white border border-stone-300 flex items-center justify-center text-stone-600 hover:bg-stone-100"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-stone-900 tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(item.product.id, 1)}
                        className="w-6 h-6 rounded-md bg-white border border-stone-300 flex items-center justify-center text-stone-600 hover:bg-stone-100"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleRemoveItem(item.product.id)}
                        className="w-6 h-6 rounded-md text-stone-400 hover:text-red-600 flex items-center justify-center ml-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Subtotal & Note */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-200/50">
                    <button
                      onClick={() =>
                        setActiveItemNoteId(
                          activeItemNoteId === item.product.id ? null : item.product.id
                        )
                      }
                      className="text-[11px] text-amber-700 hover:underline"
                    >
                      {item.notes ? `Catatan: ${item.notes}` : '+ Catatan khusus'}
                    </button>
                    <span className="font-bold text-stone-900 tabular-nums">
                      {formatRupiah(item.product.price * item.quantity)}
                    </span>
                  </div>

                  {activeItemNoteId === item.product.id && (
                    <div className="pt-1">
                      <input
                        type="text"
                        placeholder="Contoh: Pedas sedang, tanpa timun..."
                        value={item.notes || ''}
                        onChange={(e) => handleSetItemNote(item.product.id, e.target.value)}
                        className="w-full px-2 py-1 text-xs bg-white rounded border border-stone-300 focus:outline-hidden"
                      />
                    </div>
                  )}
                </div>
              ))
            )}

            {/* Warnings if cart has insufficient ingredients */}
            {!cartStockCheck.isValid && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-red-700">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>Peringatan Stok Bahan Baku</span>
                </div>
                {cartStockCheck.errors.map((err, idx) => (
                  <p key={idx} className="text-[11px] text-red-600">
                    • {err}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Cart Footer & Checkout Button */}
          {cart.length > 0 && (
            <div className="p-4 bg-stone-50 border-t border-stone-200 space-y-3">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-stone-500">
                  <span>Subtotal</span>
                  <span className="tabular-nums">{formatRupiah(cartSubtotal)}</span>
                </div>
                {settings.taxRate > 0 && (
                  <div className="flex justify-between text-stone-500">
                    <span>Pajak ({settings.taxRate}%)</span>
                    <span className="tabular-nums">{formatRupiah(taxAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-stone-900 pt-1 border-t border-stone-200">
                  <span>Total Tagihan</span>
                  <span className="tabular-nums text-amber-700">{formatRupiah(cartTotal)}</span>
                </div>
              </div>

              <div className="text-[10px] text-stone-500 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>Bahan makanan akan otomatis terpotong dari gudang saat checkout.</span>
              </div>

              <button
                onClick={handleOpenCheckout}
                disabled={!cartStockCheck.isValid}
                className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm ${
                  cartStockCheck.isValid
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-stone-300 text-stone-500 cursor-not-allowed'
                }`}
              >
                <span>Lanjut Pembayaran</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Payment / Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-stone-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-stone-900">Pembayaran Kasir</h3>
                <p className="text-xs text-stone-500">
                  Kasir: {settings.cashierName} · {settings.address}
                </p>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="text-stone-400 hover:text-stone-600 text-sm font-semibold"
              >
                Batal
              </button>
            </div>

            <div className="p-6 space-y-5">
              
              {/* Total Display */}
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-center">
                <span className="text-xs text-amber-800 font-medium">TOTAL PEMBAYARAN</span>
                <div className="text-3xl font-extrabold text-stone-900 tabular-nums mt-1">
                  {formatRupiah(cartTotal)}
                </div>
                {customerName && (
                  <div className="text-xs text-amber-900 font-medium mt-1">
                    Pelanggan: {customerName}
                  </div>
                )}
              </div>

              {/* Payment Methods */}
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-2">
                  PILIH METODE PEMBAYARAN
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => setPaymentMethod('Tunai')}
                    className={`p-3 rounded-xl border text-center transition-colors flex flex-col items-center gap-1 ${
                      paymentMethod === 'Tunai'
                        ? 'border-amber-600 bg-amber-50 text-amber-900 font-bold shadow-xs'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                    }`}
                  >
                    <Banknote className="w-5 h-5 text-amber-600" />
                    <span className="text-xs">Tunai</span>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('QRIS')}
                    className={`p-3 rounded-xl border text-center transition-colors flex flex-col items-center gap-1 ${
                      paymentMethod === 'QRIS'
                        ? 'border-amber-600 bg-amber-50 text-amber-900 font-bold shadow-xs'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                    }`}
                  >
                    <QrCode className="w-5 h-5 text-amber-600" />
                    <span className="text-xs">QRIS</span>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('Transfer Bank')}
                    className={`p-3 rounded-xl border text-center transition-colors flex flex-col items-center gap-1 ${
                      paymentMethod === 'Transfer Bank'
                        ? 'border-amber-600 bg-amber-50 text-amber-900 font-bold shadow-xs'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-amber-600" />
                    <span className="text-xs">Transfer</span>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('Kartu Debit')}
                    className={`p-3 rounded-xl border text-center transition-colors flex flex-col items-center gap-1 ${
                      paymentMethod === 'Kartu Debit'
                        ? 'border-amber-600 bg-amber-50 text-amber-900 font-bold shadow-xs'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-amber-600" />
                    <span className="text-xs">Debit</span>
                  </button>
                </div>
              </div>

              {/* Cash handling when Tunai is selected */}
              {paymentMethod === 'Tunai' && (
                <div className="space-y-3 bg-stone-50 p-4 rounded-xl border border-stone-200">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-700">UANG DITERIMA (RP)</label>
                    <span className="text-xs text-stone-500">Klik pilihan cepat:</span>
                  </div>

                  {/* Quick Cash Buttons */}
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => setCashGiven(cartTotal)}
                      className="px-2.5 py-1 text-xs font-semibold bg-white border border-stone-300 rounded-lg hover:bg-amber-50 hover:border-amber-500"
                    >
                      Uang Pas
                    </button>
                    {[20000, 50000, 100000, 150000, 200000].map((amt) => {
                      if (amt < cartTotal) return null;
                      return (
                        <button
                          key={amt}
                          onClick={() => setCashGiven(amt)}
                          className="px-2.5 py-1 text-xs font-semibold bg-white border border-stone-300 rounded-lg hover:bg-amber-50 hover:border-amber-500"
                        >
                          {formatRupiah(amt)}
                        </button>
                      );
                    })}
                  </div>

                  <input
                    type="number"
                    min={cartTotal}
                    step={1000}
                    value={cashGiven || ''}
                    onChange={(e) => setCashGiven(Number(e.target.value))}
                    className="w-full px-3 py-2 text-base font-bold bg-white rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 tabular-nums"
                  />

                  {/* Change calculation */}
                  <div className="flex justify-between items-center pt-2 border-t border-stone-200">
                    <span className="text-xs font-semibold text-stone-600">Kembalian:</span>
                    <span
                      className={`text-lg font-bold tabular-nums ${
                        cashGiven >= cartTotal ? 'text-emerald-700' : 'text-red-600'
                      }`}
                    >
                      {cashGiven >= cartTotal
                        ? formatRupiah(cashGiven - cartTotal)
                        : `Kurang ${formatRupiah(cartTotal - cashGiven)}`}
                    </span>
                  </div>
                </div>
              )}

              {paymentMethod !== 'Tunai' && (
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-3">
                  <QrCode className="w-8 h-8 text-emerald-600 shrink-0" />
                  <div className="text-xs text-emerald-900">
                    <div className="font-bold">Pembayaran Non-Tunai ({paymentMethod})</div>
                    <div>Silakan verifikasi transaksi pada mesin EDC / QRIS toko Majenang.</div>
                  </div>
                </div>
              )}

              {/* Automatic Stock Deduction Notice */}
              <div className="p-3 bg-amber-50/80 rounded-lg border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  Sistem otomatis memotong stok bahan makanan di gudang segera setelah tombol di bawah
                  ditekan dan mencatat log mutasi.
                </span>
              </div>

              {/* Confirm Payment Button */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setIsCheckoutOpen(false)}
                  className="flex-1 py-2.5 text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
                >
                  Kembali
                </button>
                <button
                  onClick={handleProcessPayment}
                  disabled={paymentMethod === 'Tunai' && cashGiven < cartTotal}
                  className={`flex-2 py-2.5 text-xs font-bold rounded-xl transition-colors shadow-sm ${
                    paymentMethod !== 'Tunai' || cashGiven >= cartTotal
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-stone-300 text-stone-500 cursor-not-allowed'
                  }`}
                >
                  Bayar & Selesaikan Pesanan
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
