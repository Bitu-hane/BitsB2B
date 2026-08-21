# BitsB2B Marketplace — Production PostgreSQL Database Schema

> **Version:** 3.0 (Enterprise Gold Standard Architecture)  
> **Target RDBMS:** PostgreSQL 15+  
> **Primary Use Case:** Ethiopian B2B Wholesale Digital Marketplace with Transactional Outbox, Financial Webhook Auditing, Business Delivery Zones, Escrow Ledger & Telebirr / CBE Birr Integration.

---

## 📐 Schema Overview & Architecture

The BitsB2B database is structured into 8 core functional domains:
1. **Authentication & Security**: Dual-auth support (Password + SMS OTP), multi-device sessions (`auth_sessions`), rate-limited `otp_challenges`.
2. **Business & Delivery Logistics**: Trade license lookup dictionary (`business_types`, localized via frontend `en.json` & `am.json`), enterprise profiles (`businesses`), multi-branch/warehouse physical locations (`business_addresses`), and regional shipping coverage (`delivery_zones`, `business_delivery_zones`).
3. **Catalog, Search & Bulk Pricing**: Product listings (`products`) with PostgreSQL Full-Text Search (`tsvector`), 1:N gallery (`product_images`) with partial unique primary constraint, and bulk volume pricing (`product_price_tiers`).
4. **Orders & Traceable Milestones**: Historical purchase orders (`orders`) with JSONB address snapshots and `reordered_from_order_id`, snapshot line items (`order_items`), and status transition history (`order_status_history`).
5. **Fintech, Webhooks & Escrow Ledger**: Financial payments (`payments`) with idempotency constraints, raw webhook event logs (`payment_provider_events`), and idempotent escrow ledger (`escrow_transactions`).
6. **Inquiries & Communications**: Product RFQ inquiry threads (`inquiries`, `inquiry_messages`), logical notifications (`notifications`), multi-channel delivery tracking (`notification_deliveries`), and SMS audit logs (`sms_logs`).
7. **Reliability & Audit System**: System-wide administrative action auditing (`audit_logs`) and ACID transactional outbox pattern for Go workers (`outbox_events`).
8. **RBAC Security Controls**: Platform role-based access control (`roles`, `permissions`, `role_permissions`, `user_roles`).

---

## Section 1: Authentication & Identity Tables

### Table 1: `users`
*Primary user identity record (Buyers, Sellers, Dual Traders & Admins).*

| Column Name | Data Type | Constraints & Keys | Description |
| --- | --- | --- | --- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unique user identifier |
| `full_name` | `VARCHAR(150)` | `NOT NULL` | Full legal name of account holder |
| `phone` | `VARCHAR(30)` | `NOT NULL UNIQUE` | Mobile phone number (Primary login identity) |
| `email` | `VARCHAR(150)` | `NULLABLE UNIQUE` | Account email address |
| `avatar_url` | `TEXT` | `NULLABLE` | Profile avatar image link |
| `is_active` | `BOOLEAN` | `NOT NULL DEFAULT TRUE` | Account status flag |
| `phone_verified_at` | `TIMESTAMPTZ` | `NULLABLE` | SMS OTP verification timestamp |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Account creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Last profile update timestamp |

### Table 2: `user_credentials`
*Permanent password credentials (for desktop web portal login).*

| Column Name | Data Type | Constraints & Keys | Description |
| --- | --- | --- | --- |
| `user_id` | `UUID` | `PRIMARY KEY FK -> users(id) ON DELETE CASCADE` | Foreign key to users table |
| `password_hash` | `VARCHAR(255)` | `NOT NULL` | Salted password hash (Argon2id / BCrypt) |
| `failed_login_attempts` | `INTEGER` | `NOT NULL DEFAULT 0 CHECK (failed_login_attempts >= 0)` | Consecutive failed login counter |
| `locked_until` | `TIMESTAMPTZ` | `NULLABLE` | Account lock expiration timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Password last changed timestamp |

### Table 3: `otp_challenges`
*Short-lived SMS / Email OTP verification challenges.*

