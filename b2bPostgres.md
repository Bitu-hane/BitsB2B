# BitsB2B Marketplace

## PostgreSQL Relational Database Schema Specification

## Section 1: Authentication, Credentials & RBAC Tables

### Table: 1. users

Primary user identity record (Buyers, Sellers, Dual Traders & Admins).

| Column Name | Data Type | Constraints & Keys | Description |
| --- | --- | --- | --- |
| id | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | Unique user identifier |
| full_name | VARCHAR(150) | NOT NULL | Full name of account owner |
| phone | VARCHAR(30) | NOT NULL UNIQUE | Mobile phone number (SMS OTP login) |
| email | VARCHAR(150) | NULLABLE UNIQUE | Account email address |
| avatar_url | TEXT | NULLABLE | Profile avatar image link |
| is_active | BOOLEAN | DEFAULT TRUE | Account active status flag |
| is_verified | BOOLEAN | DEFAULT FALSE | Identity verification status flag |
| created_at | TIMESTAMPTZ | DEFAULT CURRENT_TIMESTAMP | Account creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT CURRENT_TIMESTAMP | Last profile update timestamp |

### Table: 2. credentials

Stores passwords, hashes, and OTP secrets linked to user identities.

| Column Name | Data Type | Constraints & Keys | Description |
| --- | --- | --- | --- |
| id | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | Unique credential record ID |
| user_id | UUID | NOT NULL REFERENCES users(id) ON DELETE CASCADE | Foreign Key to users table |
| password_hash | VARCHAR(255) | NULLABLE | Salted password hash (Argon2/BCrypt) |
| password_salt | VARCHAR(255) | NULLABLE | Cryptographic salt string |
| otp_secret | VARCHAR(100) | NULLABLE | SMS OTP secret token |
| failed_attempts | INTEGER | DEFAULT 0 | Consecutive failed login counter |
| created_at | TIMESTAMPTZ | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT CURRENT_TIMESTAMP | Last credentials update timestamp |

### Table: 3. authentications

Tracks active user login sessions, JWT refresh tokens, and device metadata.

| Column Name | Data Type | Constraints & Keys | Description |
| --- | --- | --- | --- |
| id | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | Session identifier |
| user_id | UUID | NOT NULL REFERENCES users(id) ON DELETE CASCADE | Foreign Key to users table |
| refresh_token_hash | VARCHAR(255) | NOT NULL UNIQUE | Hashed JWT refresh token |
| device_info | VARCHAR(255) | NULLABLE | User Agent device metadata |
| ip_address | VARCHAR(45) | NULLABLE | IPv4 / IPv6 client address |
| expires_at | TIMESTAMPTZ | NOT NULL | Session expiration timestamp |
| revoked_at | TIMESTAMPTZ | NULLABLE | Token revocation timestamp |
| created_at | TIMESTAMPTZ | DEFAULT CURRENT_TIMESTAMP | Session start timestamp |

### Table: 4. roles

Defines system and domain roles (ROLE_ADMIN, ROLE_BUYER, ROLE_SELLER, ROLE_DUAL_TRADER).

| Column Name | Data Type | Constraints & Keys | Description |
| --- | --- | --- | --- |
| id | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | Role ID |
| name | VARCHAR(50) | NOT NULL UNIQUE | Display role title |
| description | TEXT | NULLABLE | Role scope description |
| created_at | TIMESTAMPTZ | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |

### Table: 5. permissions

Granular system access permissions across catalog, orders, escrow & admin module.

| Column Name | Data Type | Constraints & Keys | Description |
| --- | --- | --- | --- |
| id | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | Permission ID |
| name | VARCHAR(100) | NOT NULL UNIQUE | Display permission title |
| code | VARCHAR(100) | NOT NULL UNIQUE | Permission code (e.g. order:release_escrow) |
| module | VARCHAR(50) | NOT NULL | Module category (catalog, escrow, admin) |
| description | TEXT | NULLABLE | Permission behavior description |
| created_at | TIMESTAMPTZ | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |

### Table: 6. role_permissions

Junction Table mapping granular permissions to roles (Many-to-Many).

| Column Name | Data Type | Constraints & Keys | Description |
| --- | --- | --- | --- |
| role_id | UUID | NOT NULL REFERENCES roles(id) ON DELETE CASCADE | Foreign Key to roles table |
| permission_id | UUID | NOT NULL REFERENCES permissions(id) ON DELETE CASCADE | Foreign Key to permissions table |
| granted_at | TIMESTAMPTZ | DEFAULT CURRENT_TIMESTAMP | Grant timestamp |
| rolePermit_id | - | PRIMARY KEY (role_id, permission_id) | Unique mapping constraint |

