"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import {
  ShoppingCart,
  Plus,
  DollarSign,
  User,
  Package,
  Calendar,
  CheckCircle
} from "lucide-react";

interface Sale {
  id: string;
  staffName: string;
  customerName: string;
  items: string;
  total: number;
  date: string;
  notes?: string;
}

export default function SalesEntryPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [staffName, setStaffName] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [items, setItems] = useState("");
  const [total, setTotal] = useState("");
  const [notes, setNotes] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!staffName || !customerName || !items || !total) {
      alert("Please fill in all required fields");
      return;
    }

    const newSale: Sale = {
      id: Date.now().toString(),
      staffName,
      customerName,
      items,
      total: parseFloat(total),
      date: new Date().toISOString(),
      notes: notes || undefined
    };

    setSales([newSale, ...sales]);

    // Clear form
    setStaffName("");
    setCustomerName("");
    setItems("");
    setTotal("");
    setNotes("");

    // Show success message
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const todaysTotal = sales
    .filter(sale => {
      const today = new Date().toDateString();
      const saleDate = new Date(sale.date).toDateString();
      return today === saleDate;
    })
    .reduce((sum, sale) => sum + sale.total, 0);

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold font-serif flex items-center gap-3">
              <ShoppingCart className="h-8 w-8 text-primary" />
              Sales Entry System
            </h1>
            <p className="text-muted-foreground mt-2">
              Record sales transactions - anyone can enter their sales here
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Today's Total</p>
                  <p className="text-xl font-bold">${todaysTotal.toFixed(2)}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <Card className="card-welsh-green">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-white">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Sale recorded successfully!</span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sales Entry Form */}
          <Card className="dragon-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Record New Sale
              </CardTitle>
              <CardDescription>
                Enter the details of your sale transaction
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Staff Member Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Enter your name"
                      value={staffName}
                      onChange={(e) => setStaffName(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Customer Name *
                  </label>
                  <Input
                    type="text"
                    placeholder="Customer's name or description"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Items Sold *
                  </label>
                  <div className="relative">
                    <Package className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      placeholder="List items sold (e.g., 2x Whiskey, 1x Poker Pack, etc.)"
                      value={items}
                      onChange={(e) => setItems(e.target.value)}
                      className="pl-10 min-h-[80px]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Total Amount *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={total}
                      onChange={(e) => setTotal(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Notes (Optional)
                  </label>
                  <Textarea
                    placeholder="Any additional notes about this sale..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[60px]"
                  />
                </div>

                <Button type="submit" className="w-full" size="lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Record Sale
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Recent Sales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Sales
              </CardTitle>
              <CardDescription>
                Latest sales transactions ({sales.length} total)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {sales.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No sales recorded yet</p>
                    <p className="text-sm">Use the form to record your first sale!</p>
                  </div>
                ) : (
                  sales.map((sale) => (
                    <div key={sale.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{sale.staffName}</h4>
                          <p className="text-sm text-muted-foreground">
                            Customer: {sale.customerName}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">
                            ${sale.total.toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(sale.date).toLocaleDateString()} at{" "}
                            {new Date(sale.date).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm">
                          <strong>Items:</strong> {sale.items}
                        </p>
                        {sale.notes && (
                          <p className="text-sm text-muted-foreground mt-1">
                            <strong>Notes:</strong> {sale.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}