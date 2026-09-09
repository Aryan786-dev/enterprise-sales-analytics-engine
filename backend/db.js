const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'sales_engine',
  password: '@Lucy001',
  port: 5432,
});

module.exports = pool;