| Column Name | Data Type | Constraints & Keys | Description |
| --- | --- | --- | --- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | OTP record ID |
| `phone` | `VARCHAR(30)` | `NOT NULL` | Recipient phone number |
| `code_hash` | `VARCHAR(255)` | `NOT NULL` | Hashed 6-digit OTP code |
| `purpose` | `VARCHAR(30)` | `NOT NULL` | `login`, `registration`, `payout_release` |
| `attempts` | `INTEGER` | `NOT NULL DEFAULT 0 CHECK (attempts >= 0)` | Current verification attempt count |
| `max_attempts` | `INTEGER` | `NOT NULL DEFAULT 3 CHECK (max_attempts > 0)` | Maximum allowed attempts before invalidation |
| `expires_at` | `TIMESTAMPTZ` | `NOT NULL` | OTP expiration timestamp (5-minute TTL) |
| `consumed_at` | `TIMESTAMPTZ` | `NULLABLE` | Successful verification timestamp |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Record generation timestamp |

### Table 4: `auth_sessions`
*Tracks active user login sessions & JWT refresh tokens.*

| Column Name | Data Type | Constraints & Keys | Description |
| --- | --- | --- | --- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Session identifier |
| `user_id` | `UUID` | `NOT NULL FK -> users(id) ON DELETE CASCADE` | Foreign Key to users table |
| `refresh_token_hash` | `VARCHAR(255)` | `NOT NULL UNIQUE` | Hashed JWT refresh token |
| `device_info` | `VARCHAR(255)` | `NULLABLE` | User Agent device metadata |
| `ip_address` | `INET` | `NULLABLE` | IPv4 / IPv6 client address |
| `expires_at` | `TIMESTAMPTZ` | `NOT NULL` | Session expiration timestamp |
| `revoked_at` | `TIMESTAMPTZ` | `NULLABLE` | Token revocation timestamp |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Session start timestamp |

---

## Section 2: Enterprise Business, Multi-Location Addresses & Delivery Zones

### Table 5: `business_types` *(Trade Category Lookup Dictionary)*
*Standardized lookup dictionary for Ethiopian commercial license types (Localized via frontend `en.json` & `am.json`).*

| Column Name | Data Type | Constraints & Keys | Description |
| --- | --- | --- | --- |
| `code` | `VARCHAR(50)` | `PRIMARY KEY` | Unique code (`importer`, `exporter`, `producer`, `wholesaler`, `distributor`, `reseller`, `institutional_buyer`) |
| `name` | `VARCHAR(100)` | `NOT NULL` | Standard English display title (e.g., `Importer`) |
| `description` | `TEXT` | `NULLABLE` | Category scope summary |
| `sort_order` | `INTEGER` | `NOT NULL DEFAULT 0` | Display sorting priority |
| `is_active` | `BOOLEAN` | `NOT NULL DEFAULT TRUE` | Visibility flag |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Creation timestamp |

### Table 6: `businesses`
*Enterprise profile with TIN & Trade License verification (1:1 with owner user).*

| Column Name | Data Type | Constraints & Keys | Description |
| --- | --- | --- | --- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Business profile ID |
| `owner_user_id` | `UUID` | `NOT NULL UNIQUE FK -> users(id) ON DELETE RESTRICT` | Foreign Key to business owner |
| `name` | `VARCHAR(200)` | `NOT NULL` | Legal business name |
| `business_type_code` | `VARCHAR(50)` | `NOT NULL FK -> business_types(code) ON DELETE RESTRICT` | Foreign Key to trade license category |
| `can_buy` | `BOOLEAN` | `NOT NULL DEFAULT TRUE` | Purchasing capability flag |
| `can_sell` | `BOOLEAN` | `NOT NULL DEFAULT FALSE` | Selling capability flag |
| `phone` | `VARCHAR(30)` | `NOT NULL` | Business contact phone |
| `tin_number` | `VARCHAR(50)` | `NULLABLE` | Tax Identification Number |
| `trade_license_number` | `VARCHAR(100)` | `NULLABLE` | Business registration license |
| `verification_status` | `VARCHAR(30)` | `NOT NULL DEFAULT 'pending'` | `pending`, `verified`, `rejected`, `revoked` |
| `verified_at` | `TIMESTAMPTZ` | `NULLABLE` | Verification approval timestamp |
| `verified_by` | `UUID` | `NULLABLE FK -> users(id)` | Admin user ID who verified |
| `description` | `TEXT` | `NULLABLE` | Company bio & capacity summary |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Profile creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Last profile update timestamp |

