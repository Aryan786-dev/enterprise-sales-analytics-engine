# Enterprise Territory & Sales Analytics Engine

A full-stack analytics engine with a 3NF normalized PostgreSQL schema, real-time quota tracking using SQL window functions, and an interactive React dashboard.

## Tech Stack
- **Database:** PostgreSQL (3NF Schema, Foreign Key B-Tree Indexing)
- **Backend:** Node.js, Express.js, `pg` Pool
- **Frontend:** React, Vite, Chart.js, React-Chartjs-2, Axios
- **Core Logic:** SQL Window Functions (`DENSE_RANK`, `PARTITION BY`)

## Key Highlights
- **Normalized Schema (3NF):** Designed across 4 entities (`territories`, `sales_reps`, `products`, `orders`) with indexed relational foreign keys.
- **Advanced SQL Analytics:** In-database evaluation of rep revenue ranks across national and territory partitions alongside monthly quota attainment percentages.
- **Dynamic Dashboard:** Real-time KPI summary metrics, Chart.js revenue vs. quota visualization, multi-dimensional territory filtering, and instant client-side CSV export.

## Local Setup

### 1. Database
Create a database named `sales_engine` in PostgreSQL and run the table creation and seed scripts in `backend/server.js`.

### 2. Backend
```bash
cd backend
npm install
node server.js