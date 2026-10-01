
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ApiResponse } from '@bmb2b/shared';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class CatalogService {
  constructor(private readonly dataSource: DataSource) {}

  async getCategories(): Promise<ApiResponse<any[]>> {
    try {
      const allCategories = await this.dataSource.query(`
        SELECT c.id, c.name, c.slug, c.parent_id AS "parentId", c.description, c.icon, c.level, c.is_leaf AS "isLeaf", c.sort_order, c.cover_image AS "pinnedCoverImage",
               (
                 SELECT pi.url
                 FROM products p
                 JOIN product_images pi ON pi.product_id = p.id
                 WHERE p.category_id = c.id AND (p.status = 'PUBLISHED' OR p.status IS NULL)
                 ORDER BY p.created_at DESC, pi.created_at ASC
                 LIMIT 1
               ) AS "autoProductImage"
        FROM categories c
        WHERE c.is_active = TRUE OR c.is_active IS NULL
        ORDER BY c.level ASC, c.sort_order ASC, c.name ASC
      `);

      // Recursive tree builder for Levels 1 through 4
      const buildSubtree = (parentId: string | null): any[] => {
        const children = allCategories.filter((c: any) =>
          parentId === null ? !c.parentId : c.parentId === parentId,
        );
        return children.map((cat: any) => {
          const subs = buildSubtree(cat.id);
          const effectiveCoverImage = cat.pinnedCoverImage || cat.autoProductImage || null;
          return {
            ...cat,
            coverImage: effectiveCoverImage,
            isPinned: Boolean(cat.pinnedCoverImage),
            subcategories: subs.length > 0 ? subs : [],
          };
        });
      };

      const categoryTree = buildSubtree(null);
      return { success: true, data: categoryTree, raw: allCategories } as any;
    } catch (err: any) {
      return { success: false, message: err.message, data: [] };
    }
  }

  async pinCategoryCoverImage(id: string, coverImage: string | null, actorId?: string): Promise<ApiResponse<any>> {
    try {
      const res = await this.dataSource.query(
        `UPDATE categories SET cover_image = $1, updated_at = NOW() WHERE id = $2 RETURNING id, name, cover_image AS "coverImage"`,
        [coverImage ? coverImage.trim() : null, id],
      );
      if (!res || res.length === 0) {
        throw new NotFoundException(`Category ${id} not found.`);
      }

      await this.logAudit(
        actorId || null,
        'PIN_CATEGORY_COVER_IMAGE',
        'CATEGORY',
        id,
        coverImage ? `Pinned cover photo for category "${res[0].name}"` : `Reset cover photo to auto-pull mode for category "${res[0].name}"`,
      );

      return {
        success: true,
        message: coverImage ? `Cover photo pinned for "${res[0].name}".` : `Cover photo reset to auto-pull from latest listing.`,
        data: res[0],
      };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  }

  private async logAudit(actorId: string | null, action: string, targetType: string, targetId: string, details: string) {
    try {
      let actorName = 'System Admin';
      if (actorId) {
        const actorRes = await this.dataSource.query(`SELECT full_name FROM users WHERE id = $1`, [actorId]);
        if (actorRes && actorRes[0]) {
          actorName = actorRes[0].full_name;
        }
      }
      await this.dataSource.query(
        `INSERT INTO admin_audit_logs (actor_user_id, actor_name, action, target_type, target_id, details)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [actorId || null, actorName, action, targetType, targetId, details],
      );
    } catch {
      // Audit logging should not crash primary operations
    }
  }

  async createSubcategory(parentId: string, name: string, icon?: string, actorId?: string): Promise<ApiResponse<any>> {
    return this.createCategory(name, parentId, undefined, icon, actorId);
  }

  async createTopLevelCategory(name: string, description?: string, icon?: string, actorId?: string): Promise<ApiResponse<any>> {
    return this.createCategory(name, undefined, description, icon, actorId);
  }

  async createCategory(name: string, parentId?: string, description?: string, icon?: string, actorId?: string): Promise<ApiResponse<any>> {
    try {
      if (!name || !name.trim()) {
        throw new BadRequestException('Category name is required.');
      }

      // Case-Insensitive Uniqueness Check with Parent & Vertical Context
      const existing = await this.dataSource.query(
        `SELECT c.id, c.name, c.level, p.name AS parent_name, gp.name AS grandparent_name
         FROM categories c
         LEFT JOIN categories p ON c.parent_id = p.id
         LEFT JOIN categories gp ON p.parent_id = gp.id
         WHERE LOWER(TRIM(c.name)) = LOWER($1)`,
        [name.trim()],
      );
      if (existing && existing.length > 0) {
        const item = existing[0];
        const lvl = item.level || 1;
        const tag = lvl === 1 ? 'Vertical' : lvl === 2 ? 'Category' : lvl === 3 ? 'Subcategory' : 'Item Group';
        let context = `as a Level ${lvl} ${tag}`;
        if (item.parent_name) {
          context += ` under Parent: "${item.parent_name}"`;
          if (item.grandparent_name) {
            context += ` (Vertical: "${item.grandparent_name}")`;
          }
        }
        throw new BadRequestException(`Category "${item.name}" already exists ${context}.`);
      }

      let level = 1;
      let targetParentId: string | null = null;

      if (parentId && parentId.trim()) {
        const parentRes = await this.dataSource.query(
          `SELECT id, name, level FROM categories WHERE id = $1`,
          [parentId],
        );
        if (!parentRes || parentRes.length === 0) {
          throw new NotFoundException(`Parent category ${parentId} not found.`);
        }
        targetParentId = parentRes[0].id;
        level = Math.min((parentRes[0].level || 1) + 1, 4);

        // Parent is no longer a leaf node
        await this.dataSource.query(
          `UPDATE categories SET is_leaf = FALSE, updated_at = NOW() WHERE id = $1`,
          [targetParentId],
        );
      }

      const slugBase = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const uniqueSuffix = Math.floor(Math.random() * 10000);
      const slug = `${slugBase}-${uniqueSuffix}`;

      const insertRes = await this.dataSource.query(
        `INSERT INTO categories (parent_id, name, slug, description, icon, level, is_leaf, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, TRUE, TRUE)
         RETURNING id, parent_id AS "parentId", name, slug, description, icon, level, is_leaf AS "isLeaf"`,
        [targetParentId, name.trim(), slug, description || name.trim(), icon ? icon.trim() : 'Package', level],
      );

      const createdCat = insertRes[0];

      await this.logAudit(
        actorId || null,
        'CATEGORY_CREATED',
        'CATEGORY',
        createdCat.id,
        `Created Level ${level} Category "${name.trim()}" (ID: ${createdCat.id})`,
      );

      return {
        success: true,
        message: `Level ${level} Category "${name.trim()}" created successfully.`,
        data: createdCat,
      };
    } catch (err: any) {
      if (err.code === '23505' || err.message?.includes('idx_categories_unique_name')) {
        return { success: false, message: `Category "${name.trim()}" already exists in the catalog.` };
      }
      return { success: false, message: err.message };
    }
  }

  async deleteCategory(id: string, actorId?: string): Promise<ApiResponse<any>> {
    try {
      const catRes = await this.dataSource.query(`SELECT name, parent_id FROM categories WHERE id = $1`, [id]);
      const catName = catRes[0]?.name || id;
      const parentId = catRes[0]?.parent_id;

      await this.dataSource.query(`DELETE FROM categories WHERE id = $1 OR parent_id = $1`, [id]);

      if (parentId) {
        const childCount = await this.dataSource.query(
          `SELECT COUNT(*)::int AS count FROM categories WHERE parent_id = $1`,
          [parentId],
        );
        if (childCount[0]?.count === 0) {
          await this.dataSource.query(
            `UPDATE categories SET is_leaf = TRUE, updated_at = NOW() WHERE id = $1`,
            [parentId],
          );
        }
      }

      await this.logAudit(
        actorId || null,
        'CATEGORY_DELETED',
        'CATEGORY',
        id,
        `Deleted category "${catName}" (ID: ${id}) from catalog`,
      );

      return {
        success: true,
        message: `Category "${catName}" deleted successfully from catalog.`,
      };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  }

  async updateCategory(id: string, name: string, description?: string, icon?: string, actorId?: string): Promise<ApiResponse<any>> {
    try {
      if (!id || !name || !name.trim()) {
        throw new BadRequestException('Category ID and name are required.');
      }

      // Case-Insensitive Uniqueness Check with Parent & Vertical Context (excluding current category ID)
      const existing = await this.dataSource.query(
        `SELECT c.id, c.name, c.level, p.name AS parent_name, gp.name AS grandparent_name
         FROM categories c
         LEFT JOIN categories p ON c.parent_id = p.id
         LEFT JOIN categories gp ON p.parent_id = gp.id
         WHERE LOWER(TRIM(c.name)) = LOWER($1) AND c.id != $2`,
        [name.trim(), id],
      );
      if (existing && existing.length > 0) {
        const item = existing[0];
        const lvl = item.level || 1;
        const tag = lvl === 1 ? 'Vertical' : lvl === 2 ? 'Category' : lvl === 3 ? 'Subcategory' : 'Item Group';
        let context = `as a Level ${lvl} ${tag}`;
        if (item.parent_name) {
          context += ` under Parent: "${item.parent_name}"`;
          if (item.grandparent_name) {
            context += ` (Vertical: "${item.grandparent_name}")`;
          }
        }
        throw new BadRequestException(`Category "${item.name}" already exists ${context}.`);
      }

      const slugBase = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const uniqueSuffix = Math.floor(Math.random() * 10000);
      const slug = `${slugBase}-${uniqueSuffix}`;

      const res = await this.dataSource.query(
        `UPDATE categories
         SET name = $1, slug = $2, description = COALESCE($3, description), icon = COALESCE($4, icon), updated_at = NOW()
         WHERE id = $5
         RETURNING id, parent_id AS "parentId", name, slug, description, icon, level, is_leaf AS "isLeaf"`,
        [name.trim(), slug, description ? description.trim() : null, icon ? icon.trim() : null, id],
      );

      if (!res || res.length === 0) {
        throw new NotFoundException(`Category ${id} not found.`);
      }

      await this.logAudit(
        actorId || null,
        'CATEGORY_UPDATED',
        'CATEGORY',
        id,
        `Updated category name to "${name.trim()}" (ID: ${id})`,
      );

      return {
        success: true,
        message: `Category updated to "${name.trim()}".`,
        data: res[0],
      };
    } catch (err: any) {
      if (err.code === '23505' || err.message?.includes('idx_categories_unique_name')) {
        return { success: false, message: `Category "${name.trim()}" already exists in the catalog.` };
      }
      return { success: false, message: err.message };
    }
  }


  async getProducts(query?: { categoryId?: string; sellerBusinessId?: string; status?: string; search?: string }): Promise<ApiResponse<any[]>> {
    try {
      let sql = `
        SELECT p.id, p.name, p.description, p.price, p.currency, p.moq, p.unit,
               p.stock_quantity AS "stockQuantity",
               p.availability_status AS "stockStatus",
               p.lead_time AS "leadTime",
               p.specifications,
               p.status,
               p.category_id AS "categoryId",
               c.name AS "categoryName",
               b.id AS "sellerId",
               b.name AS "sellerBusinessName",
               (b.verification_status = 'verified') AS "sellerVerified",
               COALESCE(
                 (SELECT json_agg(pi.url) FROM product_images pi WHERE pi.product_id = p.id),
                 '[]'::json
               ) AS "images",
               p.created_at AS "createdAt"
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        LEFT JOIN businesses b ON b.id = p.seller_business_id
        WHERE 1=1
      `;
      const params: any[] = [];

      // Filter out products of suspended/banned sellers in public marketplace feed
      if (!query?.sellerBusinessId) {
        sql += ` AND (b.verification_status NOT IN ('suspended', 'banned') OR b.verification_status IS NULL)`;
      }

      if (query?.categoryId && query.categoryId !== 'all') {
        params.push(query.categoryId);
        sql += ` AND p.category_id = $${params.length}`;
      }

      if (query?.sellerBusinessId) {
        params.push(query.sellerBusinessId);
        sql += ` AND p.seller_business_id = $${params.length}`;
      }

      if (query?.status) {
        params.push(query.status);
        sql += ` AND p.status = $${params.length}`;
      }

      if (query?.search) {
        params.push(`%${query.search.toLowerCase()}%`);
        sql += ` AND (LOWER(p.name) LIKE $${params.length} OR LOWER(p.description) LIKE $${params.length})`;
      }

      sql += ` ORDER BY p.created_at DESC`;

      const products = await this.dataSource.query(sql, params);
      return { success: true, data: products };
    } catch (err: any) {
      return { success: false, message: err.message, data: [] };
    }
  }

  async getProductById(id: string): Promise<ApiResponse<any>> {
    try {
      const res = await this.dataSource.query(
        `SELECT p.id, p.name, p.description, p.price, p.currency, p.moq, p.unit,
                p.stock_quantity AS "stockQuantity",
                p.availability_status AS "stockStatus",
                p.lead_time AS "leadTime",
                p.specifications,
                p.status,
                p.rejection_reason AS "rejectionReason",
                p.category_id AS "categoryId",
                c.name AS "categoryName",
                b.id AS "sellerId",
                b.name AS "sellerBusinessName",
                (b.verification_status = 'verified') AS "sellerVerified",
                COALESCE(
                  (SELECT json_agg(pi.url) FROM product_images pi WHERE pi.product_id = p.id),
                  '[]'::json
                ) AS "images"
         FROM products p
         LEFT JOIN categories c ON c.id = p.category_id
         LEFT JOIN businesses b ON b.id = p.seller_business_id
         WHERE p.id = $1`,
        [id],
      );

      if (!res || res.length === 0) {
        throw new NotFoundException('Product not found');
      }

      return { success: true, data: res[0] };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  }

  async createProduct(dto: CreateProductDto, userId?: string): Promise<ApiResponse<any>> {
    try {
      let targetUserId = userId;

      // Find or resolve seller's business
      let sellerBusinessId: string | null = null;

      // 1. If targetUserId is provided, find business owned by this user
      if (targetUserId) {
        const bizRes = await this.dataSource.query(`SELECT id FROM businesses WHERE owner_user_id = $1`, [targetUserId]);
        if (bizRes && bizRes.length > 0) {
          sellerBusinessId = bizRes[0].id;
        }
      }

      // 2. If sellerBusinessId provided and is a valid UUID, verify it exists
      if (!sellerBusinessId) {
        const isBizUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(dto.sellerBusinessId || '');
        if (isBizUuid) {
          const bizCheck = await this.dataSource.query(`SELECT id FROM businesses WHERE id = $1`, [dto.sellerBusinessId]);
          if (bizCheck && bizCheck.length > 0) {
            sellerBusinessId = bizCheck[0].id;
          }
        }
      }

      // 3. Match by sellerBusinessName
      if (!sellerBusinessId && dto.sellerBusinessName) {
        const bizByName = await this.dataSource.query(
          `SELECT id FROM businesses WHERE LOWER(TRIM(name)) = LOWER(TRIM($1))`,
          [dto.sellerBusinessName],
        );
        if (bizByName && bizByName.length > 0) {
          sellerBusinessId = bizByName[0].id;
        }
      }

      // 4. Fallback to any business or create one for default user
      if (!sellerBusinessId) {
        const anyBiz = await this.dataSource.query(`SELECT id FROM businesses ORDER BY created_at DESC LIMIT 1`);
        if (anyBiz && anyBiz.length > 0) {
          sellerBusinessId = anyBiz[0].id;
        } else {
          const defaultUser = await this.dataSource.query(`SELECT id FROM users LIMIT 1`);
          const fallbackUserId = defaultUser[0]?.id || null;
          const createdBiz = await this.dataSource.query(
            `INSERT INTO businesses (owner_user_id, name, business_type_code, can_buy, can_sell, verification_status)
             VALUES ($1, $2, 'producer', TRUE, TRUE, 'pending')
             RETURNING id`,
            [fallbackUserId, dto.sellerBusinessName ? dto.sellerBusinessName.trim() : 'Prime B2B Producer PLC'],
          );
          sellerBusinessId = createdBiz[0].id;
        }
      }
      // --- Seller Subscription & Listing Limit Enforcement ---
      if (sellerBusinessId) {
        const subRes = await this.dataSource.query(
          `SELECT subscription_plan AS "subscriptionPlan",
                  subscription_start_date AS "subscriptionStartDate",
                  subscription_end_date AS "subscriptionEndDate",
                  subscription_status AS "subscriptionStatus",
                  listing_limit AS "listingLimit"
           FROM businesses WHERE id = $1`,
          [sellerBusinessId],
        );

        if (subRes && subRes.length > 0) {
          const bizSub = subRes[0];
          const listingLimit = Number(bizSub.listingLimit) || 5;
          const subStatus = bizSub.subscriptionStatus || 'ACTIVE';
          const planName = bizSub.subscriptionPlan || 'FREE';
          const endDate = bizSub.subscriptionEndDate ? new Date(bizSub.subscriptionEndDate) : null;

          // Check if subscription has expired
          if (endDate && endDate < new Date()) {
            return {
              success: false,
              message: `Your seller subscription (${planName}) expired on ${endDate.toLocaleDateString()}. Please renew your subscription to publish new product listings.`,
            };
          }

          if (subStatus === 'EXPIRED' || subStatus === 'CANCELLED') {
            return {
              success: false,
              message: `Your seller subscription status is ${subStatus}. Please activate a subscription plan to add new product listings.`,
            };
          }

          // Count existing active & published products for this seller business
          const countRes = await this.dataSource.query(
            `SELECT COUNT(*)::int AS count FROM products WHERE seller_business_id = $1`,
            [sellerBusinessId],
          );
          const currentCount = countRes[0]?.count || 0;

          if (currentCount >= listingLimit) {
            return {
              success: false,
              message: `Listing limit reached (${currentCount}/${listingLimit} listings used on ${planName} plan). To publish a 6th listing, please upgrade your subscription plan.`,
              limitReached: true,
              currentCount,
              listingLimit,
            } as any;
          }
        }
      }

      // Safely resolve category ID (handling UUID vs slug vs default fallback)
      let categoryId: string | null = null;
      const isCatUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(dto.categoryId || '');

      if (isCatUuid) {
        const catRes = await this.dataSource.query(`SELECT id FROM categories WHERE id = $1`, [dto.categoryId]);
        if (catRes && catRes.length > 0) {
          categoryId = catRes[0].id;
        }
      }

      if (!categoryId && dto.categoryId) {
        const catRes = await this.dataSource.query(
          `SELECT id FROM categories WHERE slug = $1 OR LOWER(name) = LOWER($1)`,
          [dto.categoryId],
        );
        if (catRes && catRes.length > 0) {
          categoryId = catRes[0].id;
        }
      }

      if (!categoryId) {
        const fallbackCat = await this.dataSource.query(`SELECT id FROM categories LIMIT 1`);
        if (fallbackCat && fallbackCat.length > 0) {
          categoryId = fallbackCat[0].id;
        } else {
          const newCat = await this.dataSource.query(
            `INSERT INTO categories (name, slug, description, level, is_leaf, is_active)
             VALUES ('General B2B Products', 'general', 'General B2B Wholesale Listings', 1, TRUE, TRUE)
             RETURNING id`,
          );
          categoryId = newCat[0].id;
        }
      }

      const status = dto.status && ['DRAFT', 'PENDING_APPROVAL'].includes(dto.status.toUpperCase())
        ? dto.status.toUpperCase()
        : 'PENDING_APPROVAL';

      const insertRes = await this.dataSource.query(
        `INSERT INTO products (
          seller_business_id, category_id, name, description, price, currency,
          moq, unit, stock_quantity, availability_status, lead_time, specifications, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb, $13)
        RETURNING id, name, status, created_at`,
        [
          sellerBusinessId,
          categoryId,
          dto.name,
          dto.description || dto.name,
          dto.price,
          dto.currency || 'ETB',
          dto.moq || 1,
          dto.unit || 'pcs',
          dto.stockQuantity ?? 100,
          dto.stockStatus || 'in_stock',
          dto.leadTime || '2-4 days',
          JSON.stringify(dto.specifications || {}),
          status,
        ],
      );

      const productId = insertRes[0].id;

      if (dto.images && dto.images.length > 0) {
        for (let i = 0; i < dto.images.length; i++) {
          await this.dataSource.query(
            `INSERT INTO product_images (product_id, url, sort_order, is_primary)
             VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING`,
            [productId, dto.images[i], i, i === 0],
          );
        }
      }

      if ((dto as any).priceTiers && Array.isArray((dto as any).priceTiers)) {
        for (const tier of (dto as any).priceTiers) {
          if (tier.minQty && tier.pricePerUnit) {
            await this.dataSource.query(
              `INSERT INTO product_price_tiers (product_id, min_quantity, price_per_unit)
               VALUES ($1, $2, $3) ON CONFLICT (product_id, min_quantity) DO UPDATE SET price_per_unit = $3`,
              [productId, tier.minQty, tier.pricePerUnit],
            ).catch(() => null);
          }
        }
      }

      await this.logAudit(
        targetUserId || null,
        'PRODUCT_CREATED',
        'PRODUCT',
        productId,
        `Created product listing "${dto.name}" with status ${status}`,
      );

      return {
        success: true,
        message: 'Product listing created and saved to database successfully.',
        data: {
          id: productId,
          name: dto.name,
          status,
          sellerBusinessId,
          categoryId,
        },
      };
    } catch (err: any) {
      console.error('Error in createProduct database execution:', err);
      return { success: false, message: err.message };
    }
  }

  async updateProduct(id: string, dto: Partial<CreateProductDto>): Promise<ApiResponse<any>> {
    try {
      const hasMediaOrContentChange = Boolean(
        (dto.images && dto.images.length > 0) || dto.name || dto.description || dto.specifications
      );
      const targetStatus = (dto as any).status || (hasMediaOrContentChange ? 'PENDING_APPROVAL' : undefined);

      await this.dataSource.query(
        `UPDATE products SET 
          name = COALESCE($1, name),
          price = COALESCE($2, price),
          moq = COALESCE($3, moq),
          unit = COALESCE($4, unit),
          stock_quantity = COALESCE($5, stock_quantity),
          availability_status = COALESCE($6, availability_status),
          status = COALESCE($7, status),
          updated_at = NOW()
         WHERE id = $8`,
        [dto.name, dto.price, dto.moq, dto.unit, dto.stockQuantity, dto.stockStatus, targetStatus, id],
      );

      if (dto.images && Array.isArray(dto.images)) {
        await this.dataSource.query(`DELETE FROM product_images WHERE product_id = $1`, [id]);
        for (let i = 0; i < dto.images.length; i++) {
          await this.dataSource.query(
            `INSERT INTO product_images (product_id, url, sort_order, is_primary)
             VALUES ($1, $2, $3, $4)`,
            [id, dto.images[i], i, i === 0],
          );
        }
      }

      await this.logAudit(
        null,
        hasMediaOrContentChange ? 'PRODUCT_SUBMITTED_FOR_REAPPROVAL' : 'PRODUCT_UPDATED',
        'PRODUCT',
        id,
        hasMediaOrContentChange
          ? `Primary cover image or product listing content updated for product ${id}. Status changed to PENDING_APPROVAL for admin moderation.`
          : `Updated stock/availability parameters for product ${id}.`,
      );

      return {
        success: true,
        message: hasMediaOrContentChange
          ? 'Primary cover image & listing details updated and sent to Admin Console for moderation re-approval.'
          : 'Product updated successfully.',
        data: { status: targetStatus || 'PUBLISHED' },
      };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  }

  async deleteProduct(id: string): Promise<ApiResponse<any>> {
    try {
      await this.dataSource.query(`DELETE FROM products WHERE id = $1`, [id]);
      return { success: true, message: 'Product deleted successfully.' };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  }

  async getSellerById(idOrName: string): Promise<ApiResponse<any>> {
    try {
      const rows = await this.dataSource.query(
        `SELECT 
           b.id,
           b.name,
           b.business_type_code AS "role",
           b.phone,
           b.tin_number AS "tinNumber",
           b.trade_license_number AS "licenseNumber",
           b.verification_status AS "verificationStatus",
           b.description,
           EXTRACT(YEAR FROM b.created_at)::int AS "establishedYear",
           COALESCE(ba.region, 'Addis Ababa') AS "region",
           COALESCE(ba.city, 'Addis Ababa') AS "city",
           COALESCE(ba.subcity, '') AS "subcity",
           (
             SELECT COUNT(*)::int
             FROM orders o
             WHERE o.seller_business_id = b.id AND o.status = 'delivered'
           ) AS "totalOrdersCompleted"
         FROM businesses b
         LEFT JOIN business_addresses ba ON ba.business_id = b.id AND ba.is_default_shipping = TRUE
         WHERE b.id::text = $1 OR LOWER(b.name) = LOWER($1)
         LIMIT 1`,
        [idOrName],
      );

      if (!rows || rows.length === 0) {
        const fallbackRows = await this.dataSource.query(
          `SELECT 
             b.id,
             b.name,
             b.business_type_code AS "role",
             b.phone,
             b.tin_number AS "tinNumber",
             b.trade_license_number AS "licenseNumber",
             b.verification_status AS "verificationStatus",
             b.description,
             EXTRACT(YEAR FROM b.created_at)::int AS "establishedYear",
             'Addis Ababa' AS "region",
             'Addis Ababa' AS "city",
             '' AS "subcity",
             (
               SELECT COUNT(*)::int
               FROM orders o
               WHERE o.seller_business_id = b.id AND o.status = 'delivered'
             ) AS "totalOrdersCompleted"
           FROM businesses b
           WHERE b.id::text = $1 OR LOWER(b.name) = LOWER($1)
           LIMIT 1`,
          [idOrName],
        );

        if (!fallbackRows || fallbackRows.length === 0) {
          return { success: false, message: 'Seller profile not found' };
        }

        const seller = {
          ...fallbackRows[0],
          averageResponseTime: '< 1 hour',
          responseRate: '100%',
          rating: 4.9,
        };
        return { success: true, data: { seller } };
      }

      const seller = {
        ...rows[0],
        averageResponseTime: '< 1 hour',
        responseRate: '100%',
        rating: 4.9,
      };

      return { success: true, data: { seller } };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  }
}

