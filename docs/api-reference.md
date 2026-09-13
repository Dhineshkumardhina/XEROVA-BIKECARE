# BIKE ERP - REST API Reference

Base URL: `http://localhost:5000/api`

---

## 1. Authentication Endpoints

### `POST /api/auth/login`
Authenticates user credentials and returns JWT access and refresh tokens.

**Request Body:**
```json
{
  "username": "admin",
  "password": "Admin@BikeERP2026!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Authentication successful",
  "data": {
    "user": {
      "id": "c1f7a29e-...",
      "username": "admin",
      "email": "admin@bikecare.erp",
      "fullName": "Rajesh Kumar (Super Admin)",
      "role": "SUPER_ADMIN",
      "roleDisplayName": "Super Admin",
      "permissions": ["sales.create", "inventory.create_item", "..."]
    },
    "tokens": {
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "eyJhbGciOi..."
    }
  }
}
```

---

### `POST /api/auth/refresh`
Rotates refresh tokens and issues a new access token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOi..."
}
```

---

### `GET /api/auth/me`
*Headers: `Authorization: Bearer <accessToken>`*

Returns current authenticated user profile and permissions.

---

### `POST /api/auth/logout`
*Headers: `Authorization: Bearer <accessToken>`*

Revokes active refresh tokens.

---

## 2. Items & Fast Search Endpoints

### `GET /api/items/search`
*Headers: `Authorization: Bearer <accessToken>`*

**Query Parameters:**
- `q`: Search keyword (`BP-1234`, `Pulsar 150`, `890123`, `clutch`)
- `categoryId`: UUID filter
- `brandId`: UUID filter
- `page`: default `1`
- `limit`: default `20`

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "item-uuid-1",
      "sku": "BP-1234",
      "name": "Bajaj Pulsar 150 Front Disc Pad Set",
      "shortName": "Pulsar 150 Disc Pad",
      "oemPartNumber": "DJ-151074",
      "hsnCode": "8714",
      "category": "Braking & Discs",
      "brand": "Bajaj Genuine Parts",
      "gstRate": 18.00,
      "mrp": 480.00,
      "purchaseRate": 280.00,
      "sellingRate": 450.00,
      "currentStock": 42,
      "rackBin": "B-01-A1",
      "status": "Normal"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

---

### `POST /api/items`
*Headers: `Authorization: Bearer <accessToken>` (Requires `inventory.create_item`)*

**Request Body:**
```json
{
  "sku": "BP-9988",
  "name": "Apache RTR 160 Rear Brake Master Cylinder Kit",
  "hsnCode": "8714",
  "categoryId": "cat-uuid",
  "brandId": "brand-uuid",
  "unitId": "unit-uuid",
  "gstRate": 18,
  "mrp": 750.00,
  "purchaseRate": 440.00,
  "sellingRate": 680.00,
  "initialStock": 15,
  "rackBinId": "bin-uuid"
}
```

---

## 3. Stock & Inventory Ledger Endpoints

### `GET /api/stock/valuation`
Returns total inventory value at purchase rate vs. selling rate, potential gross margins, and low stock counters.

---

### `GET /api/stock/movements`
Returns auditable chronological stock movements with previous vs. new balance and reference numbers.

---

### `POST /api/stock/adjust`
*Headers: `Authorization: Bearer <accessToken>` (Requires `inventory.adjust_stock`)*

**Request Body:**
```json
{
  "itemId": "item-uuid",
  "direction": "OUT",
  "quantity": 2,
  "reason": "DAMAGED_IN_RACK",
  "notes": "Lining cracked during bay reorganizing"
}
```

---

## 4. User Management Endpoints

### `GET /api/users`
*Headers: `Authorization: Bearer <accessToken>` (Requires `admin.manage_users`)*

---

### `PATCH /api/users/:id/status`
Toggles user status between `ACTIVE` and `INACTIVE`.

---

### `GET /api/audit`
*Headers: `Authorization: Bearer <accessToken>` (Requires `admin.audit_logs`)*

Returns centralized audit logs filterable by module, username, and action.
