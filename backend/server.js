const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// 1. Quota Tracking & Rep Ranking using Window Functions (DENSE_RANK, PARTITION BY)
app.get('/api/analytics/rep-rankings', async (req, res) => {
  try {
    const query = `
      WITH RepSales AS (
        SELECT 
          r.id,
          r.name AS rep_name,
          t.name AS territory_name,
          r.monthly_quota,
          COALESCE(SUM(o.total_amount), 0) AS total_revenue
        FROM sales_reps r
        JOIN territories t ON r.territory_id = t.id
        LEFT JOIN orders o ON r.id = o.rep_id
        GROUP BY r.id, r.name, t.name, r.monthly_quota
      )
      SELECT 
        rep_name,
        territory_name,
        monthly_quota,
        total_revenue,
        ROUND((total_revenue / monthly_quota) * 100, 2) AS quota_attainment_pct,
        DENSE_RANK() OVER (ORDER BY total_revenue DESC) AS overall_rank,
        DENSE_RANK() OVER (PARTITION BY territory_name ORDER BY total_revenue DESC) AS territory_rank
      FROM RepSales;
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Orders List with Territory Filtering
app.get('/api/orders', async (req, res) => {
  const { territory } = req.query;
  let query = `
    SELECT 
      o.id,
      r.name AS rep_name,
      t.name AS territory_name,
      p.name AS product_name,
      o.quantity,
      o.total_amount,
      o.order_date
    FROM orders o
    JOIN sales_reps r ON o.rep_id = r.id
    JOIN territories t ON o.territory_id = t.id
    JOIN products p ON o.product_id = p.id
  `;
  const values = [];

  if (territory) {
    values.push(territory);
    query += ` WHERE t.name = $1`;
  }

  query += ` ORDER BY o.order_date DESC;`;

  try {
    const { rows } = await pool.query(query, values);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});