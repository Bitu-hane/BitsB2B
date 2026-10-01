const { Client } = require('/Users/imranseid/Downloads/bmb2b1/node_modules/pg');

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'bmb2b',
});

async function check() {
  await client.connect();
  const res = await client.query(`
    SELECT u.id, u.full_name, u.phone, u.email, u.is_verified, u.verification_state, u.staff_role, u.created_at, b.name as business_name, b.business_type_code
    FROM users u
    LEFT JOIN businesses b ON b.owner_user_id = u.id
    ORDER BY u.created_at DESC
  `);
  console.log('=== DATABASE USERS TABLE CONTENT ===');
  console.table(res.rows);
  await client.end();
}

check().catch(console.error);