### Table: 7. user_roles

Junction Table mapping roles to users (Many-to-Many, supports Admin & Dual Trading).

| Column Name | Data Type | Constraints & Keys | Description |
| --- | --- | --- | --- |
| user_id | UUID | NOT NULL REFERENCES users(id) ON DELETE CASCADE | Foreign Key to users table |
| role_id | UUID | NOT NULL REFERENCES roles(id) ON DELETE CASCADE | Foreign Key to roles table |
| assigned_by | UUID | NULLABLE REFERENCES users(id) | Foreign Key to Admin users ID |
| assigned_at | TIMESTAMPTZ | DEFAULT CURRENT_TIMESTAMP | Assignment timestamp |
| userRole_id | - | PRIMARY KEY (user_id, role_id) | Unique mapping constraint |

## Section 2: Enterprise Business & Marketplace Core Tables

### Table: 8. businesses

Enterprise profile with dual-role capability flags & TIN verification status.

| Column Name | Data Type | Constraints & Keys | Description |
| --- | --- | --- | --- |
| id | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | Business profile ID |
| user_id | UUID | NOT NULL REFERENCES users(id) ON DELETE CASCADE | Foreign Key to owner users ID |
| name | VARCHAR(200) | NOT NULL | Legal enterprise name |
| primary_role | VARCHAR(50) | NOT NULL | Primary business classification |
| capabilities | TEXT[] | DEFAULT ARRAY['can_buy', 'can_sell'] | Capabilities array |
| can_buy | BOOLEAN | DEFAULT TRUE | Purchasing capability flag |
| can_sell | BOOLEAN | DEFAULT TRUE | Selling capability flag |
| phone | VARCHAR(30) | NOT NULL | Business contact phone |
| region | VARCHAR(100) | NOT NULL | Ethiopian region |
| city | VARCHAR(100) | NOT NULL | City name |
| subcity | VARCHAR(100) | NULLABLE | Subcity jurisdiction |
| kebele | VARCHAR(50) | NULLABLE | Kebele administrative unit |
| landmark | VARCHAR(200) | NULLABLE | Nearby landmark |
| tin_number | VARCHAR(50) | NULLABLE | Tax Identification Number |
| trade_license_number | VARCHAR(100) | NULLABLE | Business Registration License |
| is_verified | BOOLEAN | DEFAULT FALSE | Business TIN verification flag |
| verification_status | VARCHAR(30) | DEFAULT 'pending' | Status (verified, pending, rejected) |
| verified_at | TIMESTAMPTZ | NULLABLE | Admin approval timestamp |
| verified_by | UUID | NULLABLE REFERENCES users(id) | Foreign Key to Admin users ID |
| established_year | INTEGER | NULLABLE | Year established |
| average_response_time | VARCHAR(50) | DEFAULT '< 2 hours' | Response SLA |
| response_rate | VARCHAR(20) | DEFAULT '100%' | Response rate percentage |
| rating | NUMERIC(3, 2) | DEFAULT 5.00 | Supplier rating score |
| total_orders_completed | INTEGER | DEFAULT 0 | Fulfillment order tally |
| description | TEXT | NULLABLE | Company bio / capacity |
| created_at | TIMESTAMPTZ | DEFAULT CURRENT_TIMESTAMP | Profile creation timestamp |

### Table: 9. categories

Wholesale product categories.

| Column Name | Data Type | Constraints & Keys | Description |
| --- | --- | --- | --- |
| id | VARCHAR(50) | PRIMARY KEY | Category ID (e.g. cat-industrial) |
| name | VARCHAR(150) | NOT NULL | Category display title |
| description | TEXT | NULLABLE | Category scope summary |

### Table: 10. products

B2B wholesale product listings published by enterprises with can_sell = TRUE.

