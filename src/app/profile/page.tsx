"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/contexts/auth-context";
import { staticData } from "@/lib/static-data";
import {
  User,
  LogOut,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Calendar,
  Award,
  Target,
  History,
  Star
} from "lucide-react";

interface UserStats {
  totalSales: number;
  totalRevenue: number;
  totalCommission: number;
  avgOrderValue: number;
  thisWeekSales: number;
  thisWeekRevenue: number;
  thisWeekCommission: number;
}

interface Sale {
  id: string;
  datetime: string;
  customer?: string;
  total: number;
  commission: number;
  itemCount: number;
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const loadUserData = async () => {
      try {
        const salesData = await staticData.getSales();

        if (salesData) {
          // Filter sales for current user
          const userSales = salesData.filter((sale: any) => sale.userId === user.id);

          // Calculate stats
          const totalRevenue = userSales.reduce((sum: number, sale: any) => sum + sale.total, 0);
          const totalCommission = userSales.reduce((sum: number, sale: any) => sum + sale.commission, 0);
          const avgOrderValue = userSales.length > 0 ? totalRevenue / userSales.length : 0;

          // This week's stats
          const weekStart = new Date();
          weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday
          const thisWeekSales = userSales.filter((sale: any) =>
            new Date(sale.datetime) >= weekStart
          );

          const thisWeekRevenue = thisWeekSales.reduce((sum: number, sale: any) => sum + sale.total, 0);
          const thisWeekCommission = thisWeekSales.reduce((sum: number, sale: any) => sum + sale.commission, 0);

          setUserStats({
            totalSales: userSales.length,
            totalRevenue,
            totalCommission,
            avgOrderValue,
            thisWeekSales: thisWeekSales.length,
            thisWeekRevenue,
            thisWeekCommission
          });

          // Recent sales
          const recent = userSales
            .sort((a: any, b: any) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime())
            .slice(0, 10)
            .map((sale: any) => ({
              id: sale.id,
              datetime: sale.datetime,
              customer: sale.customer,
              total: sale.total,
              commission: sale.commission,
              itemCount: sale.lines.length
            }));

          setRecentSales(recent);
        }
      } catch (error) {
        console.error("Failed to load user data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!user) {
    return null;
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'default';
      case 'MANAGER': return 'secondary';
      case 'STAFF': return 'outline';
      default: return 'outline';
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Full system access and management';
      case 'MANAGER': return 'Inventory and staff management';
      case 'STAFF': return 'Sales entry and commission tracking';
      case 'VIEWER': return 'Read-only access to prices and recipes';
      default: return 'Basic access';
    }
  };

  if (loading) {
    return (
      <MainLayout user={user}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout user={user}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold font-serif flex items-center gap-3">
              <User className="h-8 w-8 text-primary" />
              My Profile
            </h1>
            <p className="text-muted-foreground mt-2">
              Account details and performance summary
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* User Info */}
        <Card className="western-border">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-2xl text-primary-foreground font-bold">
                    {user.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold font-serif">{user.name}</h2>
                  <p className="text-muted-foreground">@{user.username}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {user.role}
                    </Badge>
                    <Badge variant="outline">
                      {user.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-sm mb-2">Role Permissions</h3>
                <p className="text-sm text-muted-foreground">
                  {getRoleDescription(user.role)}
                </p>
              </div>

              {user.role === 'STAFF' && (
                <div>
                  <h3 className="font-semibold text-sm mb-2">Commission Structure</h3>
                  <p className="text-sm text-muted-foreground">
                    You earn commission on each sale based on your assigned commission rule.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Performance Stats - Only for Staff */}
        {user.role === 'STAFF' && userStats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userStats.totalSales}</div>
                  <p className="text-xs text-muted-foreground">
                    All time transactions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${userStats.totalRevenue.toFixed(0)}</div>
                  <p className="text-xs text-muted-foreground">
                    Sales generated
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Commission Earned</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    ${userStats.totalCommission.toFixed(0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total earnings
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${userStats.avgOrderValue.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    Per transaction
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* This Week Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  This Week's Performance
                </CardTitle>
                <CardDescription>
                  Your sales activity for the current week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold">{userStats.thisWeekSales}</div>
                    <div className="text-sm text-muted-foreground">Sales This Week</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold">${userStats.thisWeekRevenue.toFixed(0)}</div>
                    <div className="text-sm text-muted-foreground">Revenue This Week</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      ${userStats.thisWeekCommission.toFixed(0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Commission This Week</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Sales History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Recent Sales
                </CardTitle>
                <CardDescription>
                  Your last 10 transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentSales.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ShoppingCart className="h-8 w-8 mx-auto mb-2" />
                    <p>No sales recorded yet</p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead className="text-right">Items</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead className="text-right">Commission</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentSales.map((sale) => (
                          <TableRow key={sale.id}>
                            <TableCell>
                              <div className="text-sm">
                                {new Date(sale.datetime).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(sale.datetime).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </TableCell>
                            <TableCell>
                              {sale.customer || (
                                <span className="text-muted-foreground">Anonymous</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge variant="outline">{sale.itemCount}</Badge>
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              ${sale.total.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right font-mono text-green-600">
                              +${sale.commission.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and navigation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {user.role === 'STAFF' && (
                <Button
                  variant="outline"
                  className="justify-start h-auto p-4"
                  onClick={() => router.push('/sales')}
                >
                  <ShoppingCart className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Log New Sale</div>
                    <div className="text-sm text-muted-foreground">Record a transaction</div>
                  </div>
                </Button>
              )}

              <Button
                variant="outline"
                className="justify-start h-auto p-4"
                onClick={() => router.push('/leaderboard')}
              >
                <Star className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">View Leaderboard</div>
                  <div className="text-sm text-muted-foreground">Check weekly rankings</div>
                </div>
              </Button>

              {(user.role === 'ADMIN' || user.role === 'MANAGER') && (
                <Button
                  variant="outline"
                  className="justify-start h-auto p-4"
                  onClick={() => router.push('/dashboard')}
                >
                  <TrendingUp className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Dashboard</div>
                    <div className="text-sm text-muted-foreground">View reports & analytics</div>
                  </div>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}