### Table 7: `business_addresses` *(Multi-Warehouse & Branch Locations)*
*Dedicated 1:N address table for multi-branch, headquarters, showroom, and warehouse logistics.*

| Column Name | Data Type | Constraints & Keys | Description |
| --- | --- | --- | --- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Address ID |
| `business_id` | `UUID` | `NOT NULL FK -> businesses(id) ON DELETE CASCADE` | Foreign Key to parent business |
| `label` | `VARCHAR(50)` | `NOT NULL DEFAULT 'headquarters'` | Address type (`headquarters`, `warehouse`, `factory`, `showroom`) |
| `region` | `VARCHAR(100)` | `NOT NULL` | Ethiopian region (`Addis Ababa`, `Oromia`, `Sidama`, etc.) |
| `city` | `VARCHAR(100)` | `NOT NULL` | City location (`Addis Ababa`, `Adama`, `Hawassa`, etc.) |
| `subcity` | `VARCHAR(100)` | `NULLABLE` | Subcity jurisdiction (`Bole`, `Kirkos`, `Akaki-Kality`) |
| `kebele` | `VARCHAR(50)` | `NULLABLE` | Kebele administrative unit |
| `landmark` | `VARCHAR(200)` | `NULLABLE` | Nearby landmark (e.g., `Behind CBE Merkato Branch`) |
| `gps_coordinates` | `POINT` | `NULLABLE` | Geographic Point (Latitude & Longitude for map routing) |
| `is_default_billing` | `BOOLEAN` | `NOT NULL DEFAULT FALSE` | Default billing address flag |
| `is_default_shipping` | `BOOLEAN` | `NOT NULL DEFAULT FALSE` | Default shipping address flag |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Address creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Last update timestamp |

### Table 8: `delivery_zones`
*Master catalog of geographic shipping coverage zones.*

| Column Name | Data Type | Constraints & Keys | Description |
| --- | --- | --- | --- |
| `id` | `VARCHAR(50)` | `PRIMARY KEY` | Delivery zone code (e.g., `zone-addis-ababa`, `zone-adama`) |
| `name` | `VARCHAR(100)` | `NOT NULL` | Zone title |
| `region` | `VARCHAR(100)` | `NOT NULL` | Ethiopian region |
| `city` | `VARCHAR(100)` | `NULLABLE` | Target city |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Creation timestamp |

### Table 9: `business_delivery_zones`
*Business-level shipping coverage mapping.*

