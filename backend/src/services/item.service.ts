import { prisma } from '../config/database.js';
import {
  CreateItemInput,
  ItemSearchQueryInput,
  UpdateItemInput,
  ImportItemRowInput,
  ExportItemsQueryInput
} from '../validators/item.validator.js';
import { RecordStatus, AuditSeverity, StockMovementType, StockDirection } from '@prisma/client';
import { recordAuditLog } from '../middleware/auditLogger.js';

export class ItemService {
  /**
   * Fast multi-token search for 50,000+ spare parts.
   * Supports multi-string queries like "Pulsar 150 clutch", part numbers, barcodes, HSN, and vehicles.
   */
  async searchItems(params: ItemSearchQueryInput, branchId?: string) {
    const {
      q,
      categoryId,
      brandId,
      vehicleModelId,
      vehicleVariantId,
      status,
      stockStatus,
      page,
      limit,
      sortBy,
      sortOrder
    } = params;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (status) {
      where.status = status;
    } else {
      where.status = RecordStatus.ACTIVE;
    }

    if (categoryId) where.categoryId = categoryId;
    if (brandId) where.brandId = brandId;

    if (vehicleVariantId) {
      where.compatibilities = { some: { variantId: vehicleVariantId } };
    } else if (vehicleModelId) {
      where.compatibilities = { some: { variant: { modelId: vehicleModelId } } };
    }

    // Multi-keyword tokenized search e.g. "Pulsar 150 clutch"
    if (q && q.trim()) {
      const searchTokens = q.trim().split(/\s+/).filter(Boolean);
      
      where.AND = searchTokens.map((token) => ({
        OR: [
          { sku: { contains: token, mode: 'insensitive' } },
          { name: { contains: token, mode: 'insensitive' } },
          { shortName: { contains: token, mode: 'insensitive' } },
          { oemPartNumber: { contains: token, mode: 'insensitive' } },
          { hsnCode: { contains: token, mode: 'insensitive' } },
          { barcodes: { some: { barcode: { contains: token, mode: 'insensitive' } } } },
          { brand: { name: { contains: token, mode: 'insensitive' } } },
          { category: { name: { contains: token, mode: 'insensitive' } } },
          {
            compatibilities: {
              some: {
                variant: {
                  OR: [
                    { variantName: { contains: token, mode: 'insensitive' } },
                    { model: { modelName: { contains: token, mode: 'insensitive' } } },
                    { model: { manufacturer: { name: { contains: token, mode: 'insensitive' } } } }
                  ]
                }
              }
            }
          }
        ]
      }));
    }

    // Sorting column mapping
    const orderClause: any = {};
    if (sortBy === 'sellingRate') {
      orderClause.prices = { sellingRate: sortOrder };
    } else {
      orderClause[sortBy] = sortOrder;
    }

    const [items, total] = await Promise.all([
      prisma.item.findMany({
        where,
        skip,
        take: limit,
        orderBy: orderClause,
        include: {
          category: { select: { id: true, name: true, code: true } },
          brand: { select: { id: true, name: true, isOem: true } },
          unit: { select: { id: true, code: true, name: true } },
          prices: {
            where: { isCurrent: true },
            take: 1
          },
          barcodes: {
            select: { id: true, barcode: true, barcodeType: true, isPrimary: true }
          },
          stocks: {
            where: branchId ? { branchId } : undefined,
            include: {
              rackBin: { select: { id: true, binCode: true, zone: true, rack: true, shelf: true } }
            }
          },
          compatibilities: {
            include: {
              variant: {
                include: {
                  model: {
                    include: {
                      manufacturer: true
                    }
                  }
                }
              }
            }
          }
        }
      }),
      prisma.item.count({ where })
    ]);

    // Format results with stock status
    const formattedItems = items.map((item) => {
      const currentPrice = item.prices[0];
      const stockObj = item.stocks[0];
      const currentStock = stockObj ? Number(stockObj.quantity) : 0;
      const minReorder = Number(item.minReorderLevel);

      let stockState = 'Normal';
      if (currentStock === 0) stockState = 'Out of Stock';
      else if (currentStock <= minReorder) stockState = 'Low Stock';

      return {
        id: item.id,
        sku: item.sku,
        name: item.name,
        shortName: item.shortName || '',
        oemPartNumber: item.oemPartNumber || item.sku,
        hsnCode: item.hsnCode,
        category: item.category.name,
        categoryId: item.category.id,
        brand: item.brand.name,
        brandId: item.brand.id,
        isOem: item.brand.isOem,
        unit: item.unit.code,
        gstRate: Number(item.gstRate),
        maintainStock: item.maintainStock,
        mrp: currentPrice ? Number(currentPrice.mrp) : 0,
        purchaseRate: currentPrice ? Number(currentPrice.purchaseRate) : 0,
        sellingRate: currentPrice ? Number(currentPrice.sellingRate) : 0,
        garageRate: currentPrice?.garageRate ? Number(currentPrice.garageRate) : 0,
        wholesaleRate: currentPrice?.wholesaleRate ? Number(currentPrice.wholesaleRate) : 0,
        barcodes: item.barcodes,
        primaryBarcode: item.barcodes.find((b) => b.isPrimary)?.barcode || item.barcodes[0]?.barcode || '',
        rackBin: stockObj?.rackBin?.binCode || 'Unassigned',
        currentStock,
        minReorder,
        imageUrl: item.imageUrl || null,
        customField1: item.customField1 || null,
        customField2: item.customField2 || null,
        customField3: item.customField3 || null,
        customField4: item.customField4 || null,
        customField5: item.customField5 || null,
        status: item.status,
        stockState,
        compatibilities: item.compatibilities.map((c) => ({
          variantId: c.variantId,
          variantName: c.variant.variantName,
          model: c.variant.model.modelName,
          manufacturer: c.variant.model.manufacturer.name,
          fitmentNotes: c.fitmentNotes
        }))
      };
    });

    return {
      items: formattedItems,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get single item by ID with complete price history, all barcodes, vehicle mappings, and stock.
   */
  async getItemById(id: string) {
    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        unit: true,
        prices: {
          orderBy: { effectiveDate: 'desc' }
        },
        barcodes: true,
        stocks: {
          include: { branch: true, rackBin: true }
        },
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

    if (!item) throw { statusCode: 404, message: 'Item not found' };

    const currentPrice = item.prices.find((p) => p.isCurrent) || item.prices[0];

    return {
      id: item.id,
      sku: item.sku,
      name: item.name,
      shortName: item.shortName,
      oemPartNumber: item.oemPartNumber,
      hsnCode: item.hsnCode,
      categoryId: item.categoryId,
      categoryName: item.category.name,
      brandId: item.brandId,
      brandName: item.brand.name,
      unitId: item.unitId,
      unitCode: item.unit.code,
      gstRate: Number(item.gstRate),
      maintainStock: item.maintainStock,
      minReorderLevel: Number(item.minReorderLevel),
      maxReorderLevel: item.maxReorderLevel ? Number(item.maxReorderLevel) : null,
      imageUrl: item.imageUrl,
      customField1: item.customField1,
      customField2: item.customField2,
      customField3: item.customField3,
      customField4: item.customField4,
      customField5: item.customField5,
      status: item.status,
      currentPrice: currentPrice
        ? {
            mrp: Number(currentPrice.mrp),
            purchaseRate: Number(currentPrice.purchaseRate),
            sellingRate: Number(currentPrice.sellingRate),
            garageRate: currentPrice.garageRate ? Number(currentPrice.garageRate) : null,
            wholesaleRate: currentPrice.wholesaleRate ? Number(currentPrice.wholesaleRate) : null,
            effectiveDate: currentPrice.effectiveDate
          }
        : null,
      priceHistory: item.prices.map((p) => ({
        id: p.id,
        mrp: Number(p.mrp),
        purchaseRate: Number(p.purchaseRate),
        sellingRate: Number(p.sellingRate),
        garageRate: p.garageRate ? Number(p.garageRate) : null,
        isCurrent: p.isCurrent,
        effectiveDate: p.effectiveDate
      })),
      barcodes: item.barcodes,
      stocks: item.stocks.map((s) => ({
        branchId: s.branchId,
        branchName: s.branch.name,
        quantity: Number(s.quantity),
        binCode: s.rackBin?.binCode || 'Unassigned'
      })),
      compatibilities: item.compatibilities.map((c) => ({
        id: c.id,
        variantId: c.variantId,
        variantName: c.variant.variantName,
        modelName: c.variant.model.modelName,
        manufacturerName: c.variant.model.manufacturer.name,
        fitmentNotes: c.fitmentNotes
      }))
    };
  }

  /**
   * Fast barcode lookup for scanner integration.
   */
  async getItemByBarcode(barcode: string, branchId?: string) {
    const barcodeRecord = await prisma.itemBarcode.findUnique({
      where: { barcode },
      include: {
        item: {
          include: {
            category: true,
            brand: true,
            unit: true,
            prices: { where: { isCurrent: true }, take: 1 },
            stocks: { where: branchId ? { branchId } : undefined, include: { rackBin: true } }
          }
        }
      }
    });

    if (!barcodeRecord) throw { statusCode: 404, message: `No item found for barcode '${barcode}'` };

    const item = barcodeRecord.item;
    const currentPrice = item.prices[0];
    const stockObj = item.stocks[0];

    return {
      id: item.id,
      sku: item.sku,
      name: item.name,
      shortName: item.shortName,
      oemPartNumber: item.oemPartNumber,
      hsnCode: item.hsnCode,
      category: item.category.name,
      brand: item.brand.name,
      unit: item.unit.code,
      gstRate: Number(item.gstRate),
      mrp: currentPrice ? Number(currentPrice.mrp) : 0,
      sellingRate: currentPrice ? Number(currentPrice.sellingRate) : 0,
      purchaseRate: currentPrice ? Number(currentPrice.purchaseRate) : 0,
      barcode: barcodeRecord.barcode,
      currentStock: stockObj ? Number(stockObj.quantity) : 0,
      rackBin: stockObj?.rackBin?.binCode || 'Unassigned'
    };
  }

  /**
   * Create new spare part SKU with atomic price, barcode, vehicle fitment, and audit logging.
   */
  async createItem(input: CreateItemInput, actor?: { userId: string; username: string }, branchId?: string) {
    // Uniqueness validation on SKU
    const existing = await prisma.item.findUnique({ where: { sku: input.sku } });
    if (existing) throw { statusCode: 400, message: `Item code / SKU '${input.sku}' is already registered` };

    // Check barcode uniqueness if provided
    if (input.barcode) {
      const existingBarcode = await prisma.itemBarcode.findUnique({ where: { barcode: input.barcode } });
      if (existingBarcode) throw { statusCode: 400, message: `Barcode '${input.barcode}' is already in use` };
    }

    return await prisma.$transaction(async (tx) => {
      let resolvedUnitId = input.unitId;
      if (!resolvedUnitId) {
        const defaultUnit = await tx.unit.findFirst();
        resolvedUnitId = defaultUnit?.id || '';
      }

      // 1. Create item record
      const item = await tx.item.create({
        data: {
          sku: input.sku,
          name: input.name,
          shortName: input.shortName,
          oemPartNumber: input.oemPartNumber || input.sku,
          hsnCode: input.hsnCode,
          categoryId: input.categoryId,
          brandId: input.brandId,
          unitId: resolvedUnitId,
          gstRate: input.gstRate,
          maintainStock: input.maintainStock,
          minReorderLevel: input.minReorderLevel,
          maxReorderLevel: input.maxReorderLevel,
          imageUrl: input.imageUrl,
          customField1: input.customField1,
          customField2: input.customField2,
          customField3: input.customField3,
          customField4: input.customField4,
          customField5: input.customField5,
          status: input.status
        }
      });

      // 2. Initial Price Record
      await tx.itemPrice.create({
        data: {
          itemId: item.id,
          mrp: input.mrp,
          purchaseRate: input.purchaseRate,
          sellingRate: input.sellingRate,
          garageRate: input.garageRate,
          wholesaleRate: input.wholesaleRate,
          isCurrent: true
        }
      });

      // 3. Barcodes
      if (input.barcodes && input.barcodes.length > 0) {
        await tx.itemBarcode.createMany({
          data: input.barcodes.map((b, idx) => ({
            itemId: item.id,
            barcode: b.barcode,
            barcodeType: b.barcodeType || 'CODE128',
            isPrimary: b.isPrimary || idx === 0
          }))
        });
      } else if (input.barcode) {
        await tx.itemBarcode.create({
          data: {
            itemId: item.id,
            barcode: input.barcode,
            barcodeType: 'CODE128',
            isPrimary: true
          }
        });
      }

      // 4. Vehicle Compatibilities
      if (input.vehicleVariantIds && input.vehicleVariantIds.length > 0) {
        await tx.itemVehicleCompatibility.createMany({
          data: input.vehicleVariantIds.map((variantId) => ({
            itemId: item.id,
            variantId
          }))
        });
      }

      // 5. Initial opening stock if provided
      if (branchId && input.initialStock > 0) {
        await tx.stock.create({
          data: {
            itemId: item.id,
            branchId,
            rackBinId: input.rackBinId,
            quantity: input.initialStock,
            avgCostRate: input.purchaseRate
          }
        });

        await tx.stockMovement.create({
          data: {
            itemId: item.id,
            branchId,
            userId: actor?.userId,
            movementType: StockMovementType.OPENING_STOCK,
            direction: StockDirection.IN,
            quantity: input.initialStock,
            unitRate: input.purchaseRate,
            previousBalance: 0,
            newBalance: input.initialStock,
            referenceType: 'ITEM_CREATION',
            referenceId: item.sku,
            notes: 'Initial opening stock ledger entry'
          }
        });
      }

      if (actor) {
        await recordAuditLog({
          userId: actor.userId,
          username: actor.username,
          action: 'Item Created',
          module: 'Inventory',
          entity: 'Item',
          entityId: item.id,
          newValue: JSON.stringify({
            sku: item.sku,
            name: item.name,
            sellingRate: input.sellingRate,
            mrp: input.mrp,
            hsn: item.hsnCode,
            gst: item.gstRate
          }),
          notes: `Created new item SKU '${item.sku}' - ${item.name}`,
          severity: AuditSeverity.INFO
        });
      }

      return item;
    });
  }

  /**
   * Update item master details, prices, and maintain auditable price history.
   */
  async updateItem(id: string, input: UpdateItemInput, actor?: { userId: string; username: string }) {
    const existing = await prisma.item.findUnique({
      where: { id },
      include: {
        prices: { where: { isCurrent: true }, take: 1 }
      }
    });
    if (!existing) throw { statusCode: 404, message: 'Item not found' };

    const oldPrice = existing.prices[0];

    return await prisma.$transaction(async (tx) => {
      const updateData: any = {};
      if (input.name) updateData.name = input.name;
      if (input.shortName !== undefined) updateData.shortName = input.shortName;
      if (input.oemPartNumber !== undefined) updateData.oemPartNumber = input.oemPartNumber;
      if (input.hsnCode) updateData.hsnCode = input.hsnCode;
      if (input.categoryId) updateData.categoryId = input.categoryId;
      if (input.brandId) updateData.brandId = input.brandId;
      if (input.unitId) updateData.unitId = input.unitId;
      if (input.gstRate !== undefined) updateData.gstRate = input.gstRate;
      if (input.maintainStock !== undefined) updateData.maintainStock = input.maintainStock;
      if (input.minReorderLevel !== undefined) updateData.minReorderLevel = input.minReorderLevel;
      if (input.maxReorderLevel !== undefined) updateData.maxReorderLevel = input.maxReorderLevel;
      if (input.imageUrl !== undefined) updateData.imageUrl = input.imageUrl;
      if (input.customField1 !== undefined) updateData.customField1 = input.customField1;
      if (input.customField2 !== undefined) updateData.customField2 = input.customField2;
      if (input.customField3 !== undefined) updateData.customField3 = input.customField3;
      if (input.customField4 !== undefined) updateData.customField4 = input.customField4;
      if (input.customField5 !== undefined) updateData.customField5 = input.customField5;
      if (input.status) updateData.status = input.status;

      const updated = await tx.item.update({
        where: { id },
        data: updateData
      });

      // Price modification with price history archiving
      const isPriceModified =
        (input.mrp !== undefined && oldPrice && Number(oldPrice.mrp) !== Number(input.mrp)) ||
        (input.sellingRate !== undefined && oldPrice && Number(oldPrice.sellingRate) !== Number(input.sellingRate)) ||
        (input.purchaseRate !== undefined && oldPrice && Number(oldPrice.purchaseRate) !== Number(input.purchaseRate));

      if (isPriceModified) {
        await tx.itemPrice.updateMany({
          where: { itemId: id, isCurrent: true },
          data: { isCurrent: false }
        });

        await tx.itemPrice.create({
          data: {
            itemId: id,
            mrp: input.mrp !== undefined ? input.mrp : oldPrice.mrp,
            purchaseRate: input.purchaseRate !== undefined ? input.purchaseRate : oldPrice.purchaseRate,
            sellingRate: input.sellingRate !== undefined ? input.sellingRate : oldPrice.sellingRate,
            garageRate: input.garageRate !== undefined ? input.garageRate : oldPrice.garageRate,
            wholesaleRate: input.wholesaleRate !== undefined ? input.wholesaleRate : oldPrice.wholesaleRate,
            isCurrent: true
          }
        });

        if (actor) {
          await recordAuditLog({
            userId: actor.userId,
            username: actor.username,
            action: 'Rate Modification',
            module: 'Inventory',
            entity: 'ItemPrice',
            entityId: id,
            previousValue: JSON.stringify({
              mrp: oldPrice?.mrp,
              purchaseRate: oldPrice?.purchaseRate,
              sellingRate: oldPrice?.sellingRate
            }),
            newValue: JSON.stringify({
              mrp: input.mrp || oldPrice?.mrp,
              purchaseRate: input.purchaseRate || oldPrice?.purchaseRate,
              sellingRate: input.sellingRate || oldPrice?.sellingRate
            }),
            notes: `Updated pricing rates for SKU '${existing.sku}' (${existing.name})`,
            severity: AuditSeverity.WARNING
          });
        }
      }

      // Update vehicle compatibilities if provided
      if (input.vehicleVariantIds) {
        await tx.itemVehicleCompatibility.deleteMany({ where: { itemId: id } });
        if (input.vehicleVariantIds.length > 0) {
          await tx.itemVehicleCompatibility.createMany({
            data: input.vehicleVariantIds.map((variantId) => ({ itemId: id, variantId }))
          });
        }
      }

      if (actor && !isPriceModified) {
        await recordAuditLog({
          userId: actor.userId,
          username: actor.username,
          action: 'Item Updated',
          module: 'Inventory',
          entity: 'Item',
          entityId: updated.id,
          notes: `Updated item details for SKU '${updated.sku}'`,
          severity: AuditSeverity.INFO
        });
      }

      return updated;
    });
  }

  /**
   * Toggle Item Active/Inactive status.
   */
  async toggleStatus(id: string, actor?: { userId: string; username: string }) {
    const item = await prisma.item.findUnique({ where: { id } });
    if (!item) throw { statusCode: 404, message: 'Item not found' };

    const newStatus = item.status === RecordStatus.ACTIVE ? RecordStatus.INACTIVE : RecordStatus.ACTIVE;
    const updated = await prisma.item.update({
      where: { id },
      data: { status: newStatus }
    });

    if (actor) {
      await recordAuditLog({
        userId: actor.userId,
        username: actor.username,
        action: newStatus === RecordStatus.ACTIVE ? 'Item Activated' : 'Item Deactivated',
        module: 'Inventory',
        entity: 'Item',
        entityId: item.id,
        notes: `Toggled status of SKU '${item.sku}' to ${newStatus}`,
        severity: AuditSeverity.INFO
      });
    }

    return updated;
  }

  /**
   * Batch Import items with column validation, error reporting, and duplicate detection.
   */
  async importItems(rows: ImportItemRowInput[], actor?: { userId: string; username: string }) {
    const summary = {
      total: rows.length,
      valid: 0,
      warning: 0,
      errors: 0,
      duplicates: 0,
      errorReport: [] as Array<{ row: number; sku: string; error: string }>
    };

    // Preload categories, brands, units for efficient caching
    const [categories, brands, units, existingSkus, existingBarcodes] = await Promise.all([
      prisma.category.findMany(),
      prisma.brand.findMany(),
      prisma.unit.findMany(),
      prisma.item.findMany({ select: { sku: true } }),
      prisma.itemBarcode.findMany({ select: { barcode: true } })
    ]);

    const catMap = new Map(categories.map((c) => [c.name.toLowerCase(), c.id]));
    const brandMap = new Map(brands.map((b) => [b.name.toLowerCase(), b.id]));
    const unitMap = new Map(units.map((u) => [u.code.toLowerCase(), u.id]));
    const registeredSkus = new Set(existingSkus.map((s) => s.sku.toUpperCase()));
    const registeredBarcodes = new Set(existingBarcodes.map((b) => b.barcode));

    const defaultUnitId = units[0]?.id;
    const defaultCatId = categories[0]?.id;
    const defaultBrandId = brands[0]?.id;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 1;

      // Validation
      if (!row.sku || !row.name) {
        summary.errors++;
        summary.errorReport.push({ row: rowNum, sku: row.sku || 'N/A', error: 'Missing SKU or Item Name' });
        continue;
      }

      if (registeredSkus.has(row.sku.toUpperCase())) {
        summary.duplicates++;
        summary.errorReport.push({ row: rowNum, sku: row.sku, error: 'Duplicate SKU already exists' });
        continue;
      }

      if (row.barcode && registeredBarcodes.has(row.barcode)) {
        summary.warning++;
        summary.errorReport.push({ row: rowNum, sku: row.sku, error: `Barcode '${row.barcode}' already registered` });
      }

      // Resolve relations or use fallback defaults
      let catId = catMap.get(row.category.toLowerCase()) || defaultCatId;
      let brandId = brandMap.get(row.brand.toLowerCase()) || defaultBrandId;
      let unitId = unitMap.get(row.unit.toLowerCase()) || defaultUnitId;

      try {
        await prisma.$transaction(async (tx) => {
          const item = await tx.item.create({
            data: {
              sku: row.sku.toUpperCase(),
              name: row.name,
              shortName: row.shortName,
              oemPartNumber: row.partNumber || row.sku.toUpperCase(),
              hsnCode: row.hsn || '8714',
              categoryId: catId,
              brandId: brandId,
              unitId: unitId,
              gstRate: row.gstRate || 18,
              maintainStock: row.maintainStock !== undefined ? row.maintainStock : true,
              customField1: row.customField1,
              customField2: row.customField2,
              customField3: row.customField3,
              customField4: row.customField4,
              customField5: row.customField5
            }
          });

          await tx.itemPrice.create({
            data: {
              itemId: item.id,
              mrp: row.mrp,
              purchaseRate: row.purchaseRate,
              sellingRate: row.sellingRate,
              isCurrent: true
            }
          });

          if (row.barcode && !registeredBarcodes.has(row.barcode)) {
            await tx.itemBarcode.create({
              data: {
                itemId: item.id,
                barcode: row.barcode,
                isPrimary: true
              }
            });
            registeredBarcodes.add(row.barcode);
          }
        });

        registeredSkus.add(row.sku.toUpperCase());
        summary.valid++;
      } catch (err: any) {
        summary.errors++;
        summary.errorReport.push({ row: rowNum, sku: row.sku, error: err?.message || 'Database error during insert' });
      }
    }

    if (actor) {
      await recordAuditLog({
        userId: actor.userId,
        username: actor.username,
        action: 'Items Batch Imported',
        module: 'Inventory',
        entity: 'Item',
        newValue: JSON.stringify({
          total: summary.total,
          imported: summary.valid,
          duplicates: summary.duplicates,
          errors: summary.errors
        }),
        notes: `Imported ${summary.valid} items (${summary.duplicates} duplicates, ${summary.errors} errors)`,
        severity: summary.errors > 0 ? AuditSeverity.WARNING : AuditSeverity.INFO
      });
    }

    return summary;
  }

  /**
   * Export items with formatted pricing, barcodes, and vehicle fitment.
   */
  async exportItems(query: ExportItemsQueryInput) {
    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.brandId) where.brandId = query.brandId;
    if (query.selectedIds && query.selectedIds.length > 0) {
      where.id = { in: query.selectedIds };
    }

    if (query.q && query.q.trim()) {
      const q = query.q.trim();
      where.OR = [
        { sku: { contains: q, mode: 'insensitive' } },
        { name: { contains: q, mode: 'insensitive' } },
        { oemPartNumber: { contains: q, mode: 'insensitive' } }
      ];
    }

    const items = await prisma.item.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        category: true,
        brand: true,
        unit: true,
        prices: { where: { isCurrent: true }, take: 1 },
        barcodes: { where: { isPrimary: true }, take: 1 },
        compatibilities: {
          include: {
            variant: {
              include: { model: { include: { manufacturer: true } } }
            }
          }
        }
      }
    });

    return items.map((item) => {
      const price = item.prices[0];
      const vehicleNames = item.compatibilities.map(
        (c) => `${c.variant.model.manufacturer.name} ${c.variant.model.modelName} ${c.variant.variantName}`
      );

      return {
        SKU: item.sku,
        Name: item.name,
        ShortName: item.shortName || '',
        PartNumber: item.oemPartNumber || '',
        Category: item.category.name,
        Brand: item.brand.name,
        Unit: item.unit.code,
        HSN: item.hsnCode,
        GSTRate: Number(item.gstRate),
        MRP: price ? Number(price.mrp) : 0,
        PurchaseRate: price ? Number(price.purchaseRate) : 0,
        SellingRate: price ? Number(price.sellingRate) : 0,
        Barcode: item.barcodes[0]?.barcode || '',
        MaintainStock: item.maintainStock ? 'YES' : 'NO',
        Status: item.status,
        Vehicles: vehicleNames.join(', '),
        CustomField1: item.customField1 || '',
        CustomField2: item.customField2 || '',
        CustomField3: item.customField3 || '',
        CustomField4: item.customField4 || '',
        CustomField5: item.customField5 || ''
      };
    });
  }
}

export const itemService = new ItemService();

