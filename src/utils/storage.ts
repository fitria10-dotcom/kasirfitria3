import {
  Ingredient,
  Product,
  StoreSettings,
  Transaction,
  StockMovementLog,
  CartItem,
  StockDeductionRecord,
} from '../types';
import { INITIAL_INGREDIENTS, INITIAL_PRODUCTS, INITIAL_SETTINGS } from '../data/initialData';

const KEYS = {
  SETTINGS: 'kasir_fitria_settings',
  PRODUCTS: 'kasir_fitria_products',
  INGREDIENTS: 'kasir_fitria_ingredients',
  TRANSACTIONS: 'kasir_fitria_transactions',
  STOCK_LOGS: 'kasir_fitria_stock_logs',
};

export const getSettings = (): StoreSettings => {
  try {
    const data = localStorage.getItem(KEYS.SETTINGS);
    return data ? JSON.parse(data) : INITIAL_SETTINGS;
  } catch {
    return INITIAL_SETTINGS;
  }
};

export const saveSettings = (settings: StoreSettings): void => {
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
};

export const getProducts = (): Product[] => {
  try {
    const data = localStorage.getItem(KEYS.PRODUCTS);
    return data ? JSON.parse(data) : INITIAL_PRODUCTS;
  } catch {
    return INITIAL_PRODUCTS;
  }
};

export const saveProducts = (products: Product[]): void => {
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
};

export const getIngredients = (): Ingredient[] => {
  try {
    const data = localStorage.getItem(KEYS.INGREDIENTS);
    return data ? JSON.parse(data) : INITIAL_INGREDIENTS;
  } catch {
    return INITIAL_INGREDIENTS;
  }
};

export const saveIngredients = (ingredients: Ingredient[]): void => {
  localStorage.setItem(KEYS.INGREDIENTS, JSON.stringify(ingredients));
};

export const getTransactions = (): Transaction[] => {
  try {
    const data = localStorage.getItem(KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveTransactions = (transactions: Transaction[]): void => {
  localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
};

export const getStockLogs = (): StockMovementLog[] => {
  try {
    const data = localStorage.getItem(KEYS.STOCK_LOGS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveStockLogs = (logs: StockMovementLog[]): void => {
  localStorage.setItem(KEYS.STOCK_LOGS, JSON.stringify(logs));
};

// Check if a product has sufficient ingredients in stock
export const checkProductStockAvailability = (
  product: Product,
  ingredients: Ingredient[],
  quantity: number = 1
): { canMake: boolean; maxPortions: number; limitingIngredient?: Ingredient; missingAmount?: number } => {
  if (!product.recipe || product.recipe.length === 0) {
    return { canMake: true, maxPortions: 999 };
  }

  let minPossible = Infinity;
  let limiting: Ingredient | undefined;
  let missing: number | undefined;

  for (const item of product.recipe) {
    const ing = ingredients.find((i) => i.id === item.ingredientId);
    if (!ing) continue;

    const needed = item.quantity * quantity;
    if (ing.currentStock < needed && (!limiting || (ing.currentStock / item.quantity) < minPossible)) {
      limiting = ing;
      missing = needed - ing.currentStock;
    }

    const possibleForThis = Math.floor(ing.currentStock / item.quantity);
    if (possibleForThis < minPossible) {
      minPossible = possibleForThis;
    }
  }

  const maxPortions = minPossible === Infinity ? 0 : Math.max(0, minPossible);
  const canMake = maxPortions >= quantity;

  return {
    canMake,
    maxPortions,
    limitingIngredient: limiting,
    missingAmount: missing,
  };
};

// Check entire cart against stock
export const validateCartStock = (
  cart: CartItem[],
  ingredients: Ingredient[]
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  // Calculate total needed per ingredient
  const neededPerIngredient: Record<string, number> = {};

  for (const cartItem of cart) {
    for (const recipeItem of cartItem.product.recipe || []) {
      neededPerIngredient[recipeItem.ingredientId] =
        (neededPerIngredient[recipeItem.ingredientId] || 0) + recipeItem.quantity * cartItem.quantity;
    }
  }

  for (const [ingId, totalNeeded] of Object.entries(neededPerIngredient)) {
    const ing = ingredients.find((i) => i.id === ingId);
    if (!ing) continue;
    if (ing.currentStock < totalNeeded) {
      const shortage = (totalNeeded - ing.currentStock).toFixed(2);
      errors.push(
        `Stok bahan "${ing.name}" kurang! Butuh ${totalNeeded} ${ing.unit}, stok tersedia ${ing.currentStock} ${ing.unit} (kurang ${shortage} ${ing.unit}).`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Automatically deduct stock and return updated ingredients, stock logs, and deduction records
export const processOrderStockDeduction = (
  orderNumber: string,
  cart: CartItem[],
  currentIngredients: Ingredient[],
  currentLogs: StockMovementLog[]
): {
  updatedIngredients: Ingredient[];
  updatedLogs: StockMovementLog[];
  deductionRecords: StockDeductionRecord[];
} => {
  // Aggregate required ingredients
  const aggregatedNeeds: Record<string, number> = {};

  for (const cartItem of cart) {
    for (const recipeItem of cartItem.product.recipe || []) {
      aggregatedNeeds[recipeItem.ingredientId] =
        (aggregatedNeeds[recipeItem.ingredientId] || 0) + recipeItem.quantity * cartItem.quantity;
    }
  }

  const updatedIngredients = currentIngredients.map((ing) => {
    const amountToDeduct = aggregatedNeeds[ing.id] || 0;
    if (amountToDeduct > 0) {
      const newStock = Math.max(0, Math.round((ing.currentStock - amountToDeduct) * 100) / 100);
      return {
        ...ing,
        currentStock: newStock,
        lastUpdated: new Date().toISOString(),
      };
    }
    return ing;
  });

  const deductionRecords: StockDeductionRecord[] = [];
  const newLogs: StockMovementLog[] = [];
  const timestamp = new Date().toISOString();

  for (const [ingId, deductedAmount] of Object.entries(aggregatedNeeds)) {
    const originalIng = currentIngredients.find((i) => i.id === ingId);
    const updatedIng = updatedIngredients.find((i) => i.id === ingId);
    if (originalIng && updatedIng) {
      deductionRecords.push({
        ingredientId: ingId,
        ingredientName: originalIng.name,
        deductedAmount: Math.round(deductedAmount * 100) / 100,
        unit: originalIng.unit,
        remainingStock: updatedIng.currentStock,
      });

      newLogs.push({
        id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        ingredientId: ingId,
        ingredientName: originalIng.name,
        type: 'Deduction_Order',
        quantity: -Math.round(deductedAmount * 100) / 100,
        unit: originalIng.unit,
        referenceId: orderNumber,
        timestamp,
        notes: `Pengurangan otomatis pesanan #${orderNumber}`,
      });
    }
  }

  return {
    updatedIngredients,
    updatedLogs: [...newLogs, ...currentLogs],
    deductionRecords,
  };
};

export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const resetAllDataToDefault = (): void => {
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  localStorage.setItem(KEYS.INGREDIENTS, JSON.stringify(INITIAL_INGREDIENTS));
  localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify([]));
  localStorage.setItem(KEYS.STOCK_LOGS, JSON.stringify([]));
};
