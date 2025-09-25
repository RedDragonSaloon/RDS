"use client";

import { useState, useEffect, useMemo } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { staticData } from "@/lib/static-data";
import {
  LayoutDashboard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Users,
  Package,
  ChefHat,
  BarChart3,
  PieChart,
  Calendar,
  Clock,
  Target,
  Award,
  AlertTriangle,
  RefreshCw,
  Download,
  Edit,
  Save,
  Star
} from "lucide-react";

// Mock user - in real app this would come from auth
const mockUser = {
  id: "admin1",
  name: "Silas Blackwood",
  role: "ADMIN"
};

interface DashboardData {
  kpis: {
    today: {
      revenue: number;
      cost: number;
      profit: number;
      orders: number;
      avgMargin: number;
    };
    week: {
      revenue: number;
      cost: number;
      profit: number;
      orders: number;
      avgMargin: number;
    };
    month: {
      revenue: number;
      cost: number;
      profit: number;
      orders: number;
      avgMargin: number;
    };
  };
  topStaff: Array<{
    name: string;
    revenue: number;
    orders: number;
    commission: number;
  }>;
  topItems: Array<{
    name: string;
    category: string;
    totalSold: number;
    revenue: number;
  }>;
  hourlyData: Array<{
    hour: number;
    orders: number;
    revenue: number;
  }>;
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [noticeboard, setNoticeboard] = useState("");
  const [editingNoticeboard, setEditingNoticeboard] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<"today" | "week" | "month">("today");

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [salesData, usersData, itemsData, config] = await Promise.all([
          staticData.getSales(),
          staticData.getUsers(),
          staticData.getItems(),
          staticData.getConfig()
        ]);

        // Get noticeboard content
        if (config?.noticeboard) {
          setNoticeboard(config.noticeboard);
        }

