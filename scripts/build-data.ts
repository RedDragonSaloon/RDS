import { PrismaClient } from '@prisma/client';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

async function buildStaticData() {
  console.log('Building static data for GitHub Pages deployment...');

  try {
    // Ensure data directory exists
    const dataDir = join(process.cwd(), 'public', 'data');
    mkdirSync(dataDir, { recursive: true });

    // Fetch all data
    const [items, recipes, sellPrices, packages, sales, users, commissionRules] = await Promise.all([
      prisma.item.findMany({
        where: { isActive: true },
        include: {
          sellPrices: {
            where: {
              OR: [
                { effectiveTo: null },
                { effectiveTo: { gte: new Date() } }
              ]
            },
            orderBy: { effectiveFrom: 'desc' }
          }
        }
      }),
      prisma.recipe.findMany({
        where: { isActive: true },
        include: {
          ingredients: {
            include: {
              item: true
            }
          }
        }
      }),
      prisma.sellPrice.findMany({
        where: {
          OR: [
            { effectiveTo: null },
            { effectiveTo: { gte: new Date() } }
          ]
        },
        include: {
          item: true
        }
      }),
      prisma.package.findMany({
        where: { isActive: true },
        include: {
          items: true
        }
      }),
      prisma.sale.findMany({
        include: {
          user: {
            select: { id: true, name: true, username: true }
          },
          lines: true
        },
        orderBy: { datetime: 'desc' },
        take: 1000 // Limit for performance
      }),
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          username: true,
          role: true,
          status: true,
          commissionRuleId: true
        }
      }),
      prisma.commissionRule.findMany()
    ]);

    // Calculate recipe costs
    const recipesWithCosts = recipes.map(recipe => {
      const totalCost = recipe.ingredients.reduce((sum, ingredient) => {
        return sum + (ingredient.item.buyPrice * ingredient.quantity);
      }, 0);

      return {
        ...recipe,
        calculatedCost: totalCost,
        suggestedSellPrice: totalCost * 2.5, // 150% markup
        suggestedMargin: 60 // 60% margin
      };
    });

    // Calculate weekly leaderboard data
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weeklySales = sales.filter(sale => new Date(sale.datetime) >= oneWeekAgo);

    const leaderboardData = users.reduce((acc, user) => {
      const userSales = weeklySales.filter(sale => sale.userId === user.id);
      const totalRevenue = userSales.reduce((sum, sale) => sum + sale.total, 0);
      const totalProfit = userSales.reduce((sum, sale) => sum + sale.profit, 0);
      const totalCommission = userSales.reduce((sum, sale) => sum + sale.commission, 0);
      const orderCount = userSales.length;
      const avgMargin = orderCount > 0 ? (totalProfit / userSales.reduce((sum, sale) => sum + sale.subtotal, 0)) * 100 : 0;

      acc[user.id] = {
        user: {
          id: user.id,
          name: user.name,
          username: user.username
        },
        revenue: totalRevenue,
        profit: totalProfit,
        commission: totalCommission,
        orderCount,
        avgMargin
      };

      return acc;
    }, {} as any);

    // Sort leaderboards
    const leaderboards = {
      revenue: Object.values(leaderboardData).sort((a: any, b: any) => b.revenue - a.revenue).slice(0, 10),
      profit: Object.values(leaderboardData).sort((a: any, b: any) => b.profit - a.profit).slice(0, 10),
      orders: Object.values(leaderboardData).sort((a: any, b: any) => b.orderCount - a.orderCount).slice(0, 10),
      margin: Object.values(leaderboardData).sort((a: any, b: any) => b.avgMargin - a.avgMargin).slice(0, 10),
      commission: Object.values(leaderboardData).sort((a: any, b: any) => b.commission - a.commission).slice(0, 10)
    };

    // Write data files
    const dataFiles = {
      'items.json': items,
      'recipes.json': recipesWithCosts,
      'sell-prices.json': sellPrices,
      'packages.json': packages,
      'sales.json': sales.slice(0, 100), // Limit sales data
      'users.json': users,
      'commission-rules.json': commissionRules,
      'leaderboard.json': leaderboards,
      'config.json': {
        timezone: 'Europe/London',
        weekStartDay: 1,
        currency: 'USD',
        lastUpdated: new Date().toISOString()
      }
    };

    for (const [filename, data] of Object.entries(dataFiles)) {
      const filepath = join(dataDir, filename);
      writeFileSync(filepath, JSON.stringify(data, null, 2));
      console.log(`✓ Generated ${filename}`);
    }

    console.log('✅ Static data build complete!');
  } catch (error) {
    console.error('❌ Error building static data:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

buildStaticData();