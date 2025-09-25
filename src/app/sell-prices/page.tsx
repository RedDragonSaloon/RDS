"use client";

import { useState, useEffect, useMemo } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { staticData } from "@/lib/static-data";
import {
  Search,
  Filter,
  Download,
  Package,
  DollarSign,
  TrendingUp,
  Star,
  Gift,
  ShoppingBag
} from "lucide-react";

// Mock user - in real app this would come from auth
const mockUser = { name: "Admin", role: "ADMIN" };

interface SellPrice {
  id: string;
  itemId: string;
  unit: string;
  sellPrice: number;
  effectiveFrom: string;
  effectiveTo?: string;
  notes?: string;
  item: {
    name: string;
    category: string;
    buyPrice: number;
  };
}

interface PackageItem {
  id: string;
  packageId: string;
  sourceType: 'ITEM' | 'RECIPE';
  sourceId: string;
  quantity: number;
}

interface Package {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  bundleSellPrice: number;
  items: PackageItem[];
}

export default function SellPricesPage() {
  const [sellPrices, setSellPrices] = useState<SellPrice[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("singles");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [sellPricesData, packagesData, itemsData] = await Promise.all([
          staticData.getSellPrices(),
          staticData.getPackages(),
          staticData.getItems()
        ]);

        if (sellPricesData) setSellPrices(sellPricesData);
        if (packagesData) setPackages(packagesData);
        if (itemsData) setItems(itemsData);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const categories = useMemo(() => {
    return Array.from(new Set(sellPrices.map(sp => sp.item.category))).sort();
  }, [sellPrices]);

  const filteredSellPrices = useMemo(() => {
    return sellPrices.filter(sellPrice => {
      const matchesSearch = sellPrice.item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          sellPrice.item.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || sellPrice.item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [sellPrices, searchTerm, selectedCategory]);

  const filteredPackages = useMemo(() => {
    return packages.filter(pkg => {
      return pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             (pkg.description && pkg.description.toLowerCase().includes(searchTerm.toLowerCase()));
    });
  }, [packages, searchTerm]);

  const calculateMargin = (sellPrice: number, buyPrice: number) => {
    if (buyPrice === 0) return 0;
    return ((sellPrice - buyPrice) / sellPrice) * 100;
  };

  const exportToCsv = () => {
    let csvContent = "";
    let filename = "";

    if (activeTab === "singles") {
      const headers = ["Item", "Category", "Unit", "Sell Price", "Buy Price", "Margin %"];
      csvContent = [
        headers.join(","),
        ...filteredSellPrices.map(sp => [
          `"${sp.item.name}"`,
          `"${sp.item.category}"`,
          `"${sp.unit}"`,
          sp.sellPrice.toFixed(2),
          sp.item.buyPrice.toFixed(2),
          calculateMargin(sp.sellPrice, sp.item.buyPrice).toFixed(1)
        ].join(","))
      ].join("\\n");
      filename = "sell-prices.csv";
    } else {
      const headers = ["Package", "Description", "Bundle Price", "Items Count"];
      csvContent = [
        headers.join(","),
        ...filteredPackages.map(pkg => [
          `"${pkg.name}"`,
          `"${pkg.description || ''}"`,
          pkg.bundleSellPrice.toFixed(2),
          pkg.items.length.toString()
        ].join(","))
      ].join("\\n");
      filename = "packages.csv";
    }

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
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

  const avgMargin = sellPrices.length > 0
    ? sellPrices.reduce((sum, sp) => sum + calculateMargin(sp.sellPrice, sp.item.buyPrice), 0) / sellPrices.length
    : 0;

  return (
    <MainLayout user={mockUser}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold font-serif flex items-center gap-3">
              <Package className="h-8 w-8 text-primary" />
              Sell Prices & Packages
            </h1>
            <p className="text-muted-foreground mt-2">
              Customer pricing and special package deals
            </p>
          </div>
          <Button onClick={exportToCsv} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sellPrices.length}</div>
              <p className="text-xs text-muted-foreground">
                Items with sell prices
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Packages</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{packages.length}</div>
              <p className="text-xs text-muted-foreground">
                Active package deals
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Margin</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgMargin.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Profit margin
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${sellPrices.reduce((sum, sp) => sum + sp.sellPrice, 0).toFixed(0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Potential per unit
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search items, packages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="singles">Individual Items</TabsTrigger>
            <TabsTrigger value="packages">Package Deals</TabsTrigger>
          </TabsList>

          <TabsContent value="singles">
            <Card>
              <CardHeader>
                <CardTitle>Individual Item Prices ({filteredSellPrices.length})</CardTitle>
                <CardDescription>
                  Current retail pricing for individual items
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead className="text-right">Sell Price</TableHead>
                        {(mockUser?.role === "ADMIN" || mockUser?.role === "MANAGER") && (
                          <TableHead className="text-right">Buy Price</TableHead>
                        )}
                        <TableHead className="text-right">Margin</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSellPrices.map((sellPrice) => {
                        const margin = calculateMargin(sellPrice.sellPrice, sellPrice.item.buyPrice);
                        return (
                          <TableRow key={sellPrice.id}>
                            <TableCell className="font-medium">{sellPrice.item.name}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{sellPrice.item.category}</Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{sellPrice.unit}</TableCell>
                            <TableCell className="text-right">
                              <span className="font-mono font-semibold">
                                ${sellPrice.sellPrice.toFixed(2)}
                              </span>
                            </TableCell>
                            {(mockUser?.role === "ADMIN" || mockUser?.role === "MANAGER") && (
                              <TableCell className="text-right text-muted-foreground">
                                <span className="font-mono">
                                  ${sellPrice.item.buyPrice.toFixed(2)}
                                </span>
                              </TableCell>
                            )}
                            <TableCell className="text-right">
                              <Badge
                                variant={margin >= 50 ? "default" : margin >= 25 ? "secondary" : "outline"}
                              >
                                {margin.toFixed(1)}%
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="packages">
            <div className="space-y-6">
              {/* Featured Packages */}
              <Card className="western-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-gold" />
                    Featured Specials
                  </CardTitle>
                  <CardDescription>
                    Our most popular package deals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPackages.slice(0, 3).map((pkg) => (
                      <div key={pkg.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold">{pkg.name}</h4>
                          <Badge variant="accent">${pkg.bundleSellPrice.toFixed(2)}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {pkg.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Package className="h-3 w-3" />
                          {pkg.items.length} items included
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* All Packages Table */}
              <Card>
                <CardHeader>
                  <CardTitle>All Package Deals ({filteredPackages.length})</CardTitle>
                  <CardDescription>
                    Complete list of available package offerings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Package Name</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-center">Items</TableHead>
                          <TableHead className="text-right">Bundle Price</TableHead>
                          {(mockUser?.role === "ADMIN" || mockUser?.role === "MANAGER") && (
                            <TableHead className="text-right">Est. Cost</TableHead>
                          )}
                          {(mockUser?.role === "ADMIN" || mockUser?.role === "MANAGER") && (
                            <TableHead className="text-right">Margin</TableHead>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPackages.map((pkg) => {
                          const estimatedCost = 15; // Simplified - in real app would calculate from items
                          const margin = calculateMargin(pkg.bundleSellPrice, estimatedCost);

                          return (
                            <TableRow key={pkg.id}>
                              <TableCell className="font-medium">{pkg.name}</TableCell>
                              <TableCell className="max-w-xs">
                                <div className="truncate text-muted-foreground">
                                  {pkg.description || "—"}
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant="outline">{pkg.items.length}</Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <span className="font-mono font-semibold">
                                  ${pkg.bundleSellPrice.toFixed(2)}
                                </span>
                              </TableCell>
                              {(mockUser?.role === "ADMIN" || mockUser?.role === "MANAGER") && (
                                <TableCell className="text-right text-muted-foreground">
                                  <span className="font-mono">
                                    ~${estimatedCost.toFixed(2)}
                                  </span>
                                </TableCell>
                              )}
                              {(mockUser?.role === "ADMIN" || mockUser?.role === "MANAGER") && (
                                <TableCell className="text-right">
                                  <Badge
                                    variant={margin >= 50 ? "default" : margin >= 25 ? "secondary" : "outline"}
                                  >
                                    {margin.toFixed(1)}%
                                  </Badge>
                                </TableCell>
                              )}
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}