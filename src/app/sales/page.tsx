"use client";

import { useState, useEffect, useMemo } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { staticData } from "@/lib/static-data";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  DollarSign,
  Clock,
  User,
  Package,
  ChefHat,
  Calculator,
  Check,
  RefreshCw,
  History,
  TrendingUp,
  Coffee,
  Repeat
} from "lucide-react";

// Mock user - in real app this would come from auth
const mockUser = {
  id: "user1",
  name: "Jake Miller",
  role: "STAFF",
  commissionRule: {
    type: "FLAT_PER_SALE",
    params: { amount: 5 }
  }
};

interface SaleItem {
  id: string;
  type: 'item' | 'package' | 'recipe';
  sourceId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  estimatedCost: number;
}

interface Sale {
  id: string;
  datetime: string;
  customer?: string;
  total: number;
  profit: number;
  commission: number;
  paymentType: string;
  itemCount: number;
}

export default function SalesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [salesHistory, setSalesHistory] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  // Sale form state
  const [currentSale, setCurrentSale] = useState<SaleItem[]>([]);
  const [customer, setCustomer] = useState("");
  const [paymentType, setPaymentType] = useState("CASH");
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState("");
  const [activeTab, setActiveTab] = useState("new-sale");

  // Quick add states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [itemsData, recipesData, packagesData, salesData] = await Promise.all([
          staticData.getItems(),
          staticData.getRecipes(),
          staticData.getPackages(),
          staticData.getSales()
        ]);

        if (itemsData) setItems(itemsData);
        if (recipesData) setRecipes(recipesData);
        if (packagesData) setPackages(packagesData);

        // Filter sales for current user
        if (salesData) {
          const userSales = salesData
            .filter((sale: any) => sale.userId === mockUser.id)
            .map((sale: any) => ({
              id: sale.id,
              datetime: sale.datetime,
              customer: sale.customer,
              total: sale.total,
              profit: sale.profit,
              commission: sale.commission,
              paymentType: sale.paymentType,
              itemCount: sale.lines.length
            }))
            .sort((a: any, b: any) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime())
            .slice(0, 20); // Last 20 sales

          setSalesHistory(userSales);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const allProducts = useMemo(() => {
    const productList = [
      ...items.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        type: 'item' as const,
        price: staticData.getCurrentSellPrice(item),
        cost: item.buyPrice
      })),
      ...recipes.map(recipe => ({
        id: recipe.id,
        name: recipe.name,
        category: recipe.category,
        type: 'recipe' as const,
        price: recipe.suggestedSellPrice,
        cost: recipe.calculatedCost
      })),
      ...packages.map(pkg => ({
        id: pkg.id,
        name: pkg.name,
        category: "Package",
        type: 'package' as const,
        price: pkg.bundleSellPrice,
        cost: 15 // Simplified cost estimate
      }))
    ];

    return productList.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [items, recipes, packages, searchTerm, selectedCategory]);

  const categories = useMemo(() => {
    return Array.from(new Set(allProducts.map(p => p.category))).sort();
  }, [allProducts]);

  const saleCalculations = useMemo(() => {
    const subtotal = currentSale.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const total = subtotal - discount;
    const cost = currentSale.reduce((sum, item) => sum + (item.estimatedCost * item.quantity), 0);
    const profit = total - cost;

    // Calculate commission based on user's rule
    let commission = 0;
    if (mockUser.commissionRule.type === "FLAT_PER_SALE" && currentSale.length > 0) {
      commission = mockUser.commissionRule.params.amount;
    } else if (mockUser.commissionRule.type === "PERCENT_OF_PROFIT") {
      commission = (profit * mockUser.commissionRule.params.percentage) / 100;
    }

    return {
      subtotal,
      total: Math.max(0, total),
      cost,
      profit,
      commission: Math.max(0, commission),
      margin: subtotal > 0 ? (profit / subtotal) * 100 : 0
    };
  }, [currentSale, discount]);

  const addToSale = (product: any) => {
    const existingIndex = currentSale.findIndex(item =>
      item.sourceId === product.id && item.type === product.type
    );

    if (existingIndex >= 0) {
      updateQuantity(existingIndex, currentSale[existingIndex].quantity + 1);
    } else {
      const newItem: SaleItem = {
        id: `${Date.now()}-${Math.random()}`,
        type: product.type,
        sourceId: product.id,
        name: product.name,
        unitPrice: product.price,
        quantity: 1,
        estimatedCost: product.cost
      };
      setCurrentSale([...currentSale, newItem]);
    }
  };

  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromSale(index);
      return;
    }

    const updated = [...currentSale];
    updated[index].quantity = newQuantity;
    setCurrentSale(updated);
  };

  const updatePrice = (index: number, newPrice: number) => {
    const updated = [...currentSale];
    updated[index].unitPrice = Math.max(0, newPrice);
    setCurrentSale(updated);
  };

  const removeFromSale = (index: number) => {
    setCurrentSale(currentSale.filter((_, i) => i !== index));
  };

  const clearSale = () => {
    setCurrentSale([]);
    setCustomer("");
    setDiscount(0);
    setNotes("");
  };

  const completeSale = () => {
    if (currentSale.length === 0) {
      alert("Please add items to the sale");
      return;
    }

    // In a real app, this would make an API call
    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      datetime: new Date().toISOString(),
      customer: customer || undefined,
      total: saleCalculations.total,
      profit: saleCalculations.profit,
      commission: saleCalculations.commission,
      paymentType,
      itemCount: currentSale.length
    };

    setSalesHistory([newSale, ...salesHistory]);

    // Show success message
    alert(`Sale completed! Commission earned: $${saleCalculations.commission.toFixed(2)}`);

    // Clear the current sale
    clearSale();
  };

  const repeatLastOrder = () => {
    if (salesHistory.length === 0) return;

    // This is simplified - in a real app you'd fetch the actual line items
    alert("Feature would repeat the last order");
  };

  if (loading) {
    return (
      <MainLayout user={mockUser}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout user={mockUser}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-serif flex items-center gap-2">
              <ShoppingCart className="h-6 w-6 text-primary" />
              Sales Terminal
            </h1>
            <p className="text-sm text-muted-foreground">
              Welcome back, {mockUser.name}
            </p>
          </div>
          <Button variant="outline" onClick={repeatLastOrder} disabled={salesHistory.length === 0}>
            <Repeat className="h-4 w-4 mr-1" />
            Repeat Last
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="new-sale">New Sale</TabsTrigger>
            <TabsTrigger value="history">My Sales</TabsTrigger>
          </TabsList>

          <TabsContent value="new-sale" className="space-y-6">
            {/* Current Sale Summary - Mobile Optimized */}
            <Card className="western-border">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Current Sale
                  </span>
                  {currentSale.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearSale}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentSale.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Coffee className="h-8 w-8 mx-auto mb-2" />
                    <p>No items added yet</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      {currentSale.map((item, index) => (
                        <div key={item.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{item.name}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center border rounded">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => updateQuantity(index, item.quantity - 1)}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <Input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => updateQuantity(index, parseInt(e.target.value) || 0)}
                                  className="w-12 h-6 text-center border-0 text-xs"
                                  min="1"
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => updateQuantity(index, item.quantity + 1)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                              <span className="text-xs">×</span>
                              <Input
                                type="number"
                                value={item.unitPrice.toFixed(2)}
                                onChange={(e) => updatePrice(index, parseFloat(e.target.value) || 0)}
                                className="w-16 h-6 text-xs"
                                step="0.01"
                              />
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-sm">
                              ${(item.unitPrice * item.quantity).toFixed(2)}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-destructive"
                              onClick={() => removeFromSale(index)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Sale Details */}
                    <div className="space-y-3 pt-3 border-t">
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Customer name (optional)"
                          value={customer}
                          onChange={(e) => setCustomer(e.target.value)}
                          className="text-sm"
                        />
                        <Select value={paymentType} onChange={(e) => setPaymentType(e.target.value)}>
                          <option value="CASH">Cash</option>
                          <option value="LEDGER">Ledger/Tab</option>
                          <option value="OTHER">Other</option>
                        </Select>
                      </div>

                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Discount ($)"
                          value={discount || ""}
                          onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                          className="text-sm"
                          step="0.01"
                        />
                        <Textarea
                          placeholder="Notes (optional)"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="text-sm min-h-[60px]"
                        />
                      </div>

                      {/* Totals */}
                      <div className="bg-background p-3 rounded border space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Subtotal:</span>
                          <span>${saleCalculations.subtotal.toFixed(2)}</span>
                        </div>
                        {discount > 0 && (
                          <div className="flex justify-between text-sm text-destructive">
                            <span>Discount:</span>
                            <span>-${discount.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-semibold border-t pt-1">
                          <span>Total:</span>
                          <span>${saleCalculations.total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Your Commission:</span>
                          <span className="text-green-600 font-medium">
                            +${saleCalculations.commission.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <Button
                        onClick={completeSale}
                        className="w-full"
                        size="lg"
                        disabled={currentSale.length === 0}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Complete Sale
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Product Selection - Mobile Optimized */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Add Items</CardTitle>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <Select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">All</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
                  {allProducts.slice(0, 20).map((product) => (
                    <div
                      key={`${product.type}-${product.id}`}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <div className="font-medium text-sm">{product.name}</div>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {product.category}
                          </Badge>
                          {product.type === 'recipe' && (
                            <Badge variant="secondary" className="text-xs">
                              <ChefHat className="h-3 w-3 mr-1" />
                              Recipe
                            </Badge>
                          )}
                          {product.type === 'package' && (
                            <Badge variant="accent" className="text-xs">
                              <Package className="h-3 w-3 mr-1" />
                              Package
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-sm mb-1">
                          ${product.price.toFixed(2)}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => addToSale(product)}
                          className="h-8"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            {/* Today's Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">
                    {salesHistory.filter(s =>
                      new Date(s.datetime).toDateString() === new Date().toDateString()
                    ).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Today's Sales</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">
                    ${salesHistory
                      .filter(s => new Date(s.datetime).toDateString() === new Date().toDateString())
                      .reduce((sum, s) => sum + s.total, 0)
                      .toFixed(0)
                    }
                  </div>
                  <div className="text-sm text-muted-foreground">Today's Revenue</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">
                    ${salesHistory
                      .filter(s => new Date(s.datetime).toDateString() === new Date().toDateString())
                      .reduce((sum, s) => sum + s.commission, 0)
                      .toFixed(0)
                    }
                  </div>
                  <div className="text-sm text-muted-foreground">Today's Commission</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">{salesHistory.length}</div>
                  <div className="text-sm text-muted-foreground">Total Sales</div>
                </CardContent>
              </Card>
            </div>

            {/* Sales History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Recent Sales
                </CardTitle>
                <CardDescription>Your last 20 transactions</CardDescription>
              </CardHeader>
              <CardContent>
                {salesHistory.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="h-8 w-8 mx-auto mb-2" />
                    <p>No sales yet today</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {salesHistory.map((sale) => (
                      <div key={sale.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium text-sm">
                            {sale.customer || "Anonymous Customer"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(sale.datetime).toLocaleString()} • {sale.itemCount} items
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-sm">${sale.total.toFixed(2)}</div>
                          <div className="text-xs text-green-600">
                            +${sale.commission.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}