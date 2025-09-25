"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { staticData } from "@/lib/static-data";
import {
  Trophy,
  Medal,
  Award,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Crown,
  Star,
  Target,
  Users
} from "lucide-react";

// Mock user - in real app this would come from auth
const mockUser = null;

interface LeaderboardUser {
  user: {
    id: string;
    name: string;
    username: string;
  };
  revenue: number;
  profit: number;
  commission: number;
  orderCount: number;
  avgMargin: number;
}

interface Leaderboards {
  revenue: LeaderboardUser[];
  profit: LeaderboardUser[];
  orders: LeaderboardUser[];
  margin: LeaderboardUser[];
  commission: LeaderboardUser[];
}

const getRankIcon = (position: number) => {
  switch (position) {
    case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
    case 2: return <Medal className="h-5 w-5 text-gray-400" />;
    case 3: return <Award className="h-5 w-5 text-amber-600" />;
    default: return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">#{position}</span>;
  }
};

const getRankBadgeVariant = (position: number): "default" | "secondary" | "outline" => {
  switch (position) {
    case 1: return "default";
    case 2: return "secondary";
    case 3: return "outline";
    default: return "outline";
  }
};

const getDateRange = () => {
  const today = new Date();
  const currentDay = today.getDay();
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;

  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    start: monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    end: sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  };
};

export default function LeaderboardPage() {
  const [leaderboards, setLeaderboards] = useState<Leaderboards | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<keyof Leaderboards>("revenue");

  useEffect(() => {
    const loadLeaderboards = async () => {
      try {
        const data = await staticData.getLeaderboard();
        if (data) {
          setLeaderboards(data);
        }
      } catch (error) {
        console.error("Failed to load leaderboards:", error);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboards();
  }, []);

  if (loading) {
    return (
      <MainLayout user={mockUser}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  const dateRange = getDateRange();

  const categoryConfig = {
    revenue: {
      title: "Top Revenue",
      icon: DollarSign,
      description: "Highest total sales this week",
      format: (value: number) => `$${value.toFixed(2)}`,
      getValue: (user: LeaderboardUser) => user.revenue
    },
    profit: {
      title: "Top Profit",
      icon: TrendingUp,
      description: "Highest profit margins this week",
      format: (value: number) => `$${value.toFixed(2)}`,
      getValue: (user: LeaderboardUser) => user.profit
    },
    orders: {
      title: "Most Orders",
      icon: ShoppingCart,
      description: "Most transactions completed",
      format: (value: number) => value.toString(),
      getValue: (user: LeaderboardUser) => user.orderCount
    },
    margin: {
      title: "Best Margins",
      icon: Target,
      description: "Highest average profit margin",
      format: (value: number) => `${value.toFixed(1)}%`,
      getValue: (user: LeaderboardUser) => user.avgMargin
    },
    commission: {
      title: "Top Commission",
      icon: Star,
      description: "Highest commission earned",
      format: (value: number) => `$${value.toFixed(2)}`,
      getValue: (user: LeaderboardUser) => user.commission
    }
  };

  const currentLeaderboard = leaderboards?.[selectedCategory] || [];
  const config = categoryConfig[selectedCategory];

  return (
    <MainLayout user={mockUser}>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold font-serif flex items-center justify-center gap-3 mb-4">
            <Trophy className="h-8 w-8 text-gold" />
            Weekly Leaderboard
          </h1>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <span>Week of {dateRange.start} - {dateRange.end}</span>
            <Badge variant="outline">Live</Badge>
          </div>
        </div>

        {/* Category Selection */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Object.entries(categoryConfig).map(([key, cat]) => {
            const IconComponent = cat.icon;
            const isSelected = selectedCategory === key;

            return (
              <Card
                key={key}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isSelected ? 'ring-2 ring-primary western-border' : ''
                }`}
                onClick={() => setSelectedCategory(key as keyof Leaderboards)}
              >
                <CardHeader className="text-center pb-2">
                  <div className={`mx-auto w-10 h-10 rounded-full flex items-center justify-center ${
                    isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-sm">{cat.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <p className="text-xs text-muted-foreground">{cat.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Current Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <config.icon className="h-5 w-5" />
              {config.title}
            </CardTitle>
            <CardDescription>{config.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentLeaderboard.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No data available for this week</p>
                </div>
              ) : (
                currentLeaderboard.map((entry, index) => {
                  const position = index + 1;
                  const value = config.getValue(entry);

                  return (
                    <div
                      key={entry.user.id}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-all hover:shadow-sm ${
                        position <= 3 ? 'bg-muted/50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12">
                          {getRankIcon(position)}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{entry.user.name}</h3>
                            <Badge variant={getRankBadgeVariant(position)}>
                              {position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : `#${position}`}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">@{entry.user.username}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-bold">
                          {config.format(value)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {entry.orderCount} {entry.orderCount === 1 ? 'order' : 'orders'}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top 3 Spotlight */}
        {currentLeaderboard.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {currentLeaderboard.slice(0, 3).map((entry, index) => {
              const position = index + 1;
              const value = config.getValue(entry);

              return (
                <Card key={entry.user.id} className="text-center western-border">
                  <CardHeader className="pb-2">
                    <div className="mx-auto mb-2">
                      {getRankIcon(position)}
                    </div>
                    <CardTitle className="text-lg">{entry.user.name}</CardTitle>
                    <CardDescription>@{entry.user.username}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-primary">
                        {config.format(value)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {entry.orderCount} orders • ${entry.revenue.toFixed(0)} revenue
                      </div>
                      {entry.avgMargin > 0 && (
                        <div className="text-xs text-muted-foreground">
                          {entry.avgMargin.toFixed(1)}% avg margin
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Weekly Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              This Week's Stats
            </CardTitle>
            <CardDescription>
              Overall performance summary
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold">
                  ${leaderboards?.revenue.reduce((sum, user) => sum + user.revenue, 0).toFixed(0) || '0'}
                </div>
                <div className="text-sm text-muted-foreground">Total Revenue</div>
              </div>

              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold">
                  ${leaderboards?.profit.reduce((sum, user) => sum + user.profit, 0).toFixed(0) || '0'}
                </div>
                <div className="text-sm text-muted-foreground">Total Profit</div>
              </div>

              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold">
                  {leaderboards?.orders.reduce((sum, user) => sum + user.orderCount, 0) || 0}
                </div>
                <div className="text-sm text-muted-foreground">Total Orders</div>
              </div>

              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold">
                  {leaderboards?.revenue.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Active Staff</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notice */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="text-center text-sm text-muted-foreground">
              <p>
                🏆 Leaderboard resets every Monday at midnight.
                Keep up the excellent work and may the best salesperson win!
              </p>
              <p className="mt-2 font-medium">
                "Competition breeds excellence, but camaraderie builds legends."
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}