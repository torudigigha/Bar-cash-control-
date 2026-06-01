import React, { useState, useMemo } from "react";
import { useData } from "../../context";
import { formatCurrency } from "../../utils";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Button } from "../ui/Button";
import {
  Plus,
  Minus,
  Trash2,
  ReceiptText,
  QrCode,
  CheckCircle2,
  Printer,
  Share2,
  X,
  Search,
} from "lucide-react";
import { PaymentMethod, SaleType, Drink, DrinkCategory } from "../../types";

export function SalesView() {
  const { drinks, addSale, updateDrinkStock, activeStaff } = useData();
  const [selectedDrinks, setSelectedDrinks] = useState<
    { drink: Drink; quantity: number }[]
  >([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("POS");
  const [saleType, setSaleType] = useState<SaleType>("Table Order");
  const [activeReceipt, setActiveReceipt] = useState<any | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<DrinkCategory | "All">(
    "All",
  );

  const paymentMethods: PaymentMethod[] = ["Cash", "POS", "Bank Transfer"];
  const saleTypes: SaleType[] = [
    "Table Order",
    "Bottle Sale",
    "Bulk Sale",
    "VIP Lounge",
  ];
  const categories: (DrinkCategory | "All")[] = [
    "All",
    "Beer",
    "Spirits & Bitters",
    "Wine",
    "Non-Alcoholic",
    "Water & Mixers",
  ];

  const filteredDrinks = useMemo(() => {
    return drinks.filter((drink) => {
      const matchesSearch = drink.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        filterCategory === "All" || drink.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [drinks, searchTerm, filterCategory]);

  const addToCart = (drink: Drink) => {
    setSelectedDrinks((prev) => {
      const existing = prev.find((p) => p.drink.id === drink.id);
      if (existing) {
        return prev.map((p) =>
          p.drink.id === drink.id ? { ...p, quantity: p.quantity + 1 } : p,
        );
      }
      return [...prev, { drink, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setSelectedDrinks((prev) => {
      const updated = prev.map((p) => {
        if (p.drink.id === id) {
          return { ...p, quantity: p.quantity + delta };
        }
        return p;
      });
      return updated.filter((p) => p.quantity > 0);
    });
  };

  const removeItem = (id: string) => {
    setSelectedDrinks((prev) => prev.filter((p) => p.drink.id !== id));
  };

  const totalAmount = selectedDrinks.reduce(
    (sum, item) => sum + item.drink.price * item.quantity,
    0,
  );

  const handleCompleteSale = () => {
    if (selectedDrinks.length === 0) return;

    const saleId = `SA-${Math.floor(Math.random() * 900000 + 100000)}`;
    const saleData = {
      id: saleId,
      date: new Date().toISOString(),
      items: selectedDrinks.map((item) => ({
        drinkId: item.drink.id,
        quantity: item.quantity,
        price: item.drink.price,
        name: item.drink.name,
      })),
      totalAmount,
      paymentMethod,
      saleType,
      staffName: activeStaff,
    };

    // Create sale record
    addSale(saleData);

    // Deduct inventory
    selectedDrinks.forEach((item) => {
      updateDrinkStock(item.drink.id, item.quantity);
    });

    // Cache receipt details to show in modal
    setActiveReceipt(saleData);

    // Reset cart
    setSelectedDrinks([]);
  };

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 lg:h-[calc(100vh-8rem)] relative">
      {/* Drink Selection */}
      <div className="lg:col-span-2 flex flex-col space-y-4">
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 text-xs sm:text-sm text-gray-300 lg:hidden space-y-2 mb-2">
          <p><strong className="text-white">Select Drinks:</strong> Tap on any drink in the matrix to add it to your "Current Order". You can increase or decrease the quantity for each drink directly in the cart area on the right.</p>
          <p><strong className="text-white">Select Options:</strong> Choose the Sale Type (e.g., Table Order or Bottle Sale) and the Payment Method (e.g., POS, Cash, Bank Transfer) in the cart panel.</p>
          <p><strong className="text-white">Complete the Order:</strong> Click the large Complete Sale button to finalize. This will automatically generate a receipt, update your total daily revenues, and deduct appropriately from your stock inventory.</p>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl font-display font-semibold text-white">
            Select Drinks
          </h2>
          <div className="relative flex-1 max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search drinks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-bar-900 border border-bar-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-none custom-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filterCategory === cat
                  ? "bg-gold-500 text-bar-950 border border-gold-500"
                  : "bg-bar-800 text-gray-300 border border-bar-700 hover:bg-bar-700 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 overflow-y-auto pb-6 pr-2 custom-scrollbar flex-1">
          {filteredDrinks.length === 0 ? (
            <div className="col-span-full pt-10 text-center text-gray-500 text-sm">
              No drinks found matching '{searchTerm}'.
            </div>
          ) : (
            filteredDrinks.map((drink) => {
              const cartItem = selectedDrinks.find(
                (p) => p.drink.id === drink.id,
              );
              const quantityInCart = cartItem ? cartItem.quantity : 0;
              return (
                <button
                  key={drink.id}
                  onClick={() => addToCart(drink)}
                  disabled={drink.stock <= 0}
                  className={`text-left bg-bar-900 border p-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden ${
                    quantityInCart > 0
                      ? "border-gold-500/55 ring-1 ring-gold-500/30 bg-bar-800"
                      : "border-bar-800 hover:border-gold-500/50 hover:bg-bar-800/80"
                  }`}
                >
                  <div
                    className={`absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                      quantityInCart > 0
                        ? "bg-gold-500 text-bar-950 font-bold text-xs"
                        : "bg-gold-500/10 border border-gold-500/20 text-gold group-hover:bg-gold-500 group-hover:text-bar-950 active:scale-90"
                    }`}
                  >
                    {quantityInCart > 0 ? (
                      <span>{quantityInCart}</span>
                    ) : (
                      <Plus className="w-3.5 h-3.5 px-0" />
                    )}
                  </div>
                  <p className="font-medium text-white line-clamp-1 pr-6">
                    {drink.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-1 mb-3">
                    {drink.category}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="font-semibold text-gold-300">
                      {formatCurrency(drink.price)}
                    </span>
                    <span
                      className={`text-xs ${drink.stock <= drink.minimumStock ? "text-red-400" : "text-gray-500"}`}
                    >
                      {drink.stock} left
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Cart & Checkout */}
      <Card className="flex flex-col h-full bg-bar-900 border-bar-700">
        <CardHeader className="bg-bar-800/50 py-4">
          <CardTitle className="flex items-center gap-2 text-gold-300">
            <ReceiptText className="w-5 h-5" />
            Current Order
          </CardTitle>
        </CardHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {selectedDrinks.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500 text-sm">
              Tap drinks to add to order
            </div>
          ) : (
            selectedDrinks.map((item) => (
              <div
                key={item.drink.id}
                className="flex items-center justify-between bg-bar-950 p-3 rounded-lg border border-bar-800"
              >
                <div className="flex-1 min-w-0 pr-4">
                  <p className="text-sm font-medium text-white truncate">
                    {item.drink.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatCurrency(item.drink.price)} x {item.quantity}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.drink.id, -1)}
                    className="p-1 rounded-md bg-bar-800 text-gray-400 hover:text-white"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-6 text-center text-sm font-medium">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.drink.id, 1)}
                    className="p-1 rounded-md bg-bar-800 text-gray-400 hover:text-white"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeItem(item.drink.id)}
                    className="p-1 ml-2 rounded-md hover:bg-red-500/20 text-gray-500 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-bar-950 border-t border-bar-800 space-y-4">
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-400 mb-1 block">
                Sale Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {saleTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSaleType(type)}
                    className={`px-2 py-1.5 rounded-md text-xs font-medium transition-colors border ${
                      saleType === type
                        ? "bg-bar-800 border-gold-500/50 text-gold-300"
                        : "bg-transparent border-bar-800 text-gray-400 hover:border-bar-700"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-400 mb-1 block">
                Payment Method
              </label>
              <div className="flex gap-2">
                {paymentMethods.map((method) => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`flex-1 py-2 rounded-md text-xs font-medium transition-colors border ${
                      paymentMethod === method
                        ? "bg-gold-500 text-bar-950 border-gold-500"
                        : "bg-bar-800 border-bar-700 text-gray-300 hover:bg-bar-700"
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-bar-800 flex items-center justify-between">
            <span className="text-gray-400 font-medium">Total</span>
            <span className="text-2xl font-display font-bold text-white">
              {formatCurrency(totalAmount)}
            </span>
          </div>

          <Button
            className="w-full text-lg shadow-lg shadow-gold-500/20 border border-gold-400"
            size="lg"
            onClick={handleCompleteSale}
            disabled={selectedDrinks.length === 0}
          >
            Complete Sale
          </Button>
        </div>
      </Card>

      {/* QR Code / Receipt Overlay Modal */}
      {activeReceipt && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-bar-900 border border-gold-500/30 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative">
            <button
              onClick={() => setActiveReceipt(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-lg hover:bg-bar-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 text-center border-b border-bar-800">
              <div className="mx-auto w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-7 h-7 text-green-400" />
              </div>
              <h3 className="text-xl font-display font-bold text-white">
                Sale Completed Successfully
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Receipt Ref: {activeReceipt.id}
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-bar-950 rounded-xl p-4 border border-bar-800/80 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Payment Mode</span>
                  <span className="font-semibold text-white">
                    {activeReceipt.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Order Style</span>
                  <span className="font-semibold text-white">
                    {activeReceipt.saleType}
                  </span>
                </div>
                <div className="pt-2 border-t border-bar-800/80 flex justify-between text-sm">
                  <span className="text-gray-300 font-medium">
                    Total Received
                  </span>
                  <span className="font-bold text-gold-300">
                    {formatCurrency(activeReceipt.totalAmount)}
                  </span>
                </div>
              </div>

              {/* QR Receipt Generation */}
              <div className="flex flex-col items-center justify-center py-4 bg-white/5 rounded-xl border border-white/5">
                <div className="bg-white p-2.5 rounded-lg mb-2">
                  <QrCode className="w-28 h-28 text-black" />
                </div>
                <span className="label-caps !text-[9px]">
                  Scan to Generate QR Receipt
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex items-center gap-2 justify-center py-2 text-sm"
                  onClick={() => setActiveReceipt(null)}
                >
                  <Share2 className="w-4 h-4" /> Write-On
                </Button>
                <Button
                  className="flex items-center gap-2 justify-center py-2 text-sm"
                  onClick={() => {
                    alert("Receipt printed successfully!");
                    setActiveReceipt(null);
                  }}
                >
                  <Printer className="w-4 h-4" /> Print Instant
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