| Column Name | Data Type | Constraints & Keys | Description |
| --- | --- | --- | --- |
| id | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | Product ID |
| seller_business_id | UUID | NOT NULL REFERENCES businesses(id) ON DELETE CASCADE | Foreign Key to seller businesses ID |
| seller_user_id | UUID | NOT NULL REFERENCES users(id) ON DELETE CASCADE | Foreign Key to seller users ID |
| category_id | VARCHAR(50) | NOT NULL REFERENCES categories(id) ON DELETE RESTRICT | Foreign Key to categories table |
| name | VARCHAR(255) | NOT NULL | Wholesale item title |
| description | TEXT | NOT NULL | Product description |
| price | NUMERIC(12, 2) | NOT NULL | Base unit price |
| currency | VARCHAR(10) | DEFAULT 'ETB' | Currency code |
| moq | INTEGER | NOT NULL DEFAULT 1 | Minimum Order Quantity |
| unit | VARCHAR(50) | NOT NULL | Quantity unit (e.g. pieces) |
| stock_status | VARCHAR(30) | DEFAULT 'in_stock' | Status (in_stock, low_stock, out_of_stock) |
| stock_quantity | INTEGER | DEFAULT 0 | Quantity in stock |
| stock_last_updated | VARCHAR(50) | DEFAULT 'Just now' | Human-readable update timestamp |
| lead_time | VARCHAR(100) | DEFAULT '3-5 business days' | Delivery lead time |
| delivery_zones | JSONB | NULL | Array of supported regions |
| images | JSONB | NOT NULL | Array of image URLs |
| specifications | JSONB | NOT NULL | Key-value specifications JSON |
| created_at | TIMESTAMPTZ | DEFAULT CURRENT_TIMESTAMP | Publication timestamp |

### Table: 11. product_price_tiers

Dynamic volume discount tier pricing per product.

| Column Name | Data Type | Constraints & Keys | Description |
| --- | --- | --- | --- |
| id | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | Tier record ID |
| product_id | UUID | NOT NULL REFERENCES products(id) ON DELETE CASCADE | Foreign Key to products table |
| min_quantity | INTEGER | NOT NULL | Minimum threshold quantity |
| price_per_unit | NUMERIC(12, 2) | NOT NULL | Discounted unit price |

### Table: 12. orders

Escrow protected purchase orders placed on the platform.

| Column Name | Data Type | Constraints & Keys | Description |
| --- | --- | --- | --- |
| id | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | Order ID |
| order_number | VARCHAR(50) | NOT NULL UNIQUE | Human order code (e.g. ORD-84920) |
| buyer_user_id | UUID | NOT NULL REFERENCES users(id) ON DELETE RESTRICT | Foreign Key to buyer users ID |
| buyer_business_id | UUID | NOT NULL REFERENCES businesses(id) ON DELETE RESTRICT | Foreign Key to buyer businesses ID |
| buyer_business_name | VARCHAR(200) | NOT NULL | Denormalized buyer company name |
| buyer_name | VARCHAR(150) | NOT NULL | Buyer representative name |
| buyer_phone | VARCHAR(30) | NOT NULL | Buyer phone |
| seller_user_id | UUID | NOT NULL REFERENCES users(id) ON DELETE RESTRICT | Foreign Key to seller users ID |
| seller_business_id | UUID | NOT NULL REFERENCES businesses(id) ON DELETE RESTRICT | Foreign Key to seller businesses ID |
| seller_business_name | VARCHAR(200) | NOT NULL | Denormalized seller company name |
| status | VARCHAR(30) | DEFAULT 'placed' | Status (placed, confirmed, shipped, delivered) |
| escrow_status | VARCHAR(30) | DEFAULT 'held_in_escrow' | Escrow status (held_in_escrow, released, refunded) |
| escrow_provider | VARCHAR(50) | DEFAULT 'telebirr' | Escrow provider (telebirr, cbe_birr) |
| payment_method | VARCHAR(50) | DEFAULT 'telebirr' | Payment method |
| payment_transaction_ref | VARCHAR(100) | NULLABLE | Financial transaction reference |
| total_amount | NUMERIC(14, 2) | NOT NULL | Total transaction value |
| currency | VARCHAR(10) | DEFAULT 'ETB' | Currency code |
| delivery_address | JSONB | NOT NULL | Complete shipping address JSON |
| tracking_number | VARCHAR(100) | NULLABLE | Freight tracking code |
| freight_carrier | VARCHAR(100) | NULLABLE | Logistics carrier |
| created_at | TIMESTAMPTZ | DEFAULT CURRENT_TIMESTAMP | Placement timestamp |
| confirmed_at | TIMESTAMPTZ | NULLABLE | Seller confirmation timestamp |
| shipped_at | TIMESTAMPTZ | NULLABLE | Dispatch timestamp |
| delivered_at | TIMESTAMPTZ | NULLABLE | Delivery timestamp |
| escrow_released_at | TIMESTAMPTZ | NULLABLE | Escrow payout release timestamp |

### Table: 13. order_items

Individual line items inside a purchase order.

