import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create commission rules
  const flatCommission = await prisma.commissionRule.create({
    data: {
      name: 'Flat $5 per sale',
      type: 'FLAT_PER_SALE',
      params: { amount: 5 }
    }
  });

  const percentageCommission = await prisma.commissionRule.create({
    data: {
      name: '15% of profit',
      type: 'PERCENT_OF_PROFIT',
      params: { percentage: 15 }
    }
  });

  const tieredCommission = await prisma.commissionRule.create({
    data: {
      name: 'Tiered (10% under $50, 20% over)',
      type: 'TIERED',
      params: {
        tiers: [
          { threshold: 50, type: 'percentage', value: 20 },
          { threshold: 0, type: 'percentage', value: 10 }
        ]
      }
    }
  });

  // Create users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const staffPassword = await bcrypt.hash('staff123', 10);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Silas Blackwood',
        username: 'admin',
        email: 'admin@dragonsaloon.com',
        passwordHash: adminPassword,
        role: 'ADMIN',
        commissionRuleId: tieredCommission.id
      }
    }),
    prisma.user.create({
      data: {
        name: 'Martha "Red" O\'Connor',
        username: 'red',
        email: 'red@dragonsaloon.com',
        passwordHash: staffPassword,
        role: 'MANAGER',
        commissionRuleId: percentageCommission.id
      }
    }),
    prisma.user.create({
      data: {
        name: 'Jake "Mustang" Miller',
        username: 'jake',
        email: 'jake@dragonsaloon.com',
        passwordHash: staffPassword,
        role: 'STAFF',
        commissionRuleId: flatCommission.id
      }
    }),
    prisma.user.create({
      data: {
        name: 'Belle "Songbird" Davis',
        username: 'belle',
        email: 'belle@dragonsaloon.com',
        passwordHash: staffPassword,
        role: 'STAFF',
        commissionRuleId: percentageCommission.id
      }
    }),
    prisma.user.create({
      data: {
        name: 'Frank "Iron Horse" Thompson',
        username: 'frank',
        email: 'frank@dragonsaloon.com',
        passwordHash: staffPassword,
        role: 'STAFF',
        commissionRuleId: flatCommission.id
      }
    }),
    prisma.user.create({
      data: {
        name: 'Eliza "Doc" Morrison',
        username: 'doc',
        email: 'doc@dragonsaloon.com',
        passwordHash: staffPassword,
        role: 'STAFF',
        commissionRuleId: tieredCommission.id
      }
    })
  ]);

  // Create items (spirits, beer, mixers, food)
  const items = await Promise.all([
    // Spirits
    prisma.item.create({
      data: {
        name: 'Dragon\'s Breath Whiskey',
        category: 'Spirits',
        unit: 'bottle',
        buyPrice: 25.00,
        supplier: 'Western Distillery Co.',
        notes: 'Our signature whiskey with a fiery finish'
      }
    }),
    prisma.item.create({
      data: {
        name: 'Tombstone Rye',
        category: 'Spirits',
        unit: 'bottle',
        buyPrice: 30.00,
        supplier: 'Arizona Spirits',
        notes: 'Premium rye whiskey'
      }
    }),
    prisma.item.create({
      data: {
        name: 'Prairie Fire Bourbon',
        category: 'Spirits',
        unit: 'bottle',
        buyPrice: 22.00,
        supplier: 'Kentucky Barrel House'
      }
    }),
    prisma.item.create({
      data: {
        name: 'Snake Oil Gin',
        category: 'Spirits',
        unit: 'bottle',
        buyPrice: 18.00,
        supplier: 'London Import Co.'
      }
    }),
    prisma.item.create({
      data: {
        name: 'Cactus Flower Tequila',
        category: 'Spirits',
        unit: 'bottle',
        buyPrice: 20.00,
        supplier: 'Mexcio Trading Post'
      }
    }),
    // Beer
    prisma.item.create({
      data: {
        name: 'Saloon Lager',
        category: 'Beer',
        unit: 'keg',
        buyPrice: 45.00,
        supplier: 'Local Brewery',
        notes: 'House beer on tap'
      }
    }),
    prisma.item.create({
      data: {
        name: 'Desert Amber Ale',
        category: 'Beer',
        unit: 'bottle',
        buyPrice: 3.50,
        supplier: 'Desert Brewery'
      }
    }),
    prisma.item.create({
      data: {
        name: 'Frontier Stout',
        category: 'Beer',
        unit: 'bottle',
        buyPrice: 4.00,
        supplier: 'Mountain Brewery'
      }
    }),
    // Mixers & Non-alcoholic
    prisma.item.create({
      data: {
        name: 'Sarsaparilla',
        category: 'Non-Alcoholic',
        unit: 'bottle',
        buyPrice: 2.00,
        supplier: 'General Store'
      }
    }),
    prisma.item.create({
      data: {
        name: 'Ginger Beer',
        category: 'Mixers',
        unit: 'bottle',
        buyPrice: 2.50,
        supplier: 'General Store'
      }
    }),
    prisma.item.create({
      data: {
        name: 'Simple Syrup',
        category: 'Mixers',
        unit: 'bottle',
        buyPrice: 5.00,
        supplier: 'Kitchen Supply Co.'
      }
    }),
    // Food
    prisma.item.create({
      data: {
        name: 'Beef Jerky',
        category: 'Food',
        unit: 'pound',
        buyPrice: 8.00,
        supplier: 'Frontier Meat Co.'
      }
    }),
    prisma.item.create({
      data: {
        name: 'Hardtack Biscuits',
        category: 'Food',
        unit: 'dozen',
        buyPrice: 3.00,
        supplier: 'Baker\'s Dozen'
      }
    }),
    prisma.item.create({
      data: {
        name: 'Salted Pork',
        category: 'Food',
        unit: 'pound',
        buyPrice: 6.00,
        supplier: 'Frontier Meat Co.'
      }
    }),
    prisma.item.create({
      data: {
        name: 'Prairie Beans',
        category: 'Food',
        unit: 'pound',
        buyPrice: 2.50,
        supplier: 'General Store'
      }
    })
  ]);

  // Create sell prices for items
  await Promise.all([
    // Whiskey - bottle and glass pricing
    prisma.sellPrice.create({
      data: {
        itemId: items[0].id, // Dragon's Breath Whiskey
        unit: 'glass',
        sellPrice: 3.50
      }
    }),
    prisma.sellPrice.create({
      data: {
        itemId: items[0].id,
        unit: 'bottle',
        sellPrice: 50.00
      }
    }),
    // Rye - bottle and glass pricing
    prisma.sellPrice.create({
      data: {
        itemId: items[1].id, // Tombstone Rye
        unit: 'glass',
        sellPrice: 4.00
      }
    }),
    prisma.sellPrice.create({
      data: {
        itemId: items[1].id,
        unit: 'bottle',
        sellPrice: 60.00
      }
    }),
    // Beer pricing
    prisma.sellPrice.create({
      data: {
        itemId: items[5].id, // Saloon Lager
        unit: 'glass',
        sellPrice: 2.00
      }
    }),
    prisma.sellPrice.create({
      data: {
        itemId: items[6].id, // Desert Amber Ale
        unit: 'bottle',
        sellPrice: 6.00
      }
    }),
    // Food pricing
    prisma.sellPrice.create({
      data: {
        itemId: items[11].id, // Beef Jerky
        unit: 'serving',
        sellPrice: 4.00
      }
    }),
    prisma.sellPrice.create({
      data: {
        itemId: items[12].id, // Hardtack Biscuits
        unit: 'piece',
        sellPrice: 1.00
      }
    })
  ]);

  // Create recipes
  const recipes = await Promise.all([
    // Cocktails
    prisma.recipe.create({
      data: {
        name: 'Dragon\'s Fire Cocktail',
        description: 'Our signature cocktail with a spicy kick',
        category: 'Cocktails',
        difficulty: 3,
        stepsMarkdown: `
1. Add 2 oz Dragon's Breath Whiskey to shaker
2. Add 0.5 oz simple syrup
3. Add 2 dashes of hot sauce
4. Shake with ice
5. Strain into glass
6. Garnish with dried chili
        `,
        imageUrl: '/images/dragons-fire.jpg'
      }
    }),
    prisma.recipe.create({
      data: {
        name: 'Tombstone Mule',
        description: 'A Western twist on the classic Moscow Mule',
        category: 'Cocktails',
        difficulty: 2,
        stepsMarkdown: `
1. Add 2 oz Tombstone Rye to copper mug
2. Add 0.5 oz simple syrup
3. Add juice of half a lime
4. Fill with ginger beer
5. Stir gently
6. Garnish with lime wedge
        `
      }
    }),
    prisma.recipe.create({
      data: {
        name: 'Prairie Sunrise',
        description: 'A refreshing non-alcoholic drink',
        category: 'Non-Alcoholic',
        difficulty: 1,
        stepsMarkdown: `
1. Fill glass with ice
2. Add sarsaparilla
3. Top with ginger beer
4. Stir gently
5. Garnish with orange slice
        `
      }
    }),
    // Food recipes
    prisma.recipe.create({
      data: {
        name: 'Cowboy\'s Plate',
        description: 'Hearty meal for hungry travelers',
        category: 'Food',
        difficulty: 2,
        stepsMarkdown: `
1. Slice beef jerky into strips
2. Warm hardtack biscuits
3. Heat salted pork in cast iron pan
4. Serve beans on the side
5. Arrange on wooden plate
        `
      }
    }),
    prisma.recipe.create({
      data: {
        name: 'Trail Mix Special',
        description: 'Perfect snack for the road',
        category: 'Food',
        difficulty: 1,
        stepsMarkdown: `
1. Mix jerky pieces with nuts
2. Add dried fruits if available
3. Serve in small bowl
        `
      }
    })
  ]);

  // Create recipe ingredients
  await Promise.all([
    // Dragon's Fire Cocktail ingredients
    prisma.recipeIngredient.create({
      data: {
        recipeId: recipes[0].id,
        itemId: items[0].id, // Dragon's Breath Whiskey
        quantity: 2,
        unitOverride: 'oz'
      }
    }),
    prisma.recipeIngredient.create({
      data: {
        recipeId: recipes[0].id,
        itemId: items[10].id, // Simple Syrup
        quantity: 0.5,
        unitOverride: 'oz'
      }
    }),
    // Tombstone Mule ingredients
    prisma.recipeIngredient.create({
      data: {
        recipeId: recipes[1].id,
        itemId: items[1].id, // Tombstone Rye
        quantity: 2,
        unitOverride: 'oz'
      }
    }),
    prisma.recipeIngredient.create({
      data: {
        recipeId: recipes[1].id,
        itemId: items[9].id, // Ginger Beer
        quantity: 1,
        unitOverride: 'bottle'
      }
    }),
    prisma.recipeIngredient.create({
      data: {
        recipeId: recipes[1].id,
        itemId: items[10].id, // Simple Syrup
        quantity: 0.5,
        unitOverride: 'oz'
      }
    }),
    // Prairie Sunrise ingredients
    prisma.recipeIngredient.create({
      data: {
        recipeId: recipes[2].id,
        itemId: items[8].id, // Sarsaparilla
        quantity: 0.5,
        unitOverride: 'bottle'
      }
    }),
    prisma.recipeIngredient.create({
      data: {
        recipeId: recipes[2].id,
        itemId: items[9].id, // Ginger Beer
        quantity: 0.5,
        unitOverride: 'bottle'
      }
    }),
    // Cowboy's Plate ingredients
    prisma.recipeIngredient.create({
      data: {
        recipeId: recipes[3].id,
        itemId: items[11].id, // Beef Jerky
        quantity: 0.25,
        unitOverride: 'pound'
      }
    }),
    prisma.recipeIngredient.create({
      data: {
        recipeId: recipes[3].id,
        itemId: items[12].id, // Hardtack Biscuits
        quantity: 2,
        unitOverride: 'piece'
      }
    }),
    prisma.recipeIngredient.create({
      data: {
        recipeId: recipes[3].id,
        itemId: items[13].id, // Salted Pork
        quantity: 0.5,
        unitOverride: 'pound'
      }
    }),
    prisma.recipeIngredient.create({
      data: {
        recipeId: recipes[3].id,
        itemId: items[14].id, // Prairie Beans
        quantity: 0.5,
        unitOverride: 'pound'
      }
    })
  ]);

  // Create packages
  const packages = await Promise.all([
    prisma.package.create({
      data: {
        name: 'Poker Night Pack',
        description: 'Everything you need for a good game',
        bundleSellPrice: 35.00
      }
    }),
    prisma.package.create({
      data: {
        name: 'Rancher\'s Supper',
        description: 'Hearty meal with a drink',
        bundleSellPrice: 25.00
      }
    }),
    prisma.package.create({
      data: {
        name: 'Traveler\'s Kit',
        description: 'Supplies for the road',
        bundleSellPrice: 15.00
      }
    }),
    prisma.package.create({
      data: {
        name: 'Saturday Night Special',
        description: 'Premium drinks for celebration',
        bundleSellPrice: 45.00
      }
    }),
    prisma.package.create({
      data: {
        name: 'Saloon Sampler',
        description: 'Try a bit of everything',
        bundleSellPrice: 20.00
      }
    })
  ]);

  // Create package items
  await Promise.all([
    // Poker Night Pack
    prisma.packageItem.create({
      data: {
        packageId: packages[0].id,
        sourceType: 'ITEM',
        sourceId: items[0].id, // Dragon's Breath Whiskey
        quantity: 4 // 4 glasses
      }
    }),
    prisma.packageItem.create({
      data: {
        packageId: packages[0].id,
        sourceType: 'ITEM',
        sourceId: items[5].id, // Saloon Lager
        quantity: 6 // 6 glasses
      }
    }),
    prisma.packageItem.create({
      data: {
        packageId: packages[0].id,
        sourceType: 'ITEM',
        sourceId: items[11].id, // Beef Jerky
        quantity: 1 // 1 serving
      }
    }),
    // Rancher's Supper
    prisma.packageItem.create({
      data: {
        packageId: packages[1].id,
        sourceType: 'RECIPE',
        sourceId: recipes[3].id, // Cowboy's Plate
        quantity: 1
      }
    }),
    prisma.packageItem.create({
      data: {
        packageId: packages[1].id,
        sourceType: 'ITEM',
        sourceId: items[0].id, // Dragon's Breath Whiskey
        quantity: 2 // 2 glasses
      }
    })
  ]);

  // Generate sample sales data for the past 2 weeks
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  const salesData = [];
  for (let i = 0; i < 50; i++) {
    const randomDate = new Date(
      twoWeeksAgo.getTime() + Math.random() * (Date.now() - twoWeeksAgo.getTime())
    );
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const randomCustomer = [
      'Wild Bill', 'Calamity Jane', 'Doc Holiday', 'Annie Oakley',
      'Jesse James', 'Wyatt Earp', 'Buffalo Bill', 'Belle Starr',
      'Pat Garrett', 'Butch Cassidy', null, null, null // Some anonymous customers
    ][Math.floor(Math.random() * 13)];

    // Random sale composition
    const isPackageSale = Math.random() < 0.3; // 30% package sales
    let subtotal = 0;
    let cost = 0;
    let lines = [];

    if (isPackageSale) {
      const randomPackage = packages[Math.floor(Math.random() * packages.length)];
      const packageCost = 15; // Estimated cost
      subtotal = randomPackage.bundleSellPrice;
      cost = packageCost;
      lines.push({
        sourceType: 'PACKAGE',
        sourceId: randomPackage.id,
        nameSnapshot: randomPackage.name,
        quantity: 1,
        unitPrice: randomPackage.bundleSellPrice,
        lineTotal: randomPackage.bundleSellPrice,
        estimatedCost: packageCost,
        estimatedProfit: randomPackage.bundleSellPrice - packageCost
      });
    } else {
      // Individual items sale
      const numItems = Math.floor(Math.random() * 4) + 1; // 1-4 items
      for (let j = 0; j < numItems; j++) {
        const randomItem = items[Math.floor(Math.random() * items.length)];
        const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 quantity
        let unitPrice;

        // Get sell price if available, otherwise markup buy price
        const sellPrice = randomItem.category === 'Spirits' ?
          (randomItem.buyPrice * 1.8) : // 80% markup for spirits
          (randomItem.buyPrice * 2.2); // 120% markup for others

        unitPrice = sellPrice;
        const lineTotal = quantity * unitPrice;
        const lineCost = quantity * randomItem.buyPrice;

        subtotal += lineTotal;
        cost += lineCost;

        lines.push({
          sourceType: 'ITEM',
          sourceId: randomItem.id,
          nameSnapshot: randomItem.name,
          quantity,
          unitPrice,
          lineTotal,
          estimatedCost: lineCost,
          estimatedProfit: lineTotal - lineCost
        });
      }
    }

    const discount = Math.random() < 0.1 ? Math.floor(Math.random() * 5) + 1 : 0; // 10% chance of discount
    const total = subtotal - discount;
    const profit = total - cost;

    // Calculate commission based on user's commission rule
    let commission = 0;
    if (randomUser.commissionRuleId === flatCommission.id) {
      commission = 5;
    } else if (randomUser.commissionRuleId === percentageCommission.id) {
      commission = profit * 0.15;
    } else if (randomUser.commissionRuleId === tieredCommission.id) {
      commission = profit >= 50 ? profit * 0.2 : profit * 0.1;
    }

    salesData.push({
      datetime: randomDate,
      userId: randomUser.id,
      customer: randomCustomer,
      subtotal,
      discount,
      total,
      cost,
      profit,
      commission,
      paymentType: ['CASH', 'LEDGER', 'OTHER'][Math.floor(Math.random() * 3)],
      lines
    });
  }

  // Create sales in batches
  for (const saleData of salesData) {
    const { lines, ...saleInfo } = saleData;
    const sale = await prisma.sale.create({
      data: saleInfo
    });

    await Promise.all(
      lines.map(line =>
        prisma.saleLine.create({
          data: {
            saleId: sale.id,
            ...line
          }
        })
      )
    );
  }

  // Create some config entries
  await Promise.all([
    prisma.config.create({
      data: {
        key: 'noticeboard',
        value: `# Welcome to The Dragon Saloon

## This Week's Specials
- **Monday**: Half-price Prairie Fire Bourbon
- **Wednesday**: Poker Night Pack - Buy 2 Get 1 Free
- **Friday**: Live music with Belle "Songbird" Davis
- **Saturday**: Dragon's Fire Challenge - Finish the drink, get your name on the wall!

## Upcoming Events
- **Next Sunday**: Monthly Arm Wrestling Championship
- **Oct 31**: Halloween Costume Contest with prizes

*Fine drinks, fair deals, fierce spirit.*`
      }
    }),
    prisma.config.create({
      data: {
        key: 'timezone',
        value: 'Europe/London'
      }
    }),
    prisma.config.create({
      data: {
        key: 'weekStartDay',
        value: '1'
      }
    })
  ]);

  console.log('✅ Database seeded successfully!');
  console.log(`Created ${users.length} users`);
  console.log(`Created ${items.length} items`);
  console.log(`Created ${recipes.length} recipes`);
  console.log(`Created ${packages.length} packages`);
  console.log(`Created ${salesData.length} sample sales`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });