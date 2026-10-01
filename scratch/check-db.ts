import { DataSource } from 'typeorm';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'bmb2b',
});

async function run() {
  await dataSource.initialize();
  console.log('--- PostgreSQL Business Users Inspection ---');
  const users = await dataSource.query(`
    SELECT u.id, u.full_name, u.phone, u.email, u.is_verified, u.verification_state, u.staff_role, u.created_at, b.name as business_name, b.business_type_code
    FROM users u
    LEFT JOIN businesses b ON b.owner_user_id = u.id
    ORDER BY u.created_at DESC
  `);
  console.log(JSON.stringify(users, null, 2));
  await dataSource.destroy();
}

run().catch((err) => {
  console.error('DB Error:', err);
  process.exit(1);
});
