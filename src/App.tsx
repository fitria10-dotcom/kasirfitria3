/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Product,
  Ingredient,
  Transaction,
  StockMovementLog,
  StoreSettings,
} from './types';
import {
  getSettings,
  saveSettings,
  getProducts,
  saveProducts,
  getIngredients,
  saveIngredients,
  getTransactions,
  saveTransactions,
  getStockLogs,
  saveStockLogs,
  resetAllDataToDefault,
} from './utils/storage';
import { Header } from './components/Header';
import { PosView } from './components/PosView';
import { MenuManagement } from './components/MenuManagement';
import { InventoryManagement } from './components/InventoryManagement';
import { TransactionHistory } from './components/TransactionHistory';
import { ReportsView } from './components/ReportsView';
import { ReceiptModal } from './components/ReceiptModal';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'pos' | 'menu' | 'inventory' | 'history' | 'reports'>('pos');
  const [settings, setSettings] = useState<StoreSettings>(getSettings);
  const [products, setProducts] = useState<Product[]>(getProducts);
  const [ingredients, setIngredients] = useState<Ingredient[]>(getIngredients);
  const [transactions, setTransactions] = useState<Transaction[]>(getTransactions);
  const [stockLogs, setStockLogs] = useState<StockMovementLog[]>(getStockLogs);

  // Modals
  const [receiptTransaction, setReceiptTransaction] = useState<Transaction | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveProducts(products);
  }, [products]);

  useEffect(() => {
    saveIngredients(ingredients);
  }, [ingredients]);

  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    saveStockLogs(stockLogs);
  }, [stockLogs]);

  // Low stock counter for header alert
  const lowStockCount = ingredients.filter((ing) => ing.currentStock <= ing.minThreshold).length;

  // Handler for completed order
  const handleOrderCompleted = (
    newTx: Transaction,
    updatedIngredients: Ingredient[],
    updatedLogs: StockMovementLog[]
  ) => {
    setTransactions((prev) => [newTx, ...prev]);
    setIngredients(updatedIngredients);
    setStockLogs(updatedLogs);
  };

  // Handler for product save (add / edit)
  const handleSaveProduct = (product: Product) => {
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === product.id);
      if (idx > -1) {
        const next = [...prev];
        next[idx] = product;
        return next;
      }
      return [product, ...prev];
    });
  };

  // Handler for product delete
  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  // Handler for inventory stock updates & restocks
  const handleUpdateIngredients = (updated: Ingredient[], newLog?: StockMovementLog) => {
    setIngredients(updated);
    if (newLog) {
      setStockLogs((prev) => [newLog, ...prev]);
    }
  };

  // Handler for settings save
  const handleSaveSettings = (newSettings: StoreSettings) => {
    setSettings(newSettings);
  };

  // Handler for reset data
  const handleResetData = () => {
    resetAllDataToDefault();
    setSettings(getSettings());
    setProducts(getProducts());
    setIngredients(getIngredients());
    setTransactions([]);
    setStockLogs([]);
  };

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 flex flex-col selection:bg-amber-100 selection:text-amber-900">
      
      {/* Top Bar Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        settings={settings}
        onOpenSettings={() => setIsSettingsOpen(true)}
        lowStockCount={lowStockCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {currentTab === 'pos' && (
          <PosView
            products={products}
            ingredients={ingredients}
            settings={settings}
            stockLogs={stockLogs}
            onOrderCompleted={handleOrderCompleted}
            onOpenReceipt={(tx) => setReceiptTransaction(tx)}
          />
        )}

        {currentTab === 'menu' && (
          <MenuManagement
            products={products}
            ingredients={ingredients}
            onSaveProduct={handleSaveProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        )}

        {currentTab === 'inventory' && (
          <InventoryManagement
            ingredients={ingredients}
            stockLogs={stockLogs}
            products={products}
            onUpdateIngredients={handleUpdateIngredients}
          />
        )}

        {currentTab === 'history' && (
          <TransactionHistory
            transactions={transactions}
            settings={settings}
            onOpenReceipt={(tx) => setReceiptTransaction(tx)}
          />
        )}

        {currentTab === 'reports' && (
          <ReportsView
            transactions={transactions}
            stockLogs={stockLogs}
            settings={settings}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 py-4 text-center text-xs text-stone-500 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>{settings.storeName || 'Kasir Fitria Oktafiani'}</strong> · {settings.address || 'Jl. Cabesar 02/08 Majenang'}
          </div>
          <div>
            Sistem Kasir & Pemotong Stok Otomatis · Kasir: <span className="font-semibold text-stone-800">{settings.cashierName}</span>
          </div>
        </div>
      </footer>

      {/* Thermal Receipt Modal */}
      {receiptTransaction && (
        <ReceiptModal
          transaction={receiptTransaction}
          settings={settings}
          onClose={() => setReceiptTransaction(null)}
        />
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          onSaveSettings={handleSaveSettings}
          onResetData={handleResetData}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

    </div>
  );
}
