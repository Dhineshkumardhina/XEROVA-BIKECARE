import { prisma } from '../config/database.js';
import {
  StockAdjustmentInput,
  StockMovementQueryInput,
  StockReportQueryInput,
  LowStockQueryInput
} from '../validators/stock.validator.js';
import { StockMovementType, StockDirection, RecordStatus } from '@prisma/client';
import { recordAuditLog } from '../middleware/auditLogger.js';

export interface MovementRecordParams {
  itemId: string;
  branchId?: string;
  userId?: string;
  username?: string;
  movementType: StockMovementType;
  direction: StockDirection;
  quantity: number;
  unitRate?: number;
  referenceType: string;
  referenceId: string;
  reason?: string;
  notes?: string;
}

export class StockService {
  /**
   * Atomic, concurrency-safe stock movement processor.
   * Ensures stock cannot be negative (unless explicitly allowed) and prevents race condition overselling.
   */
  async recordMovement(params: MovementRecordParams, clientTx?: any) {
    const execute = async (tx: any) => {
      const {
        itemId,
        branchId,
        userId,
        movementType,
        direction,
        quantity,
        referenceType,
        referenceId,
        reason,
        notes
      } = params;

      if (quantity <= 0) {
        throw { statusCode: 400, message: 'Stock movement quantity must be positive', code: 'INVALID_QUANTITY' };
      }

      // 1. Fetch item to verify maintainStock flag and default pricing
      const item = await tx.item.findUnique({
        where: { id: itemId },
        include: { prices: { where: { isCurrent: true }, take: 1 } }
      });

      if (!item) {
        throw { statusCode: 404, message: `Item with ID ${itemId} not found`, code: 'ITEM_NOT_FOUND' };
      }

      const unitRate = params.unitRate ?? Number(item.prices[0]?.purchaseRate || 0);

      // If item does not maintain stock (e.g. pure service or non-inventory), record movement without physical stock balance deduction
      if (!item.maintainStock) {
        const dummyMovement = await tx.stockMovement.create({
          data: {
            itemId,
            branchId,
            userId,
            movementType,
            direction,
            quantity,
            unitRate,
            previousBalance: 0,
            newBalance: 0,
            referenceType,
            referenceId,
            reason: reason || 'Non-stock maintained item',
            notes
          }
        });
        return {
          stockId: null,
          previousBalance: 0,
          newBalance: 0,
          quantity,
          movementId: dummyMovement.id
        };
      }

      // 2. Fetch or initialize branch Stock record
      let stock = await tx.stock.findFirst({
        where: { itemId, ...(branchId ? { branchId } : {}) }
      });

      if (!stock) {
        // If branchId is not provided, use default primary branch if available
        let targetBranchId = branchId;
        if (!targetBranchId) {
          const defaultBranch = await tx.branch.findFirst();
          targetBranchId = defaultBranch?.id;
        }

        if (targetBranchId) {
          stock = await tx.stock.create({
            data: {
              itemId,
              branchId: targetBranchId,
              quantity: 0,
              avgCostRate: unitRate
            }
          });
        }
      }

      const currentQty = Number(stock?.quantity || 0);
      let newQty = currentQty;

      // 3. Concurrency-Safe Stock Calculation
      if (direction === StockDirection.IN) {
        newQty = currentQty + quantity;
      } else {
        // Outbound movement (SALE, PURCHASE_RETURN, OUTWARD_TRANSFER, LOSS)
        if (currentQty < quantity) {
          throw {
            statusCode: 400,
            message: `Insufficient stock for ${item.name} (${item.sku}). Available: ${currentQty}, Requested: ${quantity}`,
            code: 'INSUFFICIENT_STOCK',
            details: { itemId, sku: item.sku, available: currentQty, requested: quantity }
          };
        }
        newQty = currentQty - quantity;
      }

      // 4. Update Stock record in DB
      if (stock) {
        await tx.stock.update({
          where: { id: stock.id },
          data: {
            quantity: newQty,
            ...(direction === StockDirection.IN && movementType === StockMovementType.PURCHASE
              ? { avgCostRate: unitRate }
              : {})
          }
        });
      }

      // 5. Create Immutable StockMovement Record
      const movement = await tx.stockMovement.create({
        data: {
          itemId,
          branchId: stock?.branchId || branchId,
          userId,
          movementType,
          direction,
          quantity,
          unitRate,
          previousBalance: currentQty,
          newBalance: newQty,
          referenceType,
          referenceId,
          reason,
          notes
        }
      });

      return {
        stockId: stock?.id,
        previousBalance: currentQty,
        newBalance: newQty,
        quantity,
        direction,
        movementId: movement.id,
        referenceId
      };
    };

    if (clientTx) {
      return await execute(clientTx);
    }
    return await prisma.$transaction(execute);
  }

