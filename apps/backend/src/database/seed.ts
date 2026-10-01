import { DataSource } from "typeorm";
import * as bcrypt from "bcrypt";
export enum StaffRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  VERIFICATION_OFFICER = "VERIFICATION_OFFICER",
  LISTINGS_MODERATOR = "LISTINGS_MODERATOR",
  ESCROW_OFFICER = "ESCROW_OFFICER",
  DISPUTE_MEDIATOR = "DISPUTE_MEDIATOR",
  ANALYST = "ANALYST",
}

export interface SeedOptions {
  testOtp?: string;
}

export async function runDatabaseSeed(
  dataSource: DataSource,
  options: SeedOptions = {},
) {
  const testOtp = options.testOtp || "123456";
  const defaultPassword = "Staff123!";
  const superAdminPassword = "Admin123!";
  const businessOwner = "+251915282542";
  const businessOwner_pass = "123123123All";
  console.log("=======================================================");
  console.log("🌱 Starting Bits B2B Admin & Staff Database Seeding...");
  console.log("=======================================================");

  try {
    // 0. Migration check: Ensure columns & tables exist on DB
    await dataSource
      .query(
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS staff_role VARCHAR(50)`,
      )
      .catch(() => null);
    await dataSource
      .query(
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE`,
      )
      .catch(() => null);
    await dataSource
      .query(
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_state VARCHAR(50) DEFAULT 'PENDING_REVIEW'`,
      )
      .catch(() => null);
    await dataSource
      .query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS status_reason TEXT`)
      .catch(() => null);
    await dataSource
      .query(
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMPTZ`,
      )
      .catch(() => null);
    await dataSource
      .query(
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS status_updated_by_user_id UUID`,
      )
      .catch(() => null);
    await dataSource
      .query(
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS status_updated_by_role VARCHAR(50)`,
      )
      .catch(() => null);

    await dataSource
      .query(
        `
      CREATE TABLE IF NOT EXISTS user_status_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        business_id UUID,
        previous_status VARCHAR(50),
        new_status VARCHAR(50) NOT NULL,
        reason TEXT,
        changed_by_user_id UUID,
        changed_by_name VARCHAR(150),
        changed_by_role VARCHAR(50) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS dispute_cases (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ticket_number VARCHAR(50) NOT NULL UNIQUE,
        order_id UUID,
        order_number VARCHAR(50) NOT NULL,
        buyer_id UUID,
        buyer_name VARCHAR(150) NOT NULL,
        seller_id UUID,
        seller_name VARCHAR(150) NOT NULL,
        amount NUMERIC(14,2) NOT NULL CHECK (amount >= 0),
        currency CHAR(3) NOT NULL DEFAULT 'ETB',
        status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
        reason VARCHAR(50) NOT NULL,
        description TEXT NOT NULL,
        recommendation VARCHAR(50),
        recommended_by_user_id UUID,
        recommended_by_user_name VARCHAR(150),
        recommendation_note TEXT,
        executed_by_user_id UUID,
        executed_by_user_name VARCHAR(150),
        execution_note TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS admin_audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        actor_user_id UUID,
        actor_name VARCHAR(150),
        action VARCHAR(100) NOT NULL,
        target_type VARCHAR(50) NOT NULL,
        target_id VARCHAR(100) NOT NULL,
        details TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE categories ADD COLUMN IF NOT EXISTS parent_id VARCHAR(100);
      ALTER TABLE categories ADD COLUMN IF NOT EXISTS icon VARCHAR(100) DEFAULT 'Package';
      ALTER TABLE categories ADD COLUMN IF NOT EXISTS cover_image TEXT;
      ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

      CREATE TABLE IF NOT EXISTS category_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(150) NOT NULL,
        parent_id VARCHAR(100),
        requested_by_user_id UUID,
        requested_by_user_name VARCHAR(150) NOT NULL,
        reason TEXT NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
        reviewed_by_user_id UUID,
        reviewed_by_user_name VARCHAR(150),
        rejection_reason TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `,
      )
      .catch(() => null);

    // Helper function to derive staff password: First 2 letters (First Cap), Father 2 letters (lower), + "123,"
    const getStaffPassword = (fullName: string): string => {
      const parts = fullName.trim().split(/\s+/);
      const first = parts[0] || "";
      const father = parts[1] || "";
      const f2 = first.slice(0, 2);
      const f2Cap = f2.charAt(0).toUpperCase() + f2.slice(1).toLowerCase();
      const l2 = father.slice(0, 2).toLowerCase();
      return `${f2Cap}${l2}123,`;
    };

    const adminHash = await bcrypt.hash(superAdminPassword, 10);

    // 1. Defined Staff & Admin Accounts
    const staffDefinitions = [
      {
        fullName: "Selamawit Berhanu",
        phone: "+251911000000",
        email: "admin@bitsb2b.et",
        role: StaffRole.SUPER_ADMIN,
        plainPassword: superAdminPassword,
        passHash: adminHash,
      },
      {
        fullName: "Yonas Tadesse",
        phone: "+251911000001",
        email: "yonas@bitsb2b.et",
        role: StaffRole.VERIFICATION_OFFICER,
        plainPassword: getStaffPassword("Yonas Tadesse"), // Yota123,
      },
      {
        fullName: "Meron Assefa",
        phone: "+251911000002",
        email: "meron@bitsb2b.et",
        role: StaffRole.LISTINGS_MODERATOR,
        plainPassword: getStaffPassword("Meron Assefa"), // Meas123,
      },
      {
        fullName: "Robel Kebede",
        phone: "+251911000003",
        email: "robel@bitsb2b.et",
        role: StaffRole.ESCROW_OFFICER,
        plainPassword: getStaffPassword("Robel Kebede"), // Roke123,
      },
      {
        fullName: "Hana Gebre",
        phone: "+251911000004",
        email: "hana@bitsb2b.et",
        role: StaffRole.DISPUTE_MEDIATOR,
        plainPassword: getStaffPassword("Hana Gebre"), // Hage123,
      },
      {
        fullName: "Tewodros Alemu",
        phone: "+251911000005",
        email: "analyst@bitsb2b.et",
        role: StaffRole.ANALYST,
        plainPassword: getStaffPassword("Tewodros Alemu"), // Teal123,
      },
    ];

    const staffAccounts = await Promise.all(
      staffDefinitions.map(async (s) => ({
        ...s,
        passHash: s.passHash || (await bcrypt.hash(s.plainPassword, 10)),
      })),
    );

    for (const s of staffAccounts) {
      const existing = await dataSource.query(
        `SELECT id FROM users WHERE phone = $1 OR email = $2`,
        [s.phone, s.email],
      );
      let userId: string;

      if (!existing || existing.length === 0) {
        const res = await dataSource.query(
          `INSERT INTO users (full_name, phone, email, is_active, is_verified, verification_state, staff_role, phone_verified_at)
           VALUES ($1, $2, $3, TRUE, TRUE, 'VERIFIED', $4, NOW()) RETURNING id`,
          [s.fullName, s.phone, s.email, s.role],
        );
        userId = res[0].id;

        await dataSource.query(
          `INSERT INTO user_credentials (user_id, password_hash)
           VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET password_hash = $2`,
          [userId, s.passHash],
        );
        console.log(
          `✅ Seeded Staff Account: ${s.role} | Email: ${s.email} | Phone: ${s.phone}`,
        );
      } else {
        userId = existing[0].id;
        await dataSource.query(
          `UPDATE users SET full_name = $1, phone = $2, email = $3, staff_role = $4, is_active = TRUE, is_verified = TRUE, verification_state = 'VERIFIED' WHERE id = $5`,
          [s.fullName, s.phone, s.email, s.role, userId],
        );
        await dataSource.query(
          `INSERT INTO user_credentials (user_id, password_hash)
           VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET password_hash = $2, failed_login_attempts = 0, locked_until = NULL`,
          [userId, s.passHash],
        );
        console.log(
          `✅ Updated Staff Account Credentials: ${s.role} | Email: ${s.email} | Phone: ${s.phone}`,
        );
      }
    }

    // 2. Seed Single Primary Business Account (Producer)
    const businessOwner = "+251915282542";
    const businessOwner_pass = "123123123All";

    // Remove legacy sample non-staff businesses other than the primary business owner
    await dataSource
      .query(
        `DELETE FROM business_addresses WHERE business_id IN (
         SELECT b.id FROM businesses b
         JOIN users u ON u.id = b.owner_user_id
         WHERE (u.staff_role IS NULL OR u.staff_role = '') AND u.phone != $1
       )`,
        [businessOwner],
      )
      .catch(() => null);

    await dataSource
      .query(
        `DELETE FROM businesses WHERE owner_user_id IN (
         SELECT id FROM users WHERE (staff_role IS NULL OR staff_role = '') AND phone != $1
       )`,
        [businessOwner],
      )
      .catch(() => null);

    await dataSource
      .query(
        `DELETE FROM user_credentials WHERE user_id IN (
         SELECT id FROM users WHERE (staff_role IS NULL OR staff_role = '') AND phone != $1
       )`,
        [businessOwner],
      )
      .catch(() => null);

    await dataSource
      .query(
        `DELETE FROM users WHERE (staff_role IS NULL OR staff_role = '') AND phone != $1`,
        [businessOwner],
      )
      .catch(() => null);

    const sampleBusinesses = [
      {
        fullName: "Primary Business Owner",
        phone: businessOwner,
        email: "owner@bitsb2b.et",
        co: "Prime B2B Producer PLC",
        type: "producer",
        tinNumber: "1098765432",
        tradeLicenseNumber: "TL-ET-2026-9988",
        region: "Addis Ababa",
        city: "Addis Ababa",
        subcity: "Kirkos",
        kebele: "02",
        landmark: "Near Stadium",
        verified: false,
        state: "PENDING_REVIEW",
        customPassword: businessOwner_pass,
      },
    ];

    for (const b of sampleBusinesses) {
      const passToUse = b.customPassword || "Staff123!";
      const passHash = await bcrypt.hash(passToUse, 10);
      const existing = await dataSource.query(
        `SELECT id FROM users WHERE phone = $1`,
        [b.phone],
      );
      let uId: string;

      if (!existing || existing.length === 0) {
        const uRes = await dataSource.query(
          `INSERT INTO users (full_name, phone, email, is_active, is_verified, verification_state, phone_verified_at)
           VALUES ($1, $2, $3, TRUE, $4, $5, NOW()) RETURNING id`,
          [b.fullName, b.phone, b.email, b.verified, b.state],
        );
        uId = uRes[0].id;
      } else {
        uId = existing[0].id;
        await dataSource.query(
          `UPDATE users SET full_name = $1, email = $2, is_active = TRUE, is_verified = $3, verification_state = $4 WHERE id = $5`,
          [b.fullName, b.email, b.verified, b.state, uId],
        );
      }

      await dataSource.query(
        `INSERT INTO user_credentials (user_id, password_hash)
         VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET password_hash = $2, failed_login_attempts = 0, locked_until = NULL`,
        [uId, passHash],
      );

      const canSell = b.verified;
      const bRes = await dataSource.query(
        `INSERT INTO businesses (owner_user_id, name, business_type_code, can_buy, can_sell, phone, tin_number, trade_license_number, verification_status, description)
         VALUES ($1, $2, $3, TRUE, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (owner_user_id) DO UPDATE SET
           name = $2,
           business_type_code = $3,
           can_buy = TRUE,
           can_sell = $4,
           phone = $5,
           tin_number = $6,
           trade_license_number = $7,
           verification_status = $8,
           description = $9
         RETURNING id`,
        [
          uId,
          b.co,
          b.type,
          canSell,
          b.phone,
          b.tinNumber,
          b.tradeLicenseNumber,
          b.state.toLowerCase(),
          "Primary B2B Producer profile submitted for Verification Officer review.",
        ],
      );

      const bId =
        bRes[0]?.id ||
        (
          await dataSource.query(
            `SELECT id FROM businesses WHERE owner_user_id = $1`,
            [uId],
          )
        )[0]?.id;

      if (bId) {
        await dataSource.query(
          `INSERT INTO business_addresses (business_id, label, region, city, subcity, kebele, landmark, is_default_billing, is_default_shipping)
           VALUES ($1, 'headquarters', $2, $3, $4, $5, $6, TRUE, TRUE)
           ON CONFLICT DO NOTHING`,
          [bId, b.region, b.city, b.subcity, b.kebele, b.landmark],
        );
      }

      console.log(
        `✅ Seeded Business Account: ${b.co} (${b.type}) | Phone: ${b.phone}`,
      );
    }

    // 3. Category Seeding Disabled - Categories are created 100% dynamically by Admin & Staff

    // Product Seeding Disabled - Database products table starts empty for real seller listings

    // 4. Seed Dispute Cases for Testing Maker-Checker Workflow
    const disputesCountRes = await dataSource
      .query(`SELECT COUNT(*)::int AS count FROM dispute_cases`)
      .catch(() => [{ count: 0 }]);
    if (disputesCountRes[0]?.count === 0) {
      await dataSource.query(`
        INSERT INTO dispute_cases (
          ticket_number, order_number, buyer_name, seller_name, amount, currency, status, reason, description
        ) VALUES 
        (
          'DISP-2026-001', 'ORD-2026-881', 'Solomon General Contractors', 'Nile Garment & Textile Mill',
          98000.00, 'ETB', 'OPEN', 'DEFECTIVE_GOODS',
          'Delivered coffee beans batch showed moisture levels exceeding 15% specs. Buyer requesting full refund.'
        ),
        (
          'DISP-2026-002', 'ORD-2026-770', 'Ethio Import & Trading PLC', 'Nile Garment Mill',
          42000.00, 'ETB', 'RECOMMENDED_REFUND', 'QUANTITY_MISMATCH',
          'Quantity delivered was 80 quintals instead of 100 quintals. Mediator recommended partial refund of 29,000 ETB.'
        )
      `);
      console.log(
        `✅ Sample Dispute Cases Seeded for Dispute Mediator testing`,
      );
    }

    console.log("=======================================================");
    console.log("🎉 Seeding Complete! Credentials Ready:");
    console.log("🏢 Business Owner: +251915282542 / 123123123All");
    console.log("👑 Super Admin: admin@bitsb2b.et / Admin123!");
    console.log("🛡️ Verification Officer: yonas@bitsb2b.et / Yota123!");
    console.log("📦 Listings Moderator: meron@bitsb2b.et / Meas123!");
    console.log("💰 Escrow Officer: robel@bitsb2b.et / Roke123!");
    console.log("⚖️ Dispute Mediator: hana@bitsb2b.et / Hage123!");
    console.log("📊 Analyst: analyst@bitsb2b.et / Teal123!");
    console.log("=======================================================");
  } catch (err: any) {
    console.error("❌ Seeding Error:", err.message);
  }
}

if (require.main === module) {
  const host = process.env.DB_HOST || "localhost";
  const port = parseInt(process.env.DB_PORT || "5432", 10);
  const username = process.env.DB_USERNAME || "postgres";
  const password = process.env.DB_PASSWORD || "postgres";
  const database = process.env.DB_NAME || "bmb2b";

  const ds = new DataSource({
    type: "postgres",
    host,
    port,
    username,
    password,
    database,
    synchronize: false,
  });

  ds.initialize()
    .then(async () => {
      await runDatabaseSeed(ds);
      await ds.destroy();
      process.exit(0);
    })
    .catch((err) => {
      console.log(`⚠️ Database offline or uninitialized: ${err.message}`);
      console.log(
        `ℹ️ Seed will automatically run on NestJS app startup when database connects.`,
      );
      process.exit(0);
    });
}
