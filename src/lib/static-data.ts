// Client-side data service for static deployment
class StaticDataService {
  private cache: Map<string, any> = new Map();
  private baseUrl = process.env.NODE_ENV === 'production' ? '/dragon-saloon' : '';

  private async fetchData(endpoint: string) {
    if (this.cache.has(endpoint)) {
      return this.cache.get(endpoint);
    }

    try {
      const response = await fetch(`${this.baseUrl}/data/${endpoint}.json`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${endpoint}`);
      }
      const data = await response.json();
      this.cache.set(endpoint, data);
      return data;
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      return null;
    }
  }

  async getItems() {
    return this.fetchData('items');
  }

  async getRecipes() {
    return this.fetchData('recipes');
  }

  async getSellPrices() {
    return this.fetchData('sell-prices');
  }

  async getPackages() {
    return this.fetchData('packages');
  }

  async getSales() {
    return this.fetchData('sales');
  }

  async getUsers() {
    return this.fetchData('users');
  }

  async getCommissionRules() {
    return this.fetchData('commission-rules');
  }

  async getLeaderboard() {
    return this.fetchData('leaderboard');
  }

  async getConfig() {
    return this.fetchData('config');
  }

  // Client-side calculations for new sales (since we can't persist them)
  calculateSaleTotals(lines: any[], discount = 0) {
    const subtotal = lines.reduce((sum, line) => sum + (line.quantity * line.unitPrice), 0);
    const total = subtotal - discount;
    const cost = lines.reduce((sum, line) => sum + (line.estimatedCost * line.quantity), 0);
    const profit = total - cost;

    return {
      subtotal,
      discount,
      total,
      cost,
      profit,
      margin: subtotal > 0 ? (profit / subtotal) * 100 : 0
    };
  }

  // Calculate commission based on rules
  calculateCommission(profit: number, commissionRule: any) {
    if (!commissionRule) return 0;

    switch (commissionRule.type) {
      case 'FLAT_PER_SALE':
        return commissionRule.params.amount || 0;
      case 'PERCENT_OF_PROFIT':
        return (profit * (commissionRule.params.percentage || 0)) / 100;
      case 'TIERED':
        const tiers = commissionRule.params.tiers || [];
        for (const tier of tiers.sort((a: any, b: any) => b.threshold - a.threshold)) {
          if (profit >= tier.threshold) {
            return tier.type === 'percentage'
              ? (profit * tier.value) / 100
              : tier.value;
          }
        }
        return 0;
      default:
        return 0;
    }
  }

  // Get current sell price for an item
  getCurrentSellPrice(item: any, unit?: string) {
    if (!item.sellPrices || item.sellPrices.length === 0) {
      return item.buyPrice * 2; // Default 100% markup
    }

    const validPrices = item.sellPrices.filter((price: any) =>
      (!unit || price.unit === unit) &&
      (!price.effectiveTo || new Date(price.effectiveTo) >= new Date())
    );

    return validPrices.length > 0 ? validPrices[0].sellPrice : item.buyPrice * 2;
  }

  // Clear cache (useful for development)
  clearCache() {
    this.cache.clear();
  }
}

export const staticData = new StaticDataService();