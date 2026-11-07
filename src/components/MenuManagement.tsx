import React, { useState, useRef } from 'react';
import { Product, Ingredient, RecipeItem } from '../types';
import { formatRupiah } from '../utils/storage';
import {
  Plus,
  Edit2,
  Trash2,
  Upload,
  Link as LinkIcon,
  Sparkles,
  UtensilsCrossed,
  X,
  Check,
  Image as ImageIcon
} from 'lucide-react';

interface MenuManagementProps {
  products: Product[];
  ingredients: Ingredient[];
  onSaveProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
}

export const MenuManagement: React.FC<MenuManagementProps> = ({
  products,
  ingredients,
  onSaveProduct,
  onDeleteProduct,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'Makanan Utama' | 'Camilan' | 'Minuman' | 'Paket Spesial'>('Makanan Utama');
  const [price, setPrice] = useState<number>(20000);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageMode, setImageMode] = useState<'upload' | 'url' | 'preset'>('upload');
  const [recipe, setRecipe] = useState<RecipeItem[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Quick preset photos
  const presetPhotos = [
    { label: 'Nasi Goreng Spesial', url: '/src/assets/images/nasi_goreng_spesial_1794046283327.jpg' },
    { label: 'Ayam Bakar Madu', url: '/src/assets/images/ayam_bakar_madu_1794046297494.jpg' },
    { label: 'Sate Ayam Bumbu Kacang', url: '/src/assets/images/sate_ayam_madura_1794046298995.jpg' },
    { label: 'Minuman Segar & Es Teh', url: '/src/assets/images/minuman_es_segar_1794046299339.jpg' },
  ];

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setName('');
    setCategory('Makanan Utama');
    setPrice(20000);
    setDescription('');
    setImageUrl(presetPhotos[0].url);
    setImageMode('upload');
    setRecipe([]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setCategory(p.category);
    setPrice(p.price);
    setDescription(p.description || '');
    setImageUrl(p.imageUrl || '');
    setImageMode(p.imageUrl.startsWith('data:image') ? 'upload' : 'url');
    setRecipe(p.recipe ? [...p.recipe] : []);
    setIsModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Harap pilih file gambar (JPG, PNG, WebP)!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setImageUrl(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Recipe item adjustments
  const handleAddRecipeIngredient = (ingredientId: string) => {
    if (recipe.some((r) => r.ingredientId === ingredientId)) return;
    setRecipe((prev) => [...prev, { ingredientId, quantity: 1 }]);
  };

  const handleUpdateRecipeQuantity = (ingredientId: string, quantity: number) => {
    setRecipe((prev) =>
      prev.map((r) => (r.ingredientId === ingredientId ? { ...r, quantity } : r))
    );
  };

  const handleRemoveRecipeIngredient = (ingredientId: string) => {
    setRecipe((prev) => prev.filter((r) => r.ingredientId !== ingredientId));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Nama produk tidak boleh kosong!');
      return;
    }

    const newProduct: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      name: name.trim(),
      category,
      price: Number(price) || 0,
      description: description.trim(),
      imageUrl: imageUrl.trim() || presetPhotos[0].url,
      recipe: recipe.filter((r) => r.quantity > 0),
      isAvailable: true,
    };

    onSaveProduct(newProduct);
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-stone-900">Kelola Menu & Foto Produk</h1>
            <span className="text-xs bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-semibold">
              {products.length} Menu Tersedia
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Setiap menu dapat memiliki foto produk sendiri (unggah foto atau link gambar) dan resep bahan baku otomatis.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Menu Baru</span>
        </button>
      </div>

      {/* Menu Cards Table / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {products.map((product) => {
          return (
            <div
              key={product.id}
              className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              {/* Product Photo Header */}
              <div className="relative aspect-16/10 w-full bg-stone-100 overflow-hidden">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}

                <div
                  className={`${
                    product.imageUrl ? 'hidden' : ''
                  } w-full h-full flex flex-col items-center justify-center bg-amber-50 text-amber-800 p-4`}
                >
                  <UtensilsCrossed className="w-8 h-8 opacity-40 mb-1" />
                  <span className="text-xs font-semibold">{product.name}</span>
                </div>

                <div className="absolute top-2.5 right-2.5">
                  <span className="px-2 py-0.5 text-xs font-bold bg-white/95 text-stone-900 rounded-md shadow-xs tabular-nums">
                    {formatRupiah(product.price)}
                  </span>
                </div>

                <div className="absolute top-2.5 left-2.5">
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-stone-900/80 text-white rounded-md backdrop-blur-xs">
                    {product.category}
                  </span>
                </div>
              </div>

              {/* Content & Recipe details */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-bold text-stone-900 text-sm leading-snug">{product.name}</h3>
                  <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                    {product.description || 'Tidak ada deskripsi.'}
                  </p>
                </div>

                {/* Recipe preview */}
                <div className="pt-2 border-t border-stone-100">
                  <div className="text-[11px] font-semibold text-stone-600 mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>Resep Bahan Otomatis:</span>
                  </div>
                  {product.recipe && product.recipe.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {product.recipe.map((r, idx) => {
                        const ing = ingredients.find((i) => i.id === r.ingredientId);
                        if (!ing) return null;
                        return (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 bg-stone-100 text-stone-700 rounded-md"
                          >
                            {ing.name}: {r.quantity} {ing.unit}
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="text-[11px] text-stone-400 italic">Belum ada bahan terkait</span>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEdit(product)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:text-amber-800 bg-stone-100 hover:bg-amber-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Menu & Foto</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Yakin ingin menghapus menu "${product.name}"?`)) {
                        onDeleteProduct(product.id);
                      }
                    }}
                    className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    title="Hapus Menu"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between px-6 py-4 bg-stone-50 border-b border-stone-200">
              <h3 className="text-base font-bold text-stone-900">
                {editingProduct ? 'Edit Menu & Foto Produk' : 'Tambah Menu Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5 max-h-[calc(85vh-5rem)] overflow-y-auto">
              
              {/* Product Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 block">NAMA MENU</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Nasi Bakar Teri Majenang"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 block">KATEGORI</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30"
                  >
                    <option value="Makanan Utama">Makanan Utama</option>
                    <option value="Camilan">Camilan</option>
                    <option value="Minuman">Minuman</option>
                    <option value="Paket Spesial">Paket Spesial</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 block">HARGA (RP)</label>
                  <input
                    type="number"
                    min={0}
                    step={500}
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 tabular-nums"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 block">DESKRIPSI MENU</label>
                  <input
                    type="text"
                    placeholder="Deskripsi singkat rasa dan penyajian"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>
              </div>

              {/* FOTO PRODUK (UPLOAD / URL / PRESET) */}
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-amber-600" />
                    <span>FOTO PRODUK</span>
                  </label>
                  
                  {/* Mode Selector */}
                  <div className="flex items-center gap-1 p-0.5 bg-stone-200/80 rounded-lg text-xs font-medium">
                    <button
                      type="button"
                      onClick={() => setImageMode('upload')}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        imageMode === 'upload' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
                      }`}
                    >
                      Unggah File
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageMode('url')}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        imageMode === 'url' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
                      }`}
                    >
                      Input URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageMode('preset')}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        imageMode === 'preset' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
                      }`}
                    >
                      Koleksi Resto
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  
                  {/* Input controls based on mode */}
                  <div className="sm:col-span-8 space-y-2">
                    {imageMode === 'upload' && (
                      <div className="space-y-2">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full py-4 px-3 border-2 border-dashed border-amber-300 hover:border-amber-500 rounded-xl bg-amber-50/50 hover:bg-amber-50 text-amber-900 flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <Upload className="w-5 h-5 text-amber-600" />
                          <span className="text-xs font-semibold">Klik untuk Memilih Foto dari HP / Komputer</span>
                          <span className="text-[10px] text-stone-500">Mendukung format JPG, PNG, WEBP</span>
                        </button>
                      </div>
                    )}

                    {imageMode === 'url' && (
                      <div className="space-y-1">
                        <div className="relative">
                          <LinkIcon className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="url"
                            placeholder="https://contoh-link-gambar.com/makanan.jpg"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-xs bg-white rounded-lg border border-stone-300 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                          />
                        </div>
                        <p className="text-[10px] text-stone-400">
                          Masukkan URL tautan gambar langsung ke produk.
                        </p>
                      </div>
                    )}

                    {imageMode === 'preset' && (
                      <div className="grid grid-cols-2 gap-2">
                        {presetPhotos.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setImageUrl(preset.url)}
                            className={`p-2 rounded-lg border text-left flex items-center gap-2 transition-colors ${
                              imageUrl === preset.url
                                ? 'border-amber-600 bg-amber-50 text-amber-900 font-semibold'
                                : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                            }`}
                          >
                            <img
                              src={preset.url}
                              alt={preset.label}
                              className="w-8 h-8 rounded object-cover"
                            />
                            <span className="text-[11px] truncate">{preset.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Image Preview box */}
                  <div className="sm:col-span-4 flex flex-col items-center">
                    <span className="text-[11px] text-stone-500 mb-1">Pratinjau Foto:</span>
                    <div className="w-28 h-24 rounded-lg bg-stone-200 border border-stone-300 overflow-hidden relative shadow-xs flex items-center justify-center">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt="Pratinjau"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`${imageUrl ? 'hidden' : ''} text-center p-2 text-stone-400 text-[10px]`}>
                        Belum ada foto
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* RECIPE & AUTOMATIC INVENTORY LINKING */}
              <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>Resep Bahan Baku (Pengurangan Stok Otomatis)</span>
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      Tentukan bahan gudang apa saja yang otomatis berkurang setiap kali menu ini dipesan pelanggan.
                    </p>
                  </div>
                </div>

                {/* Selected Ingredients List */}
                <div className="space-y-2">
                  {recipe.map((r) => {
                    const ing = ingredients.find((i) => i.id === r.ingredientId);
                    if (!ing) return null;
                    return (
                      <div
                        key={r.ingredientId}
                        className="flex items-center gap-3 p-2 bg-white rounded-lg border border-amber-200 text-xs"
                      >
                        <div className="flex-1 font-semibold text-stone-900 truncate">
                          {ing.name}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-stone-500 text-[11px]">Pakai:</span>
                          <input
                            type="number"
                            min={0.01}
                            step={0.01}
                            value={r.quantity}
                            onChange={(e) =>
                              handleUpdateRecipeQuantity(r.ingredientId, Number(e.target.value))
                            }
                            className="w-20 px-2 py-1 text-xs border border-stone-300 rounded font-bold text-center tabular-nums"
                          />
                          <span className="text-stone-600 font-medium text-[11px] w-12">
                            {ing.unit}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveRecipeIngredient(r.ingredientId)}
                            className="p-1 text-stone-400 hover:text-red-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {recipe.length === 0 && (
                    <div className="text-center py-3 text-stone-400 text-xs bg-white/60 rounded-lg border border-dashed border-stone-300">
                      Belum ada bahan baku yang dihubungkan ke menu ini.
                    </div>
                  )}
                </div>

                {/* Add ingredient dropdown */}
                <div className="pt-2 flex items-center gap-2">
                  <select
                    id="add-ingredient-select"
                    defaultValue=""
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddRecipeIngredient(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white"
                  >
                    <option value="" disabled>
                      + Tambah Bahan Baku dari Gudang...
                    </option>
                    {ingredients
                      .filter((i) => !recipe.some((r) => r.ingredientId === i.id))
                      .map((ing) => (
                        <option key={ing.id} value={ing.id}>
                          {ing.name} (Stok: {ing.currentStock} {ing.unit})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-6 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Menu</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
