import React, { useState, useEffect } from 'react';
import { Product, Movement, MovementType, ActiveTab, Toast, Operator } from './types';
import {
  getStoredProducts,
  saveProducts,
  getStoredMovements,
  saveMovements,
  resetToDemoData,
  getStoredOperator,
  saveStoredOperator,
  DEFAULT_OPERATOR
} from './utils/storage';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { ToastContainer } from './components/ToastContainer';
import { QRScannerModal } from './components/QRScannerModal';
import { ScanResultModal } from './components/ScanResultModal';
import { QRCodeDisplayModal } from './components/QRCodeDisplayModal';
import { OperatorModal } from './components/OperatorModal';
import { HomeTab } from './components/HomeTab';
import { InventoryTab } from './components/InventoryTab';
import { HistoryTab } from './components/HistoryTab';
import { NewProductTab } from './components/NewProductTab';
import { AIAssistantTab } from './components/AIAssistantTab';
import { DashboardTab } from './components/DashboardTab';
import { SplashScreen } from './components/Logo';
import confetti from 'canvas-confetti';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [products, setProducts] = useState<Product[]>(getStoredProducts);
  const [movements, setMovements] = useState<Movement[]>(getStoredMovements);
  const [operator, setOperator] = useState<Operator>(() => getStoredOperator() || DEFAULT_OPERATOR);
  const [isOperatorModalOpen, setIsOperatorModalOpen] = useState(false);
  const [isFirstOperatorSetup, setIsFirstOperatorSetup] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Modals state
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [selectedProductForScan, setSelectedProductForScan] = useState<Product | null>(null);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [selectedProductForQR, setSelectedProductForQR] = useState<Product | null>(null);

  // Sync to storage on change
  useEffect(() => {
    saveProducts(products);
  }, [products]);

  useEffect(() => {
    saveMovements(movements);
  }, [movements]);

  // Toast Helper
  const showToast = (message: string, type: Toast['type'] = 'info', title?: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type, title }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Operator Handlers
  const handleSaveOperator = (newOperator: Operator) => {
    setOperator(newOperator);
    saveStoredOperator(newOperator);
    setIsOperatorModalOpen(false);
    setIsFirstOperatorSetup(false);
    showToast(
      `Operador "${newOperator.name}" autenticado como ${newOperator.role || 'Operador'}!`,
      'success',
      'Identificação Ativa'
    );
  };

  const handleFinishSplash = () => {
    setShowSplash(false);
    // If no operator configured yet in localStorage, show welcoming identification prompt
    const saved = getStoredOperator();
    if (!saved) {
      setIsFirstOperatorSetup(true);
      setIsOperatorModalOpen(true);
    }
  };

  // Handle QR Scan Callback
  const handleScanSuccess = (code: string) => {
    setIsScannerOpen(false);
    setScannedCode(code);

    // Find product matching code
    const found = products.find(
      (p) => p.code.toLowerCase() === code.trim().toLowerCase()
    );

    setSelectedProductForScan(found || null);
    setIsScanModalOpen(true);

    if (found) {
      showToast(`Produto "${found.name}" identificado!`, 'success');
    } else {
      showToast(`Nenhum produto cadastrado com código ${code}`, 'warning');
    }
  };

  // Handle Inventory Movement Confirmation (ENTRADA / SAÍDA)
  const handleConfirmMovement = (
    productId: string,
    type: MovementType,
    quantity: number,
    note?: string
  ) => {
    const targetProduct = products.find((p) => p.id === productId);
    if (!targetProduct) return;

    if (type === 'SAIDA' && quantity > targetProduct.currentStock) {
      showToast(
        `Estoque insuficiente! Atual: ${targetProduct.currentStock} ${targetProduct.unit}. Não é permitido estoque negativo.`,
        'error',
        'Operação Bloqueada'
      );
      return;
    }

    const previousStock = targetProduct.currentStock;
    const finalStock =
      type === 'ENTRADA' ? previousStock + quantity : previousStock - quantity;

    // Update Product Stock
    const updatedProducts = products.map((p) => {
      if (p.id === productId) {
        return {
          ...p,
          currentStock: finalStock,
          updatedAt: new Date().toISOString(),
        };
      }
      return p;
    });

    // Register Movement Log with active Operator
    const newMovement: Movement = {
      id: 'mov-' + Date.now(),
      productId: targetProduct.id,
      productName: targetProduct.name,
      productCode: targetProduct.code,
      type,
      quantity,
      previousStock,
      finalStock,
      timestamp: new Date().toISOString(),
      note,
      operator: operator.name || 'Renan',
    };

    setProducts(updatedProducts);
    setMovements((prev) => [newMovement, ...prev]);
    setIsScanModalOpen(false);

    showToast(
      `Movimentação registrada por ${operator.name}! Novo estoque: ${finalStock} ${targetProduct.unit}.`,
      'success',
      type === 'ENTRADA' ? 'Entrada Efetuada (+)' : 'Saída Efetuada (-)'
    );
  };

  // Add New Product
  const handleAddProduct = (
    newProductData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    const newId = 'prod-' + Date.now();
    const newProduct: Product = {
      ...newProductData,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProducts((prev) => [newProduct, ...prev]);

    // If initial stock > 0, record initial entry movement
    if (newProduct.currentStock > 0) {
      const initialMovement: Movement = {
        id: 'mov-' + Date.now(),
        productId: newId,
        productName: newProduct.name,
        productCode: newProduct.code,
        type: 'ENTRADA',
        quantity: newProduct.currentStock,
        previousStock: 0,
        finalStock: newProduct.currentStock,
        timestamp: new Date().toISOString(),
        note: 'Estoque Inicial de Cadastro',
        operator: operator.name || 'Renan',
      };
      setMovements((prev) => [initialMovement, ...prev]);
    }

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
    });

    showToast(
      `Produto "${newProduct.name}" cadastrado com sucesso! QR Code gerado: ${newProduct.code}`,
      'success',
      'Cadastro Concluído'
    );

    // Switch to inventory tab
    setActiveTab('inventory');
  };

  // Delete Product
  const handleDeleteProduct = (productId: string) => {
    const target = products.find((p) => p.id === productId);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    if (target) {
      showToast(`Produto "${target.name}" foi removido do estoque.`, 'info');
    }
  };

  // Reset Demo Data
  const handleResetData = () => {
    resetToDemoData();
    setProducts(getStoredProducts());
    setMovements(getStoredMovements());
    showToast('Dados demonstrativos restaurados com sucesso!', 'success');
  };

  // Count low stock for badges
  const lowStockCount = products.filter(
    (p) => p.currentStock <= p.minStock
  ).length;

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center selection:bg-red-500 selection:text-white">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Smartphone Container Shell for Ultra Clean Presentation */}
      <div className="w-full max-w-md bg-slate-50 min-h-screen flex flex-col shadow-2xl relative border-x border-slate-200">
        {/* App Top Header */}
        <Header
          onOpenScanner={() => setIsScannerOpen(true)}
          onResetData={handleResetData}
          totalProducts={products.length}
          operator={operator}
          onSwitchOperator={() => {
            setIsFirstOperatorSetup(false);
            setIsOperatorModalOpen(true);
          }}
        />

        {/* Tab View Content */}
        <main className="flex-1 px-4 pt-2">
          {activeTab === 'home' && (
            <HomeTab
              products={products}
              movements={movements}
              onOpenScanner={() => setIsScannerOpen(true)}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onSelectProduct={(product) => {
                setSelectedProductForScan(product);
                setIsScanModalOpen(true);
              }}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryTab
              products={products}
              movements={movements}
              onSelectProduct={(product) => {
                setSelectedProductForScan(product);
                setIsScanModalOpen(true);
              }}
              onViewQRCode={(product) => setSelectedProductForQR(product)}
              onDeleteProduct={handleDeleteProduct}
              onNavigateToNewProduct={() => setActiveTab('new_product')}
            />
          )}

          {activeTab === 'dashboard' && (
            <DashboardTab products={products} movements={movements} />
          )}

          {activeTab === 'ai' && (
            <AIAssistantTab products={products} movements={movements} />
          )}

          {activeTab === 'history' && <HistoryTab movements={movements} />}

          {activeTab === 'new_product' && (
            <NewProductTab
              onAddProduct={handleAddProduct}
              existingProducts={products}
            />
          )}
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNav
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
          lowStockCount={lowStockCount}
        />

        {/* Camera QR Scanner Modal */}
        <QRScannerModal
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onScanSuccess={handleScanSuccess}
          products={products}
        />

        {/* Scanned Result / Movement Action Modal */}
        <ScanResultModal
          isOpen={isScanModalOpen}
          product={selectedProductForScan}
          scannedCode={scannedCode}
          onClose={() => setIsScanModalOpen(false)}
          onConfirmMovement={handleConfirmMovement}
          onRegisterNewWithCode={() => setActiveTab('new_product')}
          onViewQRCode={(p) => setSelectedProductForQR(p)}
          operatorName={operator.name}
        />

        {/* Printable/Downloadable QR Code Modal */}
        <QRCodeDisplayModal
          isOpen={!!selectedProductForQR}
          product={selectedProductForQR}
          onClose={() => setSelectedProductForQR(null)}
        />

        {/* Operator Identification & Profile Switcher Modal */}
        <OperatorModal
          isOpen={isOperatorModalOpen}
          currentOperator={operator}
          onSaveOperator={handleSaveOperator}
          onClose={() => setIsOperatorModalOpen(false)}
          isFirstSetup={isFirstOperatorSetup}
        />

        {/* Initial App Splash Screen */}
        {showSplash && <SplashScreen onFinish={handleFinishSplash} />}
      </div>
    </div>
  );
}
