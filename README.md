# Digital Coupon Marketplace

> **Security checklist**
> - No secrets are committed to this repository.
> - All sensitive values live in `.env` which is git-ignored.
> - Copy `.env.example` to `.env` and fill in your own values before running.

A dockerized full-stack coupon marketplace with a **Reseller REST API**, **Admin CRUD**, and a **Customer storefront**. Built with **Node.js**, **Express**, **TypeScript**, **Prisma**, **MySQL**, **React**, **REST APIs**, and **Docker Compose**.

---

## Quick Start (One Command)

```bash
cp .env.example .env   # then edit .env with your own secrets
docker compose up --build
```

Wait ~30 seconds for MySQL to initialize, migrations to run, and seed data to load.

| Service      | URL                          |
| ------------ | ---------------------------- |
| Frontend     | http://localhost:5173        |
| Backend API  | http://localhost:3000        |
| phpMyAdmin   | http://localhost:8080        |
| Health Check | http://localhost:3000/health |

The backend is a JSON API service — there is no web homepage. `GET /` returns a small JSON index of available routes, and `/health` is the primary sanity check.

To stop everything: `docker compose down` (add `-v` to also wipe the database volume).

---

## Project Structure

```
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # DB schema (single-table Product model)
│   │   ├── seed.ts                # Seeds 15 sample coupons (idempotent)
│   │   └── migrations/            # SQL migration files
│   ├── src/
│   │   ├── index.ts               # Express app entry point
│   │   ├── controllers/           # HTTP layer (request → response)
│   │   │   ├── admin.controller.ts
│   │   │   ├── customer.controller.ts
│   │   │   └── reseller.controller.ts
│   │   ├── services/              # Business logic, pricing, purchase flow
│   │   │   └── product.service.ts
│   │   ├── repositories/          # Data access layer (Prisma queries)
│   │   │   └── product.repository.ts
│   │   ├── middleware/            # Auth, error handler
│   │   │   ├── errorHandler.ts
│   │   │   └── resellerAuth.ts
│   │   ├── routes/                # Route definitions
│   │   ├── types/                 # TypeScript interfaces & DTOs
│   │   └── utils/                 # Prisma client, pricing math, error classes
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx                # Mode switcher (Customer / Admin)
│   │   ├── pages/
│   │   │   ├── CustomerPage.tsx   # Browse & purchase coupons
│   │   │   └── AdminPage.tsx      # CRUD table + create form
│   │   ├── services/api.ts        # API client
│   │   └── types/
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Architecture & Key Decisions

### Seed Data

The seed script inserts **15 sample coupons** on first run. It is idempotent — on subsequent restarts it only inserts coupons whose name doesn't already exist, so no duplicates are created.

### Database Schema

Single-table design with a `type` enum discriminator (`COUPON`). This avoids unnecessary JOINs for the current single-type use case while remaining extensible — future product types only need a new enum value and nullable type-specific columns.

### Pricing

- **Formula:** `minimum_sell_price = cost_price × (1 + margin_percentage / 100)`
- **Decimal safety:** All pricing math uses `decimal.js` to avoid IEEE-754 floating-point errors. DB columns are `DECIMAL(10,2)`.
- **Enforcement:** `cost_price` and `margin_percentage` are **never** accepted from reseller or customer endpoints — only admin can set them. The reseller/customer DTOs exclude these fields entirely.

### Atomic Purchase (Concurrency Safety)

The purchase flow uses a MySQL transaction with `SELECT ... FOR UPDATE` row-level locking at `SERIALIZABLE` isolation level. This guarantees that if two concurrent requests try to buy the same coupon, exactly one succeeds and the other receives `409 PRODUCT_ALREADY_SOLD`.

See: `backend/src/repositories/product.repository.ts` → `atomicPurchase()`

### Coupon Value Storage

- `value_type = STRING`: the value is a plain coupon code string (e.g., `"ABCD-1234"`)
- `value_type = IMAGE`: the value is a **URL** pointing to an image (e.g., a QR code). Chosen over base64 to keep the DB lean and responses fast — base64 images can be 30%+ larger and slow down JSON serialization.

### Coupon Value Secrecy

The coupon `value` field is **only returned after a successful purchase**. Public listing endpoints never include it.

### Reseller vs Customer Listing Behavior

- **Reseller API** (`GET /api/v1/products`): returns **only unsold** products, per the reseller API spec. This endpoint is unchanged.
- **Customer API** (`GET /api/customer/products`): returns **all** products including sold ones, with an `is_sold` flag. The customer frontend uses this to display sold coupons as dimmed cards with a red "SOLD" badge and a disabled purchase button. Pricing internals and coupon values are still excluded.

---

## API Reference

### Reseller API (`/api/v1`) — Bearer Auth Required

All reseller endpoints require the token you set as `RESELLER_API_TOKEN` in your `.env`:
```
Authorization: Bearer <your-token>
```

#### List Available Products

```bash
curl http://localhost:3000/api/v1/products \
  -H "Authorization: Bearer <your-token>"