| Column Name | Data Type | Constraints & Keys | Description |
| --- | --- | --- | --- |
| `business_id` | `UUID` | `NOT NULL FK -> businesses(id) ON DELETE CASCADE` | Foreign Key to business |
| `delivery_zone_id` | `VARCHAR(50)` | `NOT NULL FK -> delivery_zones(id) ON DELETE CASCADE` | Foreign Key to delivery zone |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT CURRENT_TIMESTAMP` | Mapping timestamp |
| **PRIMARY KEY** | - | **`PRIMARY KEY (business_id, delivery_zone_id)`** | Unique business-zone composite constraint |

---

## Section 3: Catalog, Search, Images & Volume Tier Pricing

### Table 10: `categories`
*Wholesale product category taxonomy.*

| Column Name | Data Type | Constraints & Keys | Description |
| --- | --- | --- | --- |
| `id` | `VARCHAR(50)` | `PRIMARY KEY` | Category identifier (e.g. `cat-industrial`) |
| `name` | `VARCHAR(150)` | `NOT NULL` | Category display title |
| `slug` | `VARCHAR(150)` | `NOT NULL UNIQUE` | URL-friendly slug |
| `description` | `TEXT` | `NULLABLE` | Category description |
| `sort_order` | `INTEGER` | `NOT NULL DEFAULT 0` | Display sorting priority |
| `is_active` | `BOOLEAN` | `NOT NULL DEFAULT TRUE` | Category visibility status |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Creation timestamp |

### Table 11: `products`
*Wholesale product listings published by verified sellers (with PostgreSQL Full-Text Search).*

| Column Name | Data Type | Constraints & Keys | Description |
| --- | --- | --- | --- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Product ID |
| `seller_business_id` | `UUID` | `NOT NULL FK -> businesses(id) ON DELETE RESTRICT` | Foreign Key to seller business |
| `category_id` | `VARCHAR(50)` | `NOT NULL FK -> categories(id) ON DELETE RESTRICT` | Foreign Key to category |
| `name` | `VARCHAR(255)` | `NOT NULL` | Product title |
| `description` | `TEXT` | `NOT NULL` | Detailed description |
| `price` | `NUMERIC(14,2)` | `NOT NULL CHECK (price >= 0)` | Base unit price |
| `currency` | `CHAR(3)` | `NOT NULL DEFAULT 'ETB'` | Currency code |
| `moq` | `INTEGER` | `NOT NULL DEFAULT 1 CHECK (moq > 0)` | Minimum Order Quantity |
| `unit` | `VARCHAR(50)` | `NOT NULL` | Unit of measure (`pieces`, `kg`, `carton`) |
| `stock_quantity` | `INTEGER` | `NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0)` | Inventory stock count |
| `availability_status` | `VARCHAR(30)` | `NOT NULL DEFAULT 'in_stock'` | `in_stock`, `low_stock`, `out_of_stock` |
| `stock_updated_at` | `TIMESTAMPTZ` | `NULLABLE` | Inventory update timestamp |
| `lead_time` | `VARCHAR(100)` | `NULLABLE` | Delivery lead time (e.g., `3-5 days`) |
| `specifications` | `JSONB` | `NOT NULL DEFAULT '{}'` | Technical specifications key-value map |
| `status` | `VARCHAR(30)` | `NOT NULL DEFAULT 'draft'` | `draft`, `active`, `paused`, `archived` |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Listing creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Last update timestamp |

### Table 12: `product_price_tiers` *(Volume Bulk Pricing)*
*Tiered volume discount pricing per product.*

| Column Name | Data Type | Constraints & Keys | Description |
| --- | --- | --- | --- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Tier record ID |
| `product_id` | `UUID` | `NOT NULL FK -> products(id) ON DELETE CASCADE` | Foreign Key to product |
| `min_quantity` | `INTEGER` | `NOT NULL CHECK (min_quantity > 0)` | Minimum volume threshold quantity |
| `price_per_unit` | `NUMERIC(14,2)` | `NOT NULL CHECK (price_per_unit >= 0)` | Discounted unit price for this volume tier |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Creation timestamp |

### Table 13: `product_images`
*1:N Product gallery images with partial single primary image constraint.*

| Column Name | Data Type | Constraints & Keys | Description |
| --- | --- | --- | --- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Image record ID |
| `product_id` | `UUID` | `NOT NULL FK -> products(id) ON DELETE CASCADE` | Foreign Key to product |
| `url` | `TEXT` | `NOT NULL` | Image asset URL |
| `sort_order` | `INTEGER` | `NOT NULL DEFAULT 0` | Image display sequence |
| `is_primary` | `BOOLEAN` | `NOT NULL DEFAULT FALSE` | Main thumbnail flag |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Upload timestamp |

---

## Section 4: Orders, Snapshots & Milestone Tracking

### Table 14: `orders`
*Purchase order header with historical address snapshot and 1-click reorder traceability.*

| Column Name | Data Type | Constraints & Keys | Description |
| --- | --- | --- | --- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Order ID |
| `order_number` | `VARCHAR(50)` | `NOT NULL UNIQUE` | Human-readable order code (e.g. `ORD-84920`) |
| `reordered_from_order_id` | `UUID` | `NULLABLE FK -> orders(id) ON DELETE SET NULL` | Traceability link if generated from a repeat order |
| `buyer_business_id` | `UUID` | `NOT NULL FK -> businesses(id) ON DELETE RESTRICT` | Foreign Key to purchasing buyer business |
| `seller_business_id` | `UUID` | `NOT NULL FK -> businesses(id) ON DELETE RESTRICT` | Foreign Key to selling business |
| `shipping_address_id` | `UUID` | `NULLABLE FK -> business_addresses(id) ON DELETE RESTRICT` | Foreign Key to buyer shipping address |
| `dispatch_address_id` | `UUID` | `NULLABLE FK -> business_addresses(id) ON DELETE RESTRICT` | Foreign Key to seller dispatch warehouse |
| `created_by_user_id` | `UUID` | `NOT NULL FK -> users(id) ON DELETE RESTRICT` | User ID who placed the order |
| `status` | `VARCHAR(30)` | `NOT NULL DEFAULT 'placed'` | `placed`, `confirmed`, `shipped`, `delivered`, `cancelled` |
| `subtotal` | `NUMERIC(14,2)` | `NOT NULL CHECK (subtotal >= 0)` | Line items subtotal |
| `delivery_fee` | `NUMERIC(14,2)` | `NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0)` | Shipping delivery cost |
| `discount_amount` | `NUMERIC(14,2)` | `NOT NULL DEFAULT 0 CHECK (discount_amount >= 0)` | Applied discount |
| `total_amount` | `NUMERIC(14,2)` | `NOT NULL CHECK (total_amount >= 0)` | Total order transaction amount |
| `currency` | `CHAR(3)` | `NOT NULL DEFAULT 'ETB'` | Currency code |
| `delivery_address` | `JSONB` | `NOT NULL` | **Immutable JSONB snapshot of shipping address at order time** |
| `tracking_number` | `VARCHAR(100)` | `NULLABLE` | Freight tracking code |
| `freight_carrier` | `VARCHAR(100)` | `NULLABLE` | Logistics carrier name |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Order placement timestamp |
| `confirmed_at` | `TIMESTAMPTZ` | `NULLABLE` | Seller confirmation timestamp |
| `shipped_at` | `TIMESTAMPTZ` | `NULLABLE` | Dispatch timestamp |
| `delivered_at` | `TIMESTAMPTZ` | `NULLABLE` | Delivery timestamp |
| `cancelled_at` | `TIMESTAMPTZ` | `NULLABLE` | Order cancellation timestamp |

### Table 15: `order_items`
*Historical immutable order line items.*

| Column Name | Data Type | Constraints & Keys | Description |
| --- | --- | --- | --- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Line item ID |
| `order_id` | `UUID` | `NOT NULL FK -> orders(id) ON DELETE CASCADE` | Foreign Key to order |
| `product_id` | `UUID` | `NOT NULL FK -> products(id) ON DELETE RESTRICT` | Foreign Key to product |
| `product_name` | `VARCHAR(255)` | `NOT NULL` | Snapshot of product title at purchase |
| `product_image` | `TEXT` | `NULLABLE` | Snapshot of primary image URL |
| `quantity` | `INTEGER` | `NOT NULL CHECK (quantity > 0)` | Quantity ordered |
| `unit` | `VARCHAR(50)` | `NOT NULL` | Quantity unit |
| `unit_price` | `NUMERIC(14,2)` | `NOT NULL CHECK (unit_price >= 0)` | Applied unit price at purchase time |
| `total_price` | `NUMERIC(14,2)` | `NOT NULL CHECK (total_price >= 0)` | Line total price |

### Table 16: `order_status_history`
*Milestone status transition audit log (Powers UI Stepper).*

| Column Name | Data Type | Constraints & Keys | Description |
| --- | --- | --- | --- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | History record ID |
| `order_id` | `UUID` | `NOT NULL FK -> orders(id) ON DELETE CASCADE` | Foreign Key to order |
| `from_status` | `VARCHAR(30)` | `NULLABLE` | Previous order status |
| `to_status` | `VARCHAR(30)` | `NOT NULL` | New order status |
| `changed_by_user_id` | `UUID` | `NOT NULL FK -> users(id)` | Actor user ID who changed status |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Status change timestamp |

---

## Section 5: Fintech, Webhook Events & Escrow Ledger

### Table 17: `payments`
*Financial transaction payment audit with idempotency guarantees.*

| Column Name | Data Type | Constraints & Keys | Description |
| --- | --- | --- | --- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Payment record ID |
| `order_id` | `UUID` | `NOT NULL FK -> orders(id) ON DELETE RESTRICT` | Foreign Key to order |
| `idempotency_key` | `VARCHAR(150)` | `NOT NULL UNIQUE` | Client/system idempotency key |
| `provider` | `VARCHAR(50)` | `NOT NULL` | Payment gateway (`telebirr`, `cbe_birr`) |
| `payment_method` | `VARCHAR(50)` | `NOT NULL` | Payment method code |
| `provider_transaction_id` | `VARCHAR(150)` | `NULLABLE` | External provider reference code |
| `amount` | `NUMERIC(14,2)` | `NOT NULL CHECK (amount > 0)` | Transaction amount |
| `currency` | `CHAR(3)` | `NOT NULL DEFAULT 'ETB'` | Currency |
| `status` | `VARCHAR(30)` | `NOT NULL DEFAULT 'pending'` | `pending`, `success`, `failed` |
| `failure_reason` | `TEXT` | `NULLABLE` | Failure description if unsuccessful |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Payment attempt timestamp |
| `paid_at` | `TIMESTAMPTZ` | `NULLABLE` | Payment success timestamp |
| `failed_at` | `TIMESTAMPTZ` | `NULLABLE` | Payment failure timestamp |

### Table 18: `payment_provider_events` *(Webhook Raw Audit Log)*
*Raw payload audit log for Telebirr / CBE Birr webhook callbacks.*

| Column Name | Data Type | Constraints & Keys | Description |
| --- | --- | --- | --- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Event log ID |
| `payment_id` | `UUID` | `NULLABLE FK -> payments(id) ON DELETE RESTRICT` | Foreign Key to payment |
| `provider` | `VARCHAR(50)` | `NOT NULL` | Gateway (`telebirr`, `cbe_birr`) |
| `provider_event_id` | `VARCHAR(150)` | `NULLABLE` | Provider webhook event ID |
| `event_type` | `VARCHAR(100)` | `NOT NULL` | Event type (`payment.success`, `payment.failed`) |
| `payload` | `JSONB` | `NOT NULL` | **Raw JSON request payload from gateway** |
| `processing_status` | `VARCHAR(30)` | `NOT NULL DEFAULT 'received'` | `received`, `processed`, `failed` |
| `received_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Webhook arrival timestamp |
| `processed_at` | `TIMESTAMPTZ` | `NULLABLE` | Processing completion timestamp |

