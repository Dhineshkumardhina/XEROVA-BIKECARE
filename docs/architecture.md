# BIKE ERP - Architecture Specification & Production Guide

## 1. System Overview

BIKE ERP is a multi-outlet motorcycle spare-parts ERP and Point of Sale (POS) system designed for retailers, wholesalers, mechanics, workshops, and multi-tier distributors. It is engineered to support 50,000+ spare-part SKUs, high-concurrency counter billing, indexed multi-field search, auditable stock ledger movements, and GST compliance.

```
┌─────────────────────────────────────────────────────────────┐
│                      Stitch React UI                        │
│   (Fast POS, Item Master, Vehicle Matrix, Ledgers, GST, CRM)│
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / JSON / JWT Bearer
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Express TypeScript REST API                 │
│  ┌───────────────────────┐       ┌───────────────────────┐  │
│  │ Helmet, CORS, Limiter │       │ JWT Auth & Granular   │  │
│  │ Audit Logger          │       │ RBAC Middleware       │  │
│  └───────────┬───────────┘       └───────────┬───────────┘  │
│              ▼                               ▼              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │   Zod Validators & Business Services (Transactions)   │  │
│  └───────────────────────────┬───────────────────────────┘  │
└──────────────────────────────┼──────────────────────────────┘
                               │ Prisma ORM / SQL Engine
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                PostgreSQL Normalized Database               │
│   (Decimal Currency, StockMovement Ledger, B-Tree Indexes)  │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Core Architectural Pillars

### A. Auditable Stock Movement Ledger (No Blind Quantity Overrides)
Every transaction that affects inventory (Counter POS sale, Supplier PO Receipt, Sales Return, Supplier Return, Audit Adjustment, or Opening Stock) creates an immutable `StockMovement` record containing:
- `itemId`, `branchId`, `userId`
- `movementType` (`SALE`, `PURCHASE`, `ADJUSTMENT`, `SALE_RETURN`, `PURCHASE_RETURN`, `OPENING_STOCK`)
- `direction` (`IN` vs `OUT`)
- `quantity` (Decimal)
- `unitRate` (Decimal Landed / Selling Rate)
- `previousBalance` & `newBalance`
- `referenceType` & `referenceId` (e.g. `INV/2026-27/00124`, `PO-8412`, `ADJ-102931`)
- `reason` & `notes`

### B. Accurate Money Handling (PostgreSQL `Decimal(12, 2)`)
To avoid IEEE 754 floating-point rounding errors in retail sales, taxes, and accounting:
- All monetary amounts (rates, taxes, discounts, totals, balances) are stored as PostgreSQL `Decimal(12, 2)`.
- Centralized tax calculation ensures CGST/SGST/IGST roundoff follows Indian GST statutory guidelines.

### C. Fast Indexed Search Engine
To support 50,000+ catalog SKUs, partial and mid-string searches use B-Tree indexes across:
- `sku` (e.g., `BP-1234`)
- `name` (e.g., `Pulsar 150 Front Disc Pad Set`)
- `oemPartNumber` (e.g., `DJ-151074`)
- `barcodes` (e.g., `8901234567890`)
- `hsnCode` (`8714`)
- `brand` and `category`
- `vehicleVariants` (`Pulsar 150 BS6`)

### D. Centralized Audit Logging
Sensitive operations (Logins, Voids, Deletions, Rate Overrides, Reversals, Stock Adjustments, User Permissions) are automatically captured by the `AuditLog` service with:
- Timestamp, IP address, user agent, module, entity, previous value, new value, and severity.

### E. Financial Integrity: Deletion vs. Void / Reversal
Financial documents (sales invoices, purchase bills, receipts, payment vouchers) are **never permanently deleted**. Instead, they are transitioned to `VOID` or `REVERSED` with mandatory audit justification and automatic inventory/ledger balancing.

---

## 3. Role-Based Access Control (RBAC) Matrix

| Permission | Super Admin | Store Admin | Store Manager | Billing Operator | Purchase Operator | Inventory Operator | Accounts Operator |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `sales.create` (POS Bills) | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `sales.void` (Void Invoices) | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `sales.view_profit` (Margins)| ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `purchase.create` (Inward GRN)| ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| `purchase.view_cost` | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| `inventory.create_item` | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| `inventory.adjust_stock` | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| `accounts.create_receipt` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| `accounts.create_payment` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| `accounts.banking` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| `admin.manage_users` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `admin.backup` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `admin.restore` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `admin.audit_logs` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
