import { Injectable, ForbiddenException, NotFoundException, Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  VerificationState,
  BusinessSubRole,
  StaffRole,
  ESCROW_RELEASE_THRESHOLD_ETB,
  PlatformMetrics,
  ApiResponse,
} from '@bmb2b/shared';

@Injectable()
export class AdminService {
  constructor(
    @Inject(DataSource)
    private readonly dataSource: DataSource,
  ) {}

  private async logAudit(actorId: string, action: string, targetType: string, targetId: string, details: string) {
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

  async getMetrics(): Promise<ApiResponse<any>> {
    try {
      const usersCountRes = await this.dataSource.query(`SELECT COUNT(*)::int AS count FROM users WHERE staff_role IS NULL`);
      const pendingCountRes = await this.dataSource.query(
        `SELECT COUNT(*)::int AS count FROM users WHERE (verification_state = 'PENDING_REVIEW' OR (verification_state IS NULL AND is_verified IS NOT TRUE)) AND staff_role IS NULL`,
      );
      const listingsCountRes = await this.dataSource.query(
        `SELECT COUNT(*)::int AS count FROM products WHERE status = 'PUBLISHED'`,
      ).catch(() => [{ count: 0 }]);
      const pendingListingsRes = await this.dataSource.query(
        `SELECT COUNT(*)::int AS count FROM products WHERE status IN ('PENDING_APPROVAL', 'FLAGGED', 'Pending approval', 'Flagged')`,
      ).catch(() => [{ count: 0 }]);
      const escrowRes = await this.dataSource.query(
        `SELECT COALESCE(SUM(total_price), 0)::float AS total FROM orders WHERE escrow_status = 'HELD_ESCROW'`,
      ).catch(() => [{ total: 0 }]);
      const disputesCountRes = await this.dataSource.query(
        `SELECT COUNT(*)::int AS count FROM dispute_cases WHERE status IN ('OPEN', 'INVESTIGATING', 'RECOMMENDED_REFUND', 'RECOMMENDED_RELEASE')`,
      ).catch(() => [{ count: 0 }]);

      const roleRows = await this.dataSource.query(`
        SELECT COALESCE(b.business_type_code, 'other') AS role, COUNT(*)::int AS count
        FROM users u
        LEFT JOIN businesses b ON b.owner_user_id = u.id
        WHERE u.staff_role IS NULL
        GROUP BY COALESCE(b.business_type_code, 'other')
      `).catch(() => []);

      const rolesBreakdown: Record<string, number> = {
        producer: 0,
        wholesaler: 0,
        reseller: 0,
        importer: 0,
        institutional_buyer: 0,
      };
      for (const r of roleRows) {
        rolesBreakdown[r.role] = r.count;
      }

      const geoRows = await this.dataSource.query(`
        SELECT COALESCE(ba.region, 'Addis Ababa') AS region, 
               COUNT(DISTINCT CASE WHEN b.can_buy THEN u.id END)::int AS buyers,
               COUNT(DISTINCT CASE WHEN b.can_sell THEN u.id END)::int AS sellers
        FROM users u
        LEFT JOIN businesses b ON b.owner_user_id = u.id
        LEFT JOIN business_addresses ba ON ba.business_id = b.id
        WHERE u.staff_role IS NULL
        GROUP BY COALESCE(ba.region, 'Addis Ababa')
      `).catch(() => []);

      const geoBreakdown = geoRows.map((g: any) => {
        const ratioVal = g.sellers > 0 ? (g.buyers / g.sellers).toFixed(1) : (g.buyers > 0 ? `${g.buyers}:0` : '1.0');
        const ratioStr = `${ratioVal}:1`;
        let signal: string | null = null;
        if (g.sellers === 0 && g.buyers > 0) signal = 'High Buyer Demand (No Sellers)';
        else if (g.buyers > g.sellers * 3) signal = 'High Demand Deficit';
        return {
          region: g.region,
          buyers: g.buyers,
          sellers: g.sellers,
          ratio: ratioStr,
          signal,
        };
      });

      return {
        success: true,
        data: {
          totalUsers: usersCountRes[0]?.count || 0,
          pendingVerifications: pendingCountRes[0]?.count || 0,
          activeListings: listingsCountRes[0]?.count || 0,
          pendingListings: pendingListingsRes[0]?.count || 0,
          heldEscrowETB: escrowRes[0]?.total || 0,
          openDisputes: disputesCountRes[0]?.count || 0,
          rolesBreakdown,
          geoBreakdown,
        },
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message,
      };
    }
  }

  async getUsers(subRole?: BusinessSubRole, status?: VerificationState): Promise<ApiResponse<any[]>> {
    try {
      let query = `
        SELECT 
          u.id,
          u.full_name AS "name",
          COALESCE(b.name, 'Registered Enterprise') AS "co",
          COALESCE(b.business_type_code, 'wholesaler') AS "role",
          u.phone,
          u.email,
          CASE 
            WHEN u.verification_state = 'VERIFIED' OR u.is_verified = TRUE THEN 'Verified'
            WHEN u.verification_state = 'UNDER_REVIEW' THEN 'Under review'
            WHEN u.verification_state = 'SUSPENDED' THEN 'Suspended · pending resolution'
            WHEN u.verification_state = 'BANNED' OR u.verification_state = 'REVOKED' THEN 'Revoked / Banned'
            WHEN u.verification_state = 'UNVERIFIED' THEN 'Unverified'
            WHEN u.verification_state = 'REJECTED' THEN 'Rejected'
            WHEN u.verification_state = 'MORE_INFO_NEEDED' THEN 'More info needed'
            ELSE 'Pending review'
          END AS "status",
          CASE 
            WHEN u.verification_state = 'VERIFIED' OR u.is_verified = TRUE THEN 'emerald'
            WHEN u.verification_state = 'UNDER_REVIEW' THEN 'amber'
            WHEN u.verification_state = 'SUSPENDED' THEN 'rose'
            WHEN u.verification_state = 'BANNED' OR u.verification_state = 'REVOKED' THEN 'slate'
            WHEN u.verification_state = 'UNVERIFIED' THEN 'stone'
            WHEN u.verification_state = 'REJECTED' THEN 'rose'
            ELSE 'amber'
          END AS "tone",
          u.verification_state AS "rawState",
          u.status_reason AS "statusReason",
          TO_CHAR(u.status_updated_at, 'DD Mon YYYY HH24:MI') AS "statusUpdatedAt",
          TO_CHAR(u.created_at, 'DD Mon YYYY') AS "joined",
          1 AS "docs"
        FROM users u
        LEFT JOIN businesses b ON b.owner_user_id = u.id
        WHERE u.staff_role IS NULL
      `;

      const params: any[] = [];
      if (status) {
        params.push(status);
        query += ` AND u.verification_state = $${params.length}`;
      }

      query += ` ORDER BY u.created_at DESC`;

      const users = await this.dataSource.query(query, params);
      return { success: true, data: users || [] };
    } catch (err: any) {
      return { success: false, error: err.message, data: [] };
    }
  }

  async handleUserVerification(
    targetUserId: string,
    action: 'APPROVE' | 'REJECT' | 'REQUEST_INFO',
    reason?: string,
    actorId?: string,
    actorRole?: string,
  ): Promise<ApiResponse<any>> {
    let targetState: 'VERIFIED' | 'REJECTED' | 'MORE_INFO_NEEDED' = 'VERIFIED';
    if (action === 'REJECT') targetState = 'REJECTED';
    if (action === 'REQUEST_INFO') targetState = 'MORE_INFO_NEEDED';
    return this.changeUserStatus(
      targetUserId,
      targetState as any,
      reason || `Verification action: ${action}`,
      false,
      actorId,
      actorRole,
    );
  }

  async changeUserStatus(
    targetUserId: string,
    newStatus: 'UNVERIFIED' | 'PENDING_REVIEW' | 'VERIFIED' | 'UNDER_REVIEW' | 'SUSPENDED' | 'BANNED',
    reason: string,
    isFraudRelated = false,
    actorId?: string,
    actorRole?: string,
  ): Promise<ApiResponse<any>> {
    try {
      if (actorId && actorId === targetUserId && actorRole !== StaffRole.SUPER_ADMIN) {
        throw new ForbiddenException('Security Violation: Staff cannot alter their own user account status.');
      }

      // Authorization Rule: BANNED and fraud-related SUSPENDED require Super Admin role
      if ((newStatus === 'BANNED' || (newStatus === 'SUSPENDED' && isFraudRelated)) && actorRole !== StaffRole.SUPER_ADMIN) {
        throw new ForbiddenException('Security Violation: Only Super Admin can ban accounts or execute fraud-related suspensions.');
      }

      // Fetch target user for previous status check
      const targetUser = await this.dataSource.query(
        `SELECT id, full_name, verification_state, status_updated_by_role FROM users WHERE id = $1`,
        [targetUserId],
      );
      if (!targetUser || targetUser.length === 0) {
        throw new NotFoundException('Target user not found');
      }
      const user = targetUser[0];
      const previousStatus = user.verification_state || 'PENDING_REVIEW';

      // Authorization Rule: Reinstating an Admin-suspended account requires Super Admin
      if (
        user.status_updated_by_role === StaffRole.SUPER_ADMIN &&
        previousStatus === 'SUSPENDED' &&
        newStatus === 'VERIFIED' &&
        actorRole !== StaffRole.SUPER_ADMIN
      ) {
        throw new ForbiddenException('Security Violation: Accounts suspended by Super Admin can only be reinstated by Super Admin.');
      }

      const isVerified = newStatus === 'VERIFIED';

      // Update Users table
      await this.dataSource.query(
        `UPDATE users SET 
           is_verified = $1, 
           verification_state = $2, 
           status_reason = $3, 
           status_updated_at = NOW(), 
           status_updated_by_user_id = $4, 
           status_updated_by_role = $5, 
           updated_at = NOW() 
         WHERE id = $6`,
        [isVerified, newStatus, reason, actorId || null, actorRole || 'SUPER_ADMIN', targetUserId],
      );

      // Update Businesses table
      const bizRes = await this.dataSource.query(
        `UPDATE businesses SET verification_status = $1, updated_at = NOW() WHERE owner_user_id = $2 RETURNING id`,
        [newStatus.toLowerCase(), targetUserId],
      ).catch(() => []);
      const bizId = bizRes[0]?.id || null;

      // Fetch actor name for history log
      let actorName = 'System Staff';
      if (actorId) {
        const actorRes = await this.dataSource.query(`SELECT full_name FROM users WHERE id = $1`, [actorId]);
        if (actorRes && actorRes[0]) {
          actorName = actorRes[0].full_name;
        }
      }

      // Record in user_status_history table
      await this.dataSource.query(
        `INSERT INTO user_status_history (user_id, business_id, previous_status, new_status, reason, changed_by_user_id, changed_by_name, changed_by_role)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [targetUserId, bizId, previousStatus, newStatus, reason, actorId || null, actorName, actorRole || 'SUPER_ADMIN'],
      ).catch(() => null);

      // Audit Log
      await this.logAudit(
        actorId || '',
        `STATUS_CHANGE_${newStatus}`,
        'USER',
        targetUserId,
        `Account status changed from ${previousStatus} to ${newStatus}. Reason: ${reason} (Actor: ${actorName} [${actorRole}])`,
      );

      return {
        success: true,
        message: `Account status updated to ${newStatus}`,
        data: { userId: targetUserId, previousStatus, newStatus, reason },
      };
    } catch (err: any) {
      if (err instanceof ForbiddenException || err instanceof NotFoundException) throw err;
      return { success: false, message: err.message };
    }
  }

  async getUserStatusHistory(targetUserId: string): Promise<ApiResponse<any[]>> {
    try {
      const history = await this.dataSource.query(
        `SELECT id, previous_status AS "previousStatus", new_status AS "newStatus", reason, 
                changed_by_name AS "changedByName", changed_by_role AS "changedByRole", 
                TO_CHAR(created_at, 'DD Mon YYYY HH24:MI') AS "createdAt"
         FROM user_status_history
         WHERE user_id = $1
         ORDER BY created_at DESC`,
        [targetUserId],
      ).catch(() => []);
      return { success: true, data: history };
    } catch (err: any) {
      return { success: false, error: err.message, data: [] };
    }
  }

  async getListings(status?: string): Promise<ApiResponse<any[]>> {
    try {
      let sql = `
        SELECT p.id, p.name AS "title", p.name, p.category_id AS "cat",
               c.name AS "categoryName",
               p.seller_business_id AS "sellerBusinessId",
               COALESCE(b.name, 'Verified Seller') AS "seller",
               p.price || ' ETB / ' || p.unit AS "price", 
               p.moq || ' units' AS "moq", 
               p.status,
               (b.verification_status = 'verified') AS "verifiedSeller",
               COALESCE(
                 (SELECT json_agg(pi.url) FROM product_images pi WHERE pi.product_id = p.id),
                 '[]'::json
               ) AS "images"
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        LEFT JOIN businesses b ON b.id = p.seller_business_id
        WHERE 1=1
      `;
      const params: any[] = [];
      if (status && status !== 'all') {
        params.push(status);
        sql += ` AND p.status = $${params.length}`;
      }
      sql += ` ORDER BY p.created_at DESC`;

      const listings = await this.dataSource.query(sql, params).catch(() => []);
      return { success: true, data: listings };
    } catch {
      return { success: true, data: [] };
    }
  }

  async handleListingAction(
    listingId: string,
    action: 'APPROVE' | 'REJECT' | 'FLAG' | 'REQUEST_FIX' | 'BULK_REMOVE_SELLER',
    notes?: string,
    actorId?: string,
    actorRole?: string,
  ): Promise<ApiResponse<any>> {
    if (action === 'BULK_REMOVE_SELLER') {
      // listingId is treated as sellerBusinessId for bulk action
      await this.dataSource.query(
        `UPDATE products SET status = 'REMOVED', updated_at = NOW() WHERE seller_business_id = $1`,
        [listingId],
      );
      await this.logAudit(
        actorId || '',
        'BULK_REMOVE_SELLER_LISTINGS',
        'SELLER',
        listingId,
        `Bulk-removed all active product listings for seller business ${listingId} due to account policy action.`,
      );
      return { success: true, message: `All listings for seller business removed.` };
    }

    const statusMap: Record<string, string> = {
      APPROVE: 'PUBLISHED',
      REJECT: 'REJECTED',
      FLAG: 'FLAGGED',
      REQUEST_FIX: 'FIX_REQUESTED',
    };
    const status = statusMap[action] || 'PENDING_APPROVAL';
    const rejectionReason = (action === 'REJECT' || action === 'REQUEST_FIX') ? (notes || 'Listing did not pass moderation review.') : null;

    await this.dataSource.query(
      `UPDATE products SET status = $1, rejection_reason = $2, updated_at = NOW() WHERE id = $3`,
      [status, rejectionReason, listingId],
    );
    await this.logAudit(
      actorId || '',
      `LISTING_${action}`,
      'LISTING',
      listingId,
      `Listing moderation action ${action} executed.${notes ? ` Note: ${notes}` : ''} Status set to ${status}.`,
    );

    return { success: true, message: `Listing status updated to ${status}` };
  }

  // --- Category Management & Approval System ---

  async submitCategoryRequest(name: string, reason: string, icon?: string, actorId?: string): Promise<ApiResponse<any>> {
    try {
      let actorName = 'Listings Moderator';
      if (actorId) {
        const uRes = await this.dataSource.query(`SELECT full_name FROM users WHERE id = $1`, [actorId]);
        if (uRes && uRes[0]) actorName = uRes[0].full_name;
      }

      await this.dataSource.query(`
        CREATE TABLE IF NOT EXISTS category_requests (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(150) NOT NULL,
          parent_id VARCHAR(100),
          requested_by_user_id UUID,
          requested_by_user_name VARCHAR(150) NOT NULL,
          reason TEXT NOT NULL,
          icon VARCHAR(100) DEFAULT 'Package',
          status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
          reviewed_by_user_id UUID,
          reviewed_by_user_name VARCHAR(150),
          rejection_reason TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        ALTER TABLE category_requests ADD COLUMN IF NOT EXISTS icon VARCHAR(100) DEFAULT 'Package';
      `).catch(() => null);

      const res = await this.dataSource.query(
        `INSERT INTO category_requests (name, requested_by_user_id, requested_by_user_name, reason, icon, status)
         VALUES ($1, $2, $3, $4, $5, 'PENDING')
         RETURNING id, name, icon, status, created_at`,
        [name, actorId || null, actorName, reason, icon || 'Package'],
      );

      await this.logAudit(
        actorId || '',
        'SUBMIT_CATEGORY_REQUEST',
        'CATEGORY_REQUEST',
        res[0].id,
        `Submitted request for new top-level category "${name}". Icon: ${icon || 'Package'}, Reason: ${reason}`,
      );

      return {
        success: true,
        message: `Top-level category request for "${name}" submitted successfully. Pending Super Admin approval.`,
        data: res[0],
      };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  }

  async getCategoryRequests(): Promise<ApiResponse<any[]>> {
    try {
      await this.dataSource.query(`
        CREATE TABLE IF NOT EXISTS category_requests (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(150) NOT NULL,
          parent_id VARCHAR(100),
          requested_by_user_id UUID,
          requested_by_user_name VARCHAR(150) NOT NULL,
          reason TEXT NOT NULL,
          icon VARCHAR(100) DEFAULT 'Package',
          status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
          reviewed_by_user_id UUID,
          reviewed_by_user_name VARCHAR(150),
          rejection_reason TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        ALTER TABLE category_requests ADD COLUMN IF NOT EXISTS icon VARCHAR(100) DEFAULT 'Package';
      `).catch(() => null);

      const requests = await this.dataSource.query(`
        SELECT id, name, requested_by_user_name AS "requestedByName", reason, icon, status,
               reviewed_by_user_name AS "reviewedByName", rejection_reason AS "rejectionReason",
               TO_CHAR(created_at, 'DD Mon YYYY HH24:MI') AS "createdAt"
        FROM category_requests
        ORDER BY created_at DESC
      `);

      return { success: true, data: requests };
    } catch {
      return { success: true, data: [] };
    }
  }

  async handleCategoryRequestAction(
    requestId: string,
    action: 'APPROVE' | 'REJECT',
    rejectionReason?: string,
    actorId?: string,
    actorRole?: string,
  ): Promise<ApiResponse<any>> {
    try {
      if (actorRole && actorRole !== StaffRole.SUPER_ADMIN) {
        throw new ForbiddenException('Authority Exceeded: Only Super Admin has authorization to approve or reject top-level category requests.');
      }

      const reqs = await this.dataSource.query(`SELECT * FROM category_requests WHERE id = $1`, [requestId]);
      if (!reqs || reqs.length === 0) {
        throw new NotFoundException(`Category request ${requestId} not found.`);
      }

      const req = reqs[0];
      let actorName = 'Super Admin';
      if (actorId) {
        const uRes = await this.dataSource.query(`SELECT full_name FROM users WHERE id = $1`, [actorId]);
        if (uRes && uRes[0]) actorName = uRes[0].full_name;
      }

      if (action === 'APPROVE') {
        const slug = req.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        // Add to live category tree with icon
        await this.dataSource.query(`ALTER TABLE categories ADD COLUMN IF NOT EXISTS icon VARCHAR(100) DEFAULT 'Package';`).catch(() => null);
        const catInsert = await this.dataSource.query(
          `INSERT INTO categories (name, slug, parent_id, icon, is_active)
           VALUES ($1, $2, NULL, $3, TRUE)
           ON CONFLICT (slug) DO UPDATE SET icon = EXCLUDED.icon, is_active = TRUE
           RETURNING id`,
          [req.name, slug, req.icon || 'Package'],
        );
        const categoryId = catInsert[0]?.id || `cat-${Date.now()}`;

        await this.dataSource.query(
          `UPDATE category_requests 
           SET status = 'APPROVED', reviewed_by_user_id = $1, reviewed_by_user_name = $2, updated_at = NOW() 
           WHERE id = $3`,
          [actorId || null, actorName, requestId],
        );

        await this.logAudit(
          actorId || '',
          'APPROVE_CATEGORY_REQUEST',
          'CATEGORY',
          categoryId,
          `Super Admin ${actorName} approved top-level category "${req.name}". Live category ID: ${categoryId}`,
        );

        return {
          success: true,
          message: `Top-level category "${req.name}" approved and published to live category tree.`,
        };
      } else {
        await this.dataSource.query(
          `UPDATE category_requests 
           SET status = 'REJECTED', rejection_reason = $1, reviewed_by_user_id = $2, reviewed_by_user_name = $3, updated_at = NOW() 
           WHERE id = $4`,
          [rejectionReason || 'Does not meet top-level vertical criteria', actorId || null, actorName, requestId],
        );

        await this.logAudit(
          actorId || '',
          'REJECT_CATEGORY_REQUEST',
          'CATEGORY_REQUEST',
          requestId,
          `Super Admin ${actorName} rejected category request "${req.name}". Reason: ${rejectionReason}`,
        );

        return {
          success: true,
          message: `Category request for "${req.name}" rejected.`,
        };
      }
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  }

  async getEscrowTransactions(): Promise<ApiResponse<any[]>> {
    try {
      const orders = await this.dataSource.query(`
        SELECT o.id, COALESCE(p.name, 'Bulk Wholesale Order') AS "item",
               COALESCE(bb.name, 'Buyer Enterprise') AS "buyer",
               COALESCE(sb.name, 'Seller Enterprise') AS "seller",
               o.total_price AS "amountValue",
               o.total_price || ' ETB' AS "amount",
               o.escrow_status AS "status"
        FROM orders o
        LEFT JOIN products p ON p.id = o.product_id
        LEFT JOIN businesses bb ON bb.id = o.buyer_business_id
        LEFT JOIN businesses sb ON sb.id = o.seller_business_id
        ORDER BY o.created_at DESC
      `).catch(() => []);
      return { success: true, data: orders };
    } catch {
      return { success: true, data: [] };
    }
  }

  async handleEscrowOverride(
    orderId: string,
    action: 'RELEASE' | 'REFUND',
    actorId?: string,
    actorRole?: string,
  ): Promise<ApiResponse<any>> {
    // 1. Fetch Order Amount
    const orders = await this.dataSource.query(`SELECT id, total_price FROM orders WHERE id = $1`, [orderId]);
    if (!orders || orders.length === 0) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    const orderAmount = parseFloat(orders[0].total_price || 0);

    // 2. Enforce Escrow Threshold Rule
    if (orderAmount > ESCROW_RELEASE_THRESHOLD_ETB && actorRole !== StaffRole.SUPER_ADMIN) {
      throw new ForbiddenException(
        `Authority Exceeded: Escrow release/refund for amount ${orderAmount.toLocaleString()} ETB exceeds officer threshold (${ESCROW_RELEASE_THRESHOLD_ETB.toLocaleString()} ETB). Super Admin authorization required.`,
      );
    }

    const status = action === 'RELEASE' ? 'FUNDS_RELEASED' : 'REFUNDED';
    await this.dataSource.query(`UPDATE orders SET escrow_status = $1, updated_at = NOW() WHERE id = $2`, [status, orderId]);

    await this.logAudit(
      actorId || '',
      `ESCROW_OVERRIDE_${action}`,
      'ESCROW',
      orderId,
      `Escrow funds ${action} executed for Order ${orderId} (Amount: ${orderAmount} ETB). Status set to ${status}.`,
    );

    return { success: true, message: `Escrow set to ${status}` };
  }

  async getDisputes(): Promise<ApiResponse<any[]>> {
    try {
      const disputes = await this.dataSource.query(`
        SELECT id, ticket_number AS "ticketNumber", order_id AS "orderId", order_number AS "orderNumber",
               buyer_name AS "buyerName", seller_name AS "sellerName", amount, currency,
               status, reason, description, recommendation, recommendation_note AS "recommendationNote",
               TO_CHAR(created_at, 'DD Mon YYYY') AS "createdAt"
        FROM dispute_cases ORDER BY created_at DESC
      `).catch(() => []);
      return { success: true, data: disputes };
    } catch {
      return { success: true, data: [] };
    }
  }

  // Maker: Dispute Mediator submits recommendation only
  async recommendDisputeResolution(
    disputeId: string,
    recommendation: 'REFUND' | 'RELEASE' | 'SPLIT',
    note: string,
    actorId?: string,
    actorRole?: string,
  ): Promise<ApiResponse<any>> {
    const status = recommendation === 'REFUND' ? 'RECOMMENDED_REFUND' : 'RECOMMENDED_RELEASE';

    let actorName = 'Dispute Mediator';
    if (actorId) {
      const uRes = await this.dataSource.query(`SELECT full_name FROM users WHERE id = $1`, [actorId]);
      if (uRes && uRes[0]) actorName = uRes[0].full_name;
    }

    await this.dataSource.query(
      `UPDATE dispute_cases 
       SET status = $1, recommendation = $2, recommended_by_user_id = $3, 
           recommended_by_user_name = $4, recommendation_note = $5, updated_at = NOW() 
       WHERE id = $6`,
      [status, recommendation, actorId || null, actorName, note, disputeId],
    );

    await this.logAudit(
      actorId || '',
      'DISPUTE_RECOMMENDATION_SUBMITTED',
      'DISPUTE',
      disputeId,
      `Mediator ${actorName} submitted recommendation: ${recommendation}. Note: ${note}`,
    );

    return {
      success: true,
      message: `Dispute recommendation submitted successfully as ${status}. Pending execution by Escrow Officer or Super Admin.`,
    };
  }

  // Checker: Escrow Officer or Super Admin executes payout
  async executeDisputePayout(
    disputeId: string,
    action: 'RESOLVED_REFUND' | 'RESOLVED_RELEASE',
    note: string,
    actorId?: string,
    actorRole?: string,
  ): Promise<ApiResponse<any>> {
    const disputes = await this.dataSource.query(`SELECT id, order_id, amount FROM dispute_cases WHERE id = $1`, [disputeId]);
    if (!disputes || disputes.length === 0) {
      throw new NotFoundException(`Dispute case ${disputeId} not found`);
    }

    const dispute = disputes[0];
    const amount = parseFloat(dispute.amount || 0);

    // Enforce 50,000 ETB threshold
    if (amount > ESCROW_RELEASE_THRESHOLD_ETB && actorRole !== StaffRole.SUPER_ADMIN) {
      throw new ForbiddenException(
        `Authority Exceeded: Dispute payout of ${amount.toLocaleString()} ETB exceeds Escrow Officer threshold (${ESCROW_RELEASE_THRESHOLD_ETB.toLocaleString()} ETB). Super Admin sign-off required.`,
      );
    }

    let actorName = 'Escrow Officer';
    if (actorId) {
      const uRes = await this.dataSource.query(`SELECT full_name FROM users WHERE id = $1`, [actorId]);
      if (uRes && uRes[0]) actorName = uRes[0].full_name;
    }

    await this.dataSource.query(
      `UPDATE dispute_cases 
       SET status = $1, executed_by_user_id = $2, executed_by_user_name = $3, execution_note = $4, updated_at = NOW() 
       WHERE id = $5`,
      [action, actorId || null, actorName, note, disputeId],
    );

    if (dispute.order_id) {
      const escrowStatus = action === 'RESOLVED_REFUND' ? 'REFUNDED' : 'FUNDS_RELEASED';
      await this.dataSource.query(`UPDATE orders SET escrow_status = $1, updated_at = NOW() WHERE id = $2`, [escrowStatus, dispute.order_id]).catch(() => null);
    }

    await this.logAudit(
      actorId || '',
      `DISPUTE_EXECUTION_${action}`,
      'DISPUTE',
      disputeId,
      `Escrow Officer / Admin ${actorName} executed dispute payout: ${action}. Note: ${note}`,
    );

    return {
      success: true,
      message: `Dispute payout executed successfully. Final status set to ${action}.`,
    };
  }

  // Super Admin: List all staff accounts
  async getStaffList(): Promise<ApiResponse<any[]>> {
    try {
      const staff = await this.dataSource.query(`
        SELECT id, full_name AS "fullName", email, phone, staff_role AS "staffRole", 
               is_active AS "isActive", TO_CHAR(created_at, 'DD Mon YYYY') AS "createdAt"
        FROM users 
        WHERE staff_role IS NOT NULL
        ORDER BY created_at ASC
      `);
      return { success: true, data: staff };
    } catch (err: any) {
      return { success: false, error: err.message, data: [] };
    }
  }

  // Super Admin: Create or update staff account
  async createOrAssignStaff(
    body: { fullName: string; phone: string; email: string; password?: string; staffRole: StaffRole },
    actorId?: string,
  ): Promise<ApiResponse<any>> {
    try {
      const existing = await this.dataSource.query(`SELECT id FROM users WHERE phone = $1 OR email = $2`, [body.phone, body.email]);

      let passwordHash: string | null = null;
      if (body.password) {
        const bcrypt = await import('bcrypt');
        passwordHash = await bcrypt.hash(body.password, 10);
      }

      if (existing && existing.length > 0) {
        const userId = existing[0].id;
        if (passwordHash) {
          await this.dataSource.query(`UPDATE users SET staff_role = $1, password_hash = $2, updated_at = NOW() WHERE id = $3`, [body.staffRole, passwordHash, userId]);
        } else {
          await this.dataSource.query(`UPDATE users SET staff_role = $1, updated_at = NOW() WHERE id = $2`, [body.staffRole, userId]);
        }
        await this.logAudit(actorId || '', 'ASSIGN_STAFF_ROLE', 'USER', userId, `Assigned role ${body.staffRole} to existing user ${body.email}`);
        return { success: true, message: `Updated user ${body.email} role to ${body.staffRole}` };
      }

      const res = await this.dataSource.query(
        `INSERT INTO users (full_name, phone, email, password_hash, is_active, is_verified, verification_state, staff_role, phone_verified_at)
         VALUES ($1, $2, $3, $4, TRUE, TRUE, 'VERIFIED', $5, NOW()) RETURNING id`,
        [body.fullName, body.phone, body.email, passwordHash, body.staffRole],
      );

      const userId = res[0].id;
      await this.logAudit(actorId || '', 'CREATE_STAFF_ACCOUNT', 'USER', userId, `Created staff account ${body.email} with role ${body.staffRole}`);

      return { success: true, message: `Created staff account ${body.email} with role ${body.staffRole}` };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // Super Admin: Revoke staff access
  async revokeStaff(staffUserId: string, actorId?: string): Promise<ApiResponse<any>> {
    await this.dataSource.query(`UPDATE users SET staff_role = NULL, updated_at = NOW() WHERE id = $1`, [staffUserId]);
    await this.logAudit(actorId || '', 'REVOKE_STAFF_ROLE', 'USER', staffUserId, `Revoked staff access for user ID ${staffUserId}`);
    return { success: true, message: `Revoked staff access for user ID ${staffUserId}` };
  }

  async getAuditLogs(): Promise<ApiResponse<any[]>> {
    try {
      const logs = await this.dataSource.query(`
        SELECT id, COALESCE(actor_name, 'System') AS "adminName", action, 
               target_type AS "targetType", target_id AS "targetId", details, 
               TO_CHAR(created_at, 'DD Mon YYYY HH24:MI:SS') AS "timestamp"
        FROM admin_audit_logs 
        ORDER BY created_at DESC 
        LIMIT 100
      `).catch(() => []);
      return { success: true, data: logs };
    } catch {
      return { success: true, data: [] };
    }
  }
}