### Table 19: `escrow_transactions`
*Immutable Escrow ledger with operation reference idempotency.*

| Column Name | Data Type | Constraints & Keys | Description |
| --- | --- | --- | --- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Escrow transaction ID |
| `order_id` | `UUID` | `NOT NULL FK -> orders(id) ON DELETE RESTRICT` | Foreign Key to order |
| `payment_id` | `UUID` | `NOT NULL FK -> payments(id) ON DELETE RESTRICT` | Foreign Key to payment |
| `operation_reference` | `VARCHAR(150)` | `NOT NULL UNIQUE` | Unique operation idempotency code |
| `type` | `VARCHAR(30)` | `NOT NULL` | Escrow action (`hold`, `release`, `refund`) |
| `amount` | `NUMERIC(14,2)` | `NOT NULL CHECK (amount > 0)` | Escrow movement amount |
| `status` | `VARCHAR(30)` | `NOT NULL` | `pending`, `completed`, `failed` |
| `provider_reference` | `VARCHAR(150)` | `NULLABLE` | External provider payout code |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Escrow movement timestamp |
| `completed_at` | `TIMESTAMPTZ` | `NULLABLE` | Completion timestamp |

---

## Section 6: Inquiries, Communications & Multi-Channel Deliveries

### Table 20: `inquiries`
*Product RFQ inquiry threads.*

