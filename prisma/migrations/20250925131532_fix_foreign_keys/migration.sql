-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_package_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "packageId" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    CONSTRAINT "package_items_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "packages" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_package_items" ("id", "packageId", "quantity", "sourceId", "sourceType") SELECT "id", "packageId", "quantity", "sourceId", "sourceType" FROM "package_items";
DROP TABLE "package_items";
ALTER TABLE "new_package_items" RENAME TO "package_items";
CREATE TABLE "new_sale_lines" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "saleId" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "nameSnapshot" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "unitPrice" REAL NOT NULL,
    "lineTotal" REAL NOT NULL,
    "estimatedCost" REAL NOT NULL,
    "estimatedProfit" REAL NOT NULL,
    CONSTRAINT "sale_lines_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "sales" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_sale_lines" ("estimatedCost", "estimatedProfit", "id", "lineTotal", "nameSnapshot", "quantity", "saleId", "sourceId", "sourceType", "unitPrice") SELECT "estimatedCost", "estimatedProfit", "id", "lineTotal", "nameSnapshot", "quantity", "saleId", "sourceId", "sourceType", "unitPrice" FROM "sale_lines";
DROP TABLE "sale_lines";
ALTER TABLE "new_sale_lines" RENAME TO "sale_lines";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