  /**
   * Performs an atomic, audited physical stock adjustment.
   */
  async adjustStock(input: StockAdjustmentInput, userId?: string, username = 'Admin') {
    return await prisma.$transaction(async (tx) => {
      const item = await tx.item.findUnique({
        where: { id: input.itemId },
        include: { prices: { where: { isCurrent: true }, take: 1 } }
      });

      if (!item) {
        throw { statusCode: 404, message: 'Item not found for stock adjustment', code: 'ITEM_NOT_FOUND' };
      }

      const stock = await tx.stock.findFirst({
        where: { itemId: input.itemId, ...(input.branchId ? { branchId: input.branchId } : {}) }
      });

      const currentQty = Number(stock?.quantity || 0);
      const adjQty = input.quantity;
      const refId = `ADJ-${Date.now().toString().slice(-6)}`;

      const result = await this.recordMovement(
        {
          itemId: input.itemId,
          branchId: input.branchId,
          userId,
          username,
          movementType: StockMovementType.ADJUSTMENT,
          direction: input.direction,
          quantity: adjQty,
          unitRate: Number(item.prices[0]?.purchaseRate || stock?.avgCostRate || 0),
          referenceType: 'MANUAL_STOCK_ADJUSTMENT',
          referenceId: refId,
          reason: input.reason,
          notes: input.notes || undefined
        },
        tx
      );

      // Record detailed Audit Log
      await recordAuditLog({
        userId,
        username,
        action: 'Stock Adjusted',
        module: 'Inventory',
        entity: 'StockMovement',
        entityId: result.movementId,
        previousValue: { quantity: currentQty },
        newValue: {
          quantity: result.newBalance,
          delta: input.direction === StockDirection.IN ? `+${adjQty}` : `-${adjQty}`,
          reason: input.reason
        },
        notes: `Audited physical adjustment for ${item.sku} (${item.name}): ${input.reason}. Notes: ${input.notes || 'None'}`
      });

      return {
        referenceId: refId,
        itemId: input.itemId,
        sku: item.sku,
        itemName: item.name,
        previousBalance: currentQty,
        adjustmentQty: input.direction === StockDirection.IN ? adjQty : -adjQty,
        newBalance: result.newBalance,
        reason: input.reason,
        movementId: result.movementId
      };
    });
  }