        // Process sales data for KPIs
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay() + 1); // Monday
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const calculatePeriodKPIs = (startDate: Date) => {
          const periodSales = salesData?.filter((sale: any) =>
            new Date(sale.datetime) >= startDate
          ) || [];

          const revenue = periodSales.reduce((sum: number, sale: any) => sum + sale.total, 0);
          const cost = periodSales.reduce((sum: number, sale: any) => sum + sale.cost, 0);
          const profit = periodSales.reduce((sum: number, sale: any) => sum + sale.profit, 0);
          const orders = periodSales.length;
          const avgMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

          return { revenue, cost, profit, orders, avgMargin };
        };

        // Calculate staff performance
        const staffPerformance = usersData?.map((user: any) => {
          const userSales = salesData?.filter((sale: any) => sale.userId === user.id) || [];
          const revenue = userSales.reduce((sum: number, sale: any) => sum + sale.total, 0);
          const orders = userSales.length;
          const commission = userSales.reduce((sum: number, sale: any) => sum + sale.commission, 0);

          return {
            name: user.name,
            revenue,
            orders,
            commission
          };
        }).sort((a: any, b: any) => b.revenue - a.revenue).slice(0, 5) || [];

        // Calculate item performance (simplified)
        const topItems = itemsData?.map((item: any) => ({
          name: item.name,
          category: item.category,
          totalSold: Math.floor(Math.random() * 50) + 1,
          revenue: Math.floor(Math.random() * 1000) + 100
        })).sort((a: any, b: any) => b.revenue - a.revenue).slice(0, 5) || [];

        // Generate hourly data
        const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
          hour,
          orders: Math.floor(Math.random() * 20),
          revenue: Math.floor(Math.random() * 500)
        }));

        setDashboardData({
          kpis: {
            today: calculatePeriodKPIs(today),
            week: calculatePeriodKPIs(weekStart),
            month: calculatePeriodKPIs(monthStart)
          },
          topStaff: staffPerformance,
          topItems,
          hourlyData
        });

      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const currentKPIs = dashboardData?.kpis[selectedPeriod];

  const saveNoticeboard = () => {
    // In a real app, this would make an API call to save
    alert("Noticeboard updated successfully!");
    setEditingNoticeboard(false);
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
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold font-serif flex items-center gap-3">
              <LayoutDashboard className="h-8 w-8 text-primary" />
              Management Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Overview of saloon performance and operations
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value as any)}>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </Select>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${currentKPIs?.revenue.toFixed(0) || '0'}
              </div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12% vs last period
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profit</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${currentKPIs?.profit.toFixed(0) || '0'}
              </div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +8% vs last period
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentKPIs?.orders || 0}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                {currentKPIs?.orders && currentKPIs.orders > 0
                  ? `$${(currentKPIs.revenue / currentKPIs.orders).toFixed(2)} avg`
                  : "No orders yet"
                }
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Margin</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentKPIs?.avgMargin.toFixed(1) || '0'}%
              </div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                Target: 60%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">COGS</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${currentKPIs?.cost.toFixed(0) || '0'}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                {currentKPIs?.revenue && currentKPIs.revenue > 0
                  ? `${((currentKPIs.cost / currentKPIs.revenue) * 100).toFixed(1)}% of revenue`
                  : "0% of revenue"
                }
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="content">Content Management</TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="space-y-6">
            {/* Charts and Reports */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Staff Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Top Staff Performance
                  </CardTitle>
                  <CardDescription>Revenue leaders this period</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dashboardData?.topStaff.map((staff, index) => (
                      <div key={staff.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium text-sm">{staff.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {staff.orders} orders
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-sm">
                            ${staff.revenue.toFixed(0)}
                          </div>
                          <div className="text-xs text-green-600">
                            +${staff.commission.toFixed(0)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Top Selling Items
                  </CardTitle>
                  <CardDescription>Best performers by revenue</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dashboardData?.topItems.map((item, index) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-secondary text-secondary-foreground text-xs flex items-center justify-center">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium text-sm">{item.name}</div>
                            <div className="text-xs text-muted-foreground">
                              <Badge variant="outline" className="text-xs">
                                {item.category}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-sm">
                            ${item.revenue.toFixed(0)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {item.totalSold} sold
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Hourly Sales Pattern */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Sales by Hour of Day
                </CardTitle>
                <CardDescription>
                  Daily sales pattern to optimize staffing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {dashboardData?.hourlyData
                    .filter(data => data.orders > 0)
                    .sort((a, b) => b.revenue - a.revenue)
                    .slice(0, 8)
                    .map((data) => (
                      <div key={data.hour} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <div className="flex items-center gap-3">
                          <div className="text-sm font-medium w-16">
                            {data.hour.toString().padStart(2, '0')}:00
                          </div>
                          <div className="flex-1 bg-background rounded-full h-2 relative">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{
                                width: `${Math.min(100, (data.revenue / 500) * 100)}%`
                              }}
                            />
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <div className="font-semibold">${data.revenue}</div>
                          <div className="text-xs text-muted-foreground">
                            {data.orders} orders
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Alerts & Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Alerts & Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-sm">Low Margin Alert</div>
                      <div className="text-xs text-muted-foreground">
                        Some items are selling below 40% margin. Consider price adjustments.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <Star className="h-4 w-4 text-blue-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-sm">Peak Hour Optimization</div>
                      <div className="text-xs text-muted-foreground">
                        Consider adding staff during 7-9 PM for higher sales volume.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-green-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-sm">Strong Performance</div>
                      <div className="text-xs text-muted-foreground">
                        Dragon's Fire Cocktail is performing 25% above target!
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            {/* Noticeboard Management */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Edit className="h-5 w-5" />
                      Noticeboard Content
                    </CardTitle>
                    <CardDescription>
                      Manage the content displayed on the home page
                    </CardDescription>
                  </div>
                  {editingNoticeboard ? (
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setEditingNoticeboard(false)}>
                        Cancel
                      </Button>
                      <Button onClick={saveNoticeboard}>
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={() => setEditingNoticeboard(true)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {editingNoticeboard ? (
                  <Textarea
                    value={noticeboard}
                    onChange={(e) => setNoticeboard(e.target.value)}
                    rows={15}
                    className="font-mono text-sm"
                    placeholder="Enter markdown content for the noticeboard..."
                  />
                ) : (
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="whitespace-pre-line text-sm">
                      {noticeboard || "No content set"}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Export Data</CardTitle>
                  <CardDescription>Download reports and data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Sales Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Inventory Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Staff Commission
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                  <CardDescription>At a glance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Active Items:</span>
                      <span className="font-semibold">42</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Active Staff:</span>
                      <span className="font-semibold">6</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Package Deals:</span>
                      <span className="font-semibold">5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Recipes:</span>
                      <span className="font-semibold">10</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">System Status</CardTitle>
                  <CardDescription>Overall system health</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Database:</span>
                      <Badge variant="secondary">Online</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Last Backup:</span>
                      <span className="text-sm text-muted-foreground">2 hours ago</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Data Size:</span>
                      <span className="text-sm text-muted-foreground">2.3 MB</span>
                    </div>
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