| Column Name | Data Type | Constraints & Keys | Description |
| --- | --- | --- | --- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Inquiry thread ID |
| `product_id` | `UUID` | `NOT NULL FK -> products(id) ON DELETE RESTRICT` | Foreign Key to product |
| `buyer_business_id` | `UUID` | `NOT NULL FK -> businesses(id) ON DELETE RESTRICT` | Foreign Key to buyer business |
| `seller_business_id` | `UUID` | `NOT NULL FK -> businesses(id) ON DELETE RESTRICT` | Foreign Key to seller business |
| `topic` | `VARCHAR(50)` | `NOT NULL` | Inquiry topic (`pricing`, `samples`, `specifications`) |
| `target_quantity` | `INTEGER` | `NULLABLE CHECK (target_quantity > 0)` | Requested bulk quantity |
| `target_price` | `NUMERIC(14,2)` | `NULLABLE CHECK (target_price >= 0)` | Offered target unit price |
| `status` | `VARCHAR(30)` | `NOT NULL DEFAULT 'pending_reply'` | `pending_reply`, `replied`, `closed` |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Thread start timestamp |
| `closed_at` | `TIMESTAMPTZ` | `NULLABLE` | Thread closure timestamp |

### Table 21: `inquiry_messages`
*Messages exchanged inside RFQ threads.*