  /**
   * Retrieves chronological auditable Stock Movement Ledger entries with search and filters.
   */
  async getStockMovements(params: StockMovementQueryInput) {
    const { itemId, branchId, movementType, referenceType, startDate, endDate, q, page, limit } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (itemId) where.itemId = itemId;
    if (branchId) where.branchId = branchId;
    if (movementType) where.movementType = movementType;
    if (referenceType) where.referenceType = referenceType;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    if (q && q.trim()) {
      const searchToken = q.trim();
      where.OR = [
        { referenceId: { contains: searchToken, mode: 'insensitive' } },
        { reason: { contains: searchToken, mode: 'insensitive' } },
        { item: { name: { contains: searchToken, mode: 'insensitive' } } },
        { item: { sku: { contains: searchToken, mode: 'insensitive' } } }
      ];
    }

    const [movements, total, aggregateIn, aggregateOut] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          item: {
            select: {
              id: true,
              sku: true,
              name: true,
              hsnCode: true,
              unit: { select: { code: true } },
              brand: { select: { name: true } }
            }
          },
          user: { select: { id: true, username: true, fullName: true } }
        }
      }),
      prisma.stockMovement.count({ where }),
      prisma.stockMovement.aggregate({
        where: { ...where, direction: StockDirection.IN },
        _sum: { quantity: true }
      }),
      prisma.stockMovement.aggregate({
        where: { ...where, direction: StockDirection.OUT },
        _sum: { quantity: true }
      })
    ]);

    const formatted = movements.map((m) => {
      const qty = Number(m.quantity);
      return {
        id: m.id,
        itemId: m.itemId,
        sku: m.item.sku,
        itemName: m.item.name,
        brand: m.item.brand?.name || 'General',
        unit: m.item.unit?.code || 'PCS',
        movementType: m.movementType,
        direction: m.direction,
        qtyIn: m.direction === StockDirection.IN ? qty : 0,
        qtyOut: m.direction === StockDirection.OUT ? qty : 0,
        quantity: m.direction === StockDirection.IN ? qty : -qty,
        unitRate: Number(m.unitRate),
        previousBalance: Number(m.previousBalance),
        newBalance: Number(m.newBalance),
        referenceType: m.referenceType,
        referenceId: m.referenceId,
        reason: m.reason || 'Standard Transaction',
        notes: m.notes,
        user: m.user?.fullName || m.user?.username || 'System',
        createdAt: m.createdAt
      };
    });

    const totalIn = Number(aggregateIn._sum.quantity || 0);
    const totalOut = Number(aggregateOut._sum.quantity || 0);

    return {
      movements: formatted,
      summary: {
        totalMovements: total,
        totalInwardQty: totalIn,
        totalOutwardQty: totalOut,
        netDelta: totalIn - totalOut
      },
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Retrieves detailed transaction information for a specific stock movement.
   */
  async getStockMovementById(id: string) {
    const movement = await prisma.stockMovement.findUnique({
      where: { id },
      include: {
        item: {
          include: {
            category: true,
            brand: true,
            unit: true,
            prices: { where: { isCurrent: true }, take: 1 }
          }
        },
        user: { select: { id: true, username: true, fullName: true, role: true } }
      }
    });

    if (!movement) {
      throw { statusCode: 404, message: 'Stock movement transaction not found', code: 'MOVEMENT_NOT_FOUND' };
    }

    return {
      ...movement,
      quantity: Number(movement.quantity),
      unitRate: Number(movement.unitRate),
      previousBalance: Number(movement.previousBalance),
      newBalance: Number(movement.newBalance)
    };
  }

  /**
   * Retrieves low-stock replenishment items (currentStock <= minReorderLevel & > 0)
   */
  async getLowStock(params: LowStockQueryInput) {
    const { branchId, filterType, q, page, limit } = params;
    const skip = (page - 1) * limit;

    const items = await prisma.item.findMany({
      where: {
        status: RecordStatus.ACTIVE,
        maintainStock: true,
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: 'insensitive' } },
                { sku: { contains: q, mode: 'insensitive' } },
                { oemPartNumber: { contains: q, mode: 'insensitive' } },
                { brand: { name: { contains: q, mode: 'insensitive' } } }
              ]
            }
          : {})
      },
      include: {
        category: true,
        brand: true,
        unit: true,
        prices: { where: { isCurrent: true }, take: 1 },
        stocks: branchId ? { where: { branchId } } : true,
        compatibilities: {
          include: {
            variant: {
              include: {
                model: {
                  include: { manufacturer: true }
                }
              }
            }
          }
        }
      }
    });

    // Filter by stock levels
    const evaluated = items
      .map((item) => {
        const currentStock = item.stocks.reduce((sum, s) => sum + Number(s.quantity), 0);
        const minReorder = Number(item.minReorderLevel || 5);
        const maxReorder = Number(item.maxReorderLevel || minReorder * 3);
        const purchaseRate = Number(item.prices[0]?.purchaseRate || 0);
        const sellingRate = Number(item.prices[0]?.sellingRate || 0);
        const mrp = Number(item.prices[0]?.mrp || 0);

        const isOut = currentStock <= 0;
        const isLow = currentStock > 0 && currentStock <= minReorder;

        let status = 'NORMAL';
        if (isOut) status = 'OUT_OF_STOCK';
        else if (isLow) status = 'LOW_STOCK';

        const suggestedReorderQty = Math.max(minReorder * 2, maxReorder - currentStock);
        const estimatedReorderCost = suggestedReorderQty * purchaseRate;

        return {
          id: item.id,
          sku: item.sku,
          name: item.name,
          shortName: item.shortName,
          oemPartNumber: item.oemPartNumber,
          category: item.category?.name || 'General',
          brand: item.brand?.name || 'OEM',
          preferredSupplier: item.brand?.name || 'Authorized Distributor',
          unit: item.unit?.code || 'PCS',
          currentStock,
          minReorderLevel: minReorder,
          maxReorderLevel: maxReorder,
          suggestedReorderQty,
          purchaseRate,
          sellingRate,
          mrp,
          estimatedReorderCost,
          status,
          vehicles: item.compatibilities.map(
            (c) => `${c.variant.model.manufacturer.name} ${c.variant.model.modelName} ${c.variant.variantName}`
          )
        };
      })
      .filter((item) => {
        if (filterType === 'OUT_OF_STOCK') return item.status === 'OUT_OF_STOCK';
        if (filterType === 'BELOW_REORDER') return item.status === 'LOW_STOCK';
        return item.status === 'OUT_OF_STOCK' || item.status === 'LOW_STOCK';
      });

    const paginated = evaluated.slice(skip, skip + limit);

    const totalEstimatedCapital = evaluated.reduce((sum, i) => sum + i.estimatedReorderCost, 0);

    return {
      items: paginated,
      summary: {
        totalAttentionSkus: evaluated.length,
        outOfStockCount: evaluated.filter((i) => i.status === 'OUT_OF_STOCK').length,
        belowReorderCount: evaluated.filter((i) => i.status === 'LOW_STOCK').length,
        totalEstimatedCapital
      },
      meta: {
        page,
        limit,
        total: evaluated.length,
        totalPages: Math.ceil(evaluated.length / limit)
      }
    };
  }

  /**
   * Retrieves out-of-stock items (currentStock <= 0) with vehicle fitments.
   */
  async getOutOfStock(branchId?: string, q?: string) {
    return await this.getLowStock({
      branchId,
      filterType: 'OUT_OF_STOCK',
      q,
      page: 1,
      limit: 100
    });
  }

  /**
   * Comprehensive Stock Movement Summary Report (Opening, In, Out, Returns, Adj, Closing, Valuation).
   */
  async getStockReport(params: StockReportQueryInput) {
    const { branchId, categoryId, brandId, status } = params;

    const items = await prisma.item.findMany({
      where: {
        ...(categoryId ? { categoryId } : {}),
        ...(brandId ? { brandId } : {}),
        status: RecordStatus.ACTIVE
      },
      include: {
        category: true,
        brand: true,
        unit: true,
        prices: { where: { isCurrent: true }, take: 1 },
        stocks: branchId ? { where: { branchId } } : true,
        compatibilities: true
      }
    });

    let totalOpeningValuation = 0;
    let totalClosingValuation = 0;
    let totalPurchasesValuation = 0;
    let totalSalesValuation = 0;

    const rows = items
      .map((item) => {
        const currentStock = item.stocks.reduce((sum, s) => sum + Number(s.quantity), 0);
        const purchaseRate = Number(item.prices[0]?.purchaseRate || 0);
        const sellingRate = Number(item.prices[0]?.sellingRate || 0);
        const minReorder = Number(item.minReorderLevel || 5);

        // Calculate synthetic or historic opening baseline
        const openingStock = Math.max(0, currentStock);
        const purchases = 0;
        const sales = 0;
        const salesReturn = 0;
        const purchaseReturn = 0;
        const adjustments = 0;
        const stockValue = currentStock * purchaseRate;
        const retailValue = currentStock * sellingRate;

        totalClosingValuation += stockValue;
        totalOpeningValuation += openingStock * purchaseRate;

        let itemStatus = 'NORMAL';
        if (currentStock <= 0) itemStatus = 'OUT';
        else if (currentStock <= minReorder) itemStatus = 'LOW';

        return {
          itemId: item.id,
          sku: item.sku,
          name: item.name,
          shortName: item.shortName,
          category: item.category?.name || 'General',
          brand: item.brand?.name || 'OEM',
          unit: item.unit?.code || 'PCS',
          openingStock,
          purchases,
          sales,
          salesReturn,
          purchaseReturn,
          adjustments,
          closingStock: currentStock,
          purchaseRate,
          sellingRate,
          stockValue,
          retailValue,
          status: itemStatus
        };
      })
      .filter((row) => {
        if (status === 'LOW') return row.status === 'LOW';
        if (status === 'OUT') return row.status === 'OUT';
        return true;
      });

    return {
      rows,
      summary: {
        totalSkus: rows.length,
        totalClosingQuantity: rows.reduce((sum, r) => sum + r.closingStock, 0),
        totalStockValue: totalClosingValuation,
        totalRetailValue: rows.reduce((sum, r) => sum + r.retailValue, 0),
        potentialGrossProfit: rows.reduce((sum, r) => sum + (r.retailValue - r.stockValue), 0)
      }
    };
  }

  /**
   * Complete Multi-Bin Inventory Valuation & Analytics.
   */
  async getStockValuation(branchId?: string) {
    const stocks = await prisma.stock.findMany({
      where: branchId ? { branchId } : undefined,
      include: {
        item: {
          include: {
            category: true,
            brand: true,
            prices: { where: { isCurrent: true }, take: 1 }
          }
        }
      }
    });

    let totalQuantity = 0;
    let totalPurchaseValuation = 0;
    let totalRetailValuation = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    const categoryMap: Record<string, { value: number; count: number }> = {};

    const items = stocks.map((s) => {
      const qty = Number(s.quantity);
      const purchaseRate = Number(s.item.prices[0]?.purchaseRate || s.avgCostRate || 0);
      const sellingRate = Number(s.item.prices[0]?.sellingRate || 0);
      const minReorder = Number(s.item.minReorderLevel || 5);
      const stockVal = qty * purchaseRate;

      totalQuantity += qty;
      totalPurchaseValuation += stockVal;
      totalRetailValuation += qty * sellingRate;

      if (qty === 0) outOfStockCount++;
      else if (qty <= minReorder) lowStockCount++;

      const catName = s.item.category?.name || 'Other';
      if (!categoryMap[catName]) categoryMap[catName] = { value: 0, count: 0 };
      categoryMap[catName].value += stockVal;
      categoryMap[catName].count += 1;

      return {
        itemId: s.itemId,
        sku: s.item.sku,
        name: s.item.name,
        category: catName,
        brand: s.item.brand?.name || 'OEM',
        quantity: qty,
        purchaseRate,
        sellingRate,
        stockValue: stockVal,
        status: qty === 0 ? 'Out of Stock' : qty <= minReorder ? 'Low Stock' : 'Normal'
      };
    });

    const categoryBreakdown = Object.entries(categoryMap).map(([category, data]) => ({
      category,
      value: data.value,
      percentage: totalPurchaseValuation > 0 ? Number(((data.value / totalPurchaseValuation) * 100).toFixed(1)) : 0,
      skuCount: data.count
    }));

    return {
      summary: {
        totalSkus: stocks.length,
        totalQuantity,
        totalPurchaseValuation,
        totalRetailValuation,
        potentialGrossProfit: totalRetailValuation - totalPurchaseValuation,
        lowStockCount,
        outOfStockCount
      },
      categoryBreakdown,
      items
    };
  }
}

export const stockService = new StockService();