| Column Name | Data Type | Constraints & Keys | Description |
| --- | --- | --- | --- |
| id | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | Line item ID |
| order_id | UUID | NOT NULL REFERENCES orders(id) ON DELETE CASCADE | Foreign Key to orders table |
| product_id | UUID | NOT NULL REFERENCES products(id) ON DELETE RESTRICT | Foreign Key to products table |
| product_name | VARCHAR(255) | NOT NULL | Denormalized item title |
| product_image | TEXT | NULLABLE | Denormalized image thumbnail |
| quantity | INTEGER | NOT NULL | Quantity ordered |
| unit | VARCHAR(50) | NOT NULL | Quantity unit |
| unit_price | NUMERIC(12, 2) | NOT NULL | Applied unit price |
| total_price | NUMERIC(14, 2) | NOT NULL | Total line item cost |

### Table: 14. inquiries

Product-anchored Request for Quotation (RFQ) inquiry threads.

| Column Name | Data Type | Constraints & Keys | Description |
| --- | --- | --- | --- |
| id | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | Inquiry thread ID |
| product_id | UUID | NOT NULL REFERENCES products(id) ON DELETE CASCADE | Foreign Key to products table |
| product_name | VARCHAR(255) | NOT NULL | Denormalized item title |
| buyer_user_id | UUID | NOT NULL REFERENCES users(id) ON DELETE CASCADE | Foreign Key to buyer users ID |
| buyer_business_id | UUID | NOT NULL REFERENCES businesses(id) ON DELETE CASCADE | Foreign Key to buyer businesses ID |
| buyer_business_name | VARCHAR(200) | NOT NULL | Denormalized buyer company |
| seller_user_id | UUID | NOT NULL REFERENCES users(id) ON DELETE CASCADE | Foreign Key to seller users ID |
| seller_business_id | UUID | NOT NULL REFERENCES businesses(id) ON DELETE CASCADE | Foreign Key to seller businesses ID |
| seller_business_name | VARCHAR(200) | NOT NULL | Denormalized seller company |
| topic | VARCHAR(50) | NOT NULL | Inquiry topic (pricing, specifications, sample) |
| target_quantity | INTEGER | NULLABLE | Target bulk order size |
| target_price | NUMERIC(12, 2) | NULLABLE | Requested target unit price |
| status | VARCHAR(30) | DEFAULT 'pending_reply' | Thread status (pending_reply, replied, closed) |
| created_at | TIMESTAMPTZ | DEFAULT CURRENT_TIMESTAMP | Thread start timestamp |

### Table: 15. inquiry_messages

Messages exchanged within an RFQ inquiry thread.

| Column Name | Data Type | Constraints & Keys | Description |
| --- | --- | --- | --- |
| id | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | Message ID |
| inquiry_id | UUID | NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE | Foreign Key to inquiries table |
| sender_user_id | UUID | NOT NULL REFERENCES users(id) ON DELETE CASCADE | Foreign Key to sender users ID |
| sender_name | VARCHAR(150) | NOT NULL | Sender full name |
| sender_business | VARCHAR(200) | NOT NULL | Sender business name |
| role_in_thread | VARCHAR(20) | NOT NULL | Sender role (buyer / seller) |
| text | TEXT | NOT NULL | Message text content |
| created_at | TIMESTAMPTZ | DEFAULT CURRENT_TIMESTAMP | Message timestamp |

### Table: 16. notifications

User in-app notifications and system alerts.

| Column Name | Data Type | Constraints & Keys | Description |
| --- | --- | --- | --- |
| id | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | Notification ID |
| user_id | UUID | NOT NULL REFERENCES users(id) ON DELETE CASCADE | Foreign Key to recipient users ID |
| title | VARCHAR(200) | NOT NULL | Alert headline |
| message | TEXT | NOT NULL | Alert body text |
| type | VARCHAR(50) | NOT NULL | Type (order_status, inquiry_reply, escrow_update) |
| read | BOOLEAN | DEFAULT FALSE | Read status flag |
| created_at | TIMESTAMPTZ | DEFAULT CURRENT_TIMESTAMP | Notification timestamp |

### Table: 17. sms_logs

Audit log of outbound SMS verification OTPs and escrow alerts.

| Column Name | Data Type | Constraints & Keys | Description |
| --- | --- | --- | --- |
| id | UUID | PRIMARY KEY DEFAULT gen_random_uuid() | Log entry ID |
| phone | VARCHAR(30) | NOT NULL | Recipient phone number |
| message | TEXT | NOT NULL | SMS content |
| sent_at | TIMESTAMPTZ | DEFAULT CURRENT_TIMESTAMP | Outbound dispatch timestamp |