| Column Name | Data Type | Constraints & Keys | Description |
| --- | --- | --- | --- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Message ID |
| `inquiry_id` | `UUID` | `NOT NULL FK -> inquiries(id) ON DELETE CASCADE` | Foreign Key to inquiry thread |
| `sender_user_id` | `UUID` | `NOT NULL FK -> users(id) ON DELETE RESTRICT` | Foreign Key to sender user |
| `text` | `TEXT` | `NOT NULL` | Message body content |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Message timestamp |

### Table 22: `notifications`
*Logical user in-app alerts with polymorphic references.*

| Column Name | Data Type | Constraints & Keys | Description |
| --- | --- | --- | --- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Notification ID |
| `user_id` | `UUID` | `NOT NULL FK -> users(id) ON DELETE CASCADE` | Recipient user ID |
| `type` | `VARCHAR(50)` | `NOT NULL` | Notification category |
| `title` | `VARCHAR(200)` | `NOT NULL` | Alert headline |
| `message` | `TEXT` | `NOT NULL` | Body content |
| `entity_type` | `VARCHAR(50)` | `NULLABLE` | `order`, `inquiry`, `escrow` |
| `entity_id` | `UUID` | `NULLABLE` | Foreign Key ID of target entity |
| `read_at` | `TIMESTAMPTZ` | `NULLABLE` | Read timestamp |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Creation timestamp |

### Table 23: `notification_deliveries` *(Multi-Channel Delivery Tracker)*
*Channel-specific dispatch tracker for SMS and In-App delivery retries.*

| Column Name | Data Type | Constraints & Keys | Description |
| --- | --- | --- | --- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Delivery ID |
| `notification_id` | `UUID` | `NOT NULL FK -> notifications(id) ON DELETE CASCADE` | Foreign Key to parent notification |
| `channel` | `VARCHAR(30)` | `NOT NULL` | `in_app`, `sms` |
| `status` | `VARCHAR(30)` | `NOT NULL DEFAULT 'pending'` | `pending`, `sent`, `failed` |
| `provider` | `VARCHAR(50)` | `NULLABLE` | Telecommunications SMS gateway provider |
| `provider_message_id` | `VARCHAR(150)` | `NULLABLE` | Gateway dispatch ID |
| `attempts` | `INTEGER` | `NOT NULL DEFAULT 0 CHECK (attempts >= 0)` | Delivery attempt count |
| `sent_at` | `TIMESTAMPTZ` | `NULLABLE` | Dispatch timestamp |
| `failed_at` | `TIMESTAMPTZ` | `NULLABLE` | Failure timestamp |

### Table 24: `sms_logs`
*Outbound SMS notification audit log.*

| Column Name | Data Type | Constraints & Keys | Description |
| --- | --- | --- | --- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Log entry ID |
| `user_id` | `UUID` | `NULLABLE FK -> users(id)` | Foreign Key to user |
| `phone` | `VARCHAR(30)` | `NOT NULL` | Recipient phone number |
| `type` | `VARCHAR(50)` | `NOT NULL` | `otp`, `order_status`, `escrow_alert` |
| `provider` | `VARCHAR(50)` | `NULLABLE` | Telecommunications gateway provider |
| `provider_message_id` | `VARCHAR(150)` | `NULLABLE` | Gateway dispatch ID |
| `status` | `VARCHAR(30)` | `NOT NULL` | `pending`, `sent`, `failed` |
| `sent_at` | `TIMESTAMPTZ` | `NULLABLE` | Outbound dispatch timestamp |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Record creation timestamp |

---

## Section 7: Reliability & Audit System

### Table 25: `audit_logs`
*General administrative & security action audit trail.*

