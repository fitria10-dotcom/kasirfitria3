export interface Ingredient {
  id: string;
  name: string;
  category: 'Bahan Pokok' | 'Daging & Telur' | 'Bumbu & Saus' | 'Minuman & Pemanis' | 'Sayuran & Pelengkap';
  currentStock: number;
  unit: 'kg' | 'g' | 'liter' | 'ml' | 'butir' | 'potong' | 'buah' | 'bungkus' | 'porsi';
  minThreshold: number;
  costPerUnit: number; // in IDR
  lastUpdated: string;
}

export interface RecipeItem {
  ingredientId: string;
  quantity: number; // amount of ingredient consumed per 1 unit of product
}

export interface Product {
  id: string;
  name: string;
  category: 'Makanan Utama' | 'Camilan' | 'Minuman' | 'Paket Spesial';
  price: number; // in IDR
  imageUrl: string;
  description: string;
  recipe: RecipeItem[]; // ingredients deducted automatically on sale
  isAvailable?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
}

export interface StockDeductionRecord {
  ingredientId: string;
  ingredientName: string;
  deductedAmount: number;
  unit: string;
  remainingStock: number;
}

export interface Transaction {
  id: string;
  orderNumber: string;
  date: string; // ISO string
  items: {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    subtotal: number;
    notes?: string;
  }[];
  totalAmount: number;
  paymentMethod: 'Tunai' | 'QRIS' | 'Transfer Bank' | 'Kartu Debit';
  cashGiven?: number;
  change?: number;
  cashierName: string;
  customerName?: string;
  stockDeductions: StockDeductionRecord[];
}

export interface StockMovementLog {
  id: string;
  ingredientId: string;
  ingredientName: string;
  type: 'Deduction_Order' | 'Restock' | 'Adjustment';
  quantity: number; // positive for restock, negative for deduction
  unit: string;
  referenceId?: string; // Order ID or Restock note
  timestamp: string;
  notes: string;
}

export interface StoreSettings {
  storeName: string;
  cashierName: string;
  address: string;
  phone: string;
  taxRate: number; // percentage (0 if none)
  receiptFooterMessage: string;
}