```

Response `200`:
```json
[
  {
    "id": "uuid",
    "name": "20% Off Electronics",
    "description": "...",
    "image_url": "https://...",
    "price": 12.50
  }
]
```

#### Get Single Product

```bash
curl http://localhost:3000/api/v1/products/{productId} \
  -H "Authorization: Bearer <your-token>"
```

#### Purchase Product

```bash
curl -X POST http://localhost:3000/api/v1/products/{productId}/purchase \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{"reseller_price": 15.00}'
```

Success `200`:
```json
{
  "product_id": "uuid",
  "final_price": 15.00,
  "value_type": "STRING",
  "value": "ELEC-20OFF-A1B2"
}
```

Error responses:
| Code | error_code            | HTTP |
| ---- | --------------------- | ---- |
| 401  | UNAUTHORIZED          | 401  |
| 404  | PRODUCT_NOT_FOUND     | 404  |
| 409  | PRODUCT_ALREADY_SOLD  | 409  |
| 400  | RESELLER_PRICE_TOO_LOW| 400  |

### Admin API (`/api/admin`) — No Auth Required

#### List All Products

```bash
curl http://localhost:3000/api/admin/products
```

#### Create Product

```bash
curl -X POST http://localhost:3000/api/admin/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Coupon",
    "description": "A test coupon",
    "image_url": "https://picsum.photos/400/300",
    "cost_price": 10.00,
    "margin_percentage": 25.00,
    "value_type": "STRING",
    "value": "TEST-CODE-1234"
  }'
```

#### Update Product

```bash
curl -X PUT http://localhost:3000/api/admin/products/{id} \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Name", "margin_percentage": 30.00}'
```

#### Delete Product

```bash
curl -X DELETE http://localhost:3000/api/admin/products/{id}
```

### Customer API (`/api/customer`)

```bash
# List all coupons (includes sold items with is_sold flag)
curl http://localhost:3000/api/customer/products

# Purchase (price is fixed server-side, no body needed)
curl -X POST http://localhost:3000/api/customer/products/{id}/purchase
```

> **Note:** The customer list returns all products (including sold ones) so the
> frontend can display them. The reseller list (`/api/v1/products`) returns only
> unsold products per the reseller API spec.

---

## Error Format

All errors follow this structure:

```json
{
  "error_code": "ERROR_NAME",
  "message": "Human readable message"
}
```

---

## Environment Variables

Copy `.env.example` to `.env` and set your own values:

```bash
cp .env.example .env
```

> **Never commit `.env`.** It is git-ignored. Only `.env.example` (with placeholders) is tracked.

| Variable              | Description                        |
| --------------------- | ---------------------------------- |
| `MYSQL_ROOT_PASSWORD` | MySQL root password                |
| `MYSQL_DATABASE`      | Database name                      |
| `MYSQL_USER`          | App DB user                        |
| `MYSQL_PASSWORD`      | App DB password                    |
| `DATABASE_URL`        | Prisma connection string           |
| `PORT`                | Backend port (default: 3000)       |
| `RESELLER_API_TOKEN`  | Bearer token for reseller API auth |
| `VITE_API_URL`        | Backend URL for frontend           |

---

## Development (Without Docker)

```bash
# Terminal 1: Start MySQL (requires local MySQL 8 on port 3306)
# Terminal 2: Backend
cd backend
cp ../.env.example ../.env  # edit with real values
npm install
npx prisma migrate deploy
npx prisma db seed
npm run dev

# Terminal 3: Frontend
cd frontend
npm install
npm run dev
```