| Column Name | Data Type | Constraints & Keys | Description |
| --- | --- | --- | --- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Audit record ID |
| `actor_user_id` | `UUID` | `NOT NULL FK -> users(id) ON DELETE RESTRICT` | User ID who performed the action |
| `action` | `VARCHAR(100)` | `NOT NULL` | Action code (`ADMIN_VERIFIED_BUSINESS`, `ESCROW_REFUNDED`, `SELLER_CONFIRMED_ORDER`) |
| `entity_type` | `VARCHAR(50)` | `NOT NULL` | Affected entity (`business`, `order`, `product`, `escrow`) |
| `entity_id` | `UUID` | `NOT NULL` | Target entity UUID |
| `metadata` | `JSONB` | `NOT NULL DEFAULT '{}'` | Additional context payload |
| `ip_address` | `INET` | `NULLABLE` | Actor IP address |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Audit log timestamp |

### Table 26: `outbox_events` *(Transactional Outbox Pattern for Go Workers)*
*ACID transactional outbox table for reliable background worker dispatches.*

| Column Name | Data Type | Constraints & Keys | Description |
| --- | --- | --- | --- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Outbox event ID |
| `event_type` | `VARCHAR(100)` | `NOT NULL` | Event code (`order.placed`, `order.confirmed`, `escrow.released`) |
| `aggregate_type` | `VARCHAR(50)` | `NOT NULL` | Aggregate (`order`, `payment`, `inquiry`) |
| `aggregate_id` | `UUID` | `NOT NULL` | Target aggregate ID |
| `payload` | `JSONB` | `NOT NULL` | Transaction payload JSON |
| `status` | `VARCHAR(30)` | `NOT NULL DEFAULT 'pending'` | `pending`, `processed`, `failed` |
| `attempts` | `INTEGER` | `NOT NULL DEFAULT 0 CHECK (attempts >= 0)` | Processing attempt count |
| `available_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Next available processing time |
| `processed_at` | `TIMESTAMPTZ` | `NULLABLE` | Processing completion timestamp |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Creation timestamp |

---

## Section 8: RBAC Security Controls

### Table 27: `roles`
*System roles (`ADMIN`).*

| Column Name | Data Type | Constraints & Keys | Description |
| --- | --- | --- | --- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Role ID |
| `name` | `VARCHAR(50)` | `NOT NULL UNIQUE` | Display role title |
| `description` | `TEXT` | `NULLABLE` | Scope summary |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Creation timestamp |

### Table 28: `permissions`
*Fine-grained system permissions.*

| Column Name | Data Type | Constraints & Keys | Description |
| --- | --- | --- | --- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Permission ID |
| `name` | `VARCHAR(100)` | `NOT NULL` | Display permission title |
| `code` | `VARCHAR(100)` | `NOT NULL UNIQUE` | Code (e.g. `business:verify`, `escrow:release`) |
| `module` | `VARCHAR(50)` | `NOT NULL` | Module domain (`admin`, `escrow`, `catalog`) |
| `description` | `TEXT` | `NULLABLE` | Description |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Creation timestamp |

### Table 29: `role_permissions`
*Junction table (Role -> Permission).*

| Column Name | Data Type | Constraints & Keys |
| --- | --- | --- |
| `role_id` | `UUID` | `NOT NULL FK -> roles(id) ON DELETE CASCADE` |
| `permission_id` | `UUID` | `NOT NULL FK -> permissions(id) ON DELETE CASCADE` |
| `granted_at` | `TIMESTAMPTZ` | `DEFAULT CURRENT_TIMESTAMP` |
| **PRIMARY KEY** | - | **`PRIMARY KEY (role_id, permission_id)`** |

### Table 30: `user_roles`
*Junction table (User -> Role).*

| Column Name | Data Type | Constraints & Keys |
| --- | --- | --- |
| `user_id` | `UUID` | `NOT NULL FK -> users(id) ON DELETE CASCADE` |
| `role_id` | `UUID` | `NOT NULL FK -> roles(id) ON DELETE CASCADE` |
| `assigned_by` | `UUID` | `NULLABLE FK -> users(id)` |
| `assigned_at` | `TIMESTAMPTZ` | `DEFAULT CURRENT_TIMESTAMP` |
| **PRIMARY KEY** | - | **`PRIMARY KEY (user_id, role_id)`** |
