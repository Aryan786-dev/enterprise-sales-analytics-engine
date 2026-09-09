import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function App() {
  const [repRankings, setRepRankings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [filterTerritory, setFilterTerritory] = useState('');

  useEffect(() => {
    fetchAnalytics();
    fetchOrders();
  }, [filterTerritory]);

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/analytics/rep-rankings');
      setRepRankings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOrders = async () => {
    try {
      const url = filterTerritory 
        ? `http://localhost:5000/api/orders?territory=${encodeURIComponent(filterTerritory)}`
        : 'http://localhost:5000/api/orders';
      const res = await axios.get(url);
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // CSV Report Export
const exportToCSV = () => {
    const headerRow = 'Order ID,Sales Rep,Territory,Product,Quantity,Total Amount,Order Date';
    const rows = orders.map(o => 
      `${o.id},"${o.rep_name}","${o.territory_name}","${o.product_name}",${o.quantity},${o.total_amount},"${o.order_date}"`
    );
    const csvContent = [headerRow, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales_report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const chartData = {
    labels: repRankings.map(r => r.rep_name),
    datasets: [
      {
        label: 'Actual Revenue (₹)',
        data: repRankings.map(r => Number(r.total_revenue)),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
      {
        label: 'Monthly Quota (₹)',
        data: repRankings.map(r => Number(r.monthly_quota)),
        backgroundColor: 'rgba(203, 213, 225, 0.8)',
      }
    ],
  };

  const totalSales = orders.reduce((sum, o) => sum + Number(o.total_amount), 0);

  return (
    <div style={{ padding: '28px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px' }}>Enterprise Territory & Sales Analytics Engine</h1>
          <p style={{ margin: '4px 0 0 0', color: '#64748b' }}>Real-time quota tracking & performance dashboard</p>
        </div>
        <button 
          onClick={exportToCSV}
          style={{ padding: '10px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
        >
          Export CSV Report
        </button>
      </header>

      {/* Dynamic KPI Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
          <div style={{ color: '#64748b', fontSize: '13px' }}>Filtered Revenue</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '4px' }}>₹{totalSales.toLocaleString()}</div>
        </div>
        <div style={{ background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
          <div style={{ color: '#64748b', fontSize: '13px' }}>Active Reps</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '4px' }}>{repRankings.length}</div>
        </div>
        <div style={{ background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
          <div style={{ color: '#64748b', fontSize: '13px' }}>Total Orders</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '4px' }}>{orders.length}</div>
        </div>
      </div>

      {/* Chart.js Analytics Visualization */}
      <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #cbd5e1' }}>
        <h3 style={{ margin: '0 0 16px 0' }}>Revenue vs Monthly Quota</h3>
        <Bar data={chartData} options={{ responsive: true }} />
      </div>

      {/* Multi-Dimensional Filter & Table */}
      <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0 }}>Orders Ledger</h3>
          <select 
            value={filterTerritory} 
            onChange={(e) => setFilterTerritory(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          >
            <option value="">All Territories</option>
            <option value="North India">North India</option>
            <option value="South India">South India</option>
            <option value="West India">West India</option>
          </select>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
              <th style={{ padding: '10px' }}>ID</th>
              <th style={{ padding: '10px' }}>Sales Rep</th>
              <th style={{ padding: '10px' }}>Territory</th>
              <th style={{ padding: '10px' }}>Product</th>
              <th style={{ padding: '10px' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '10px' }}>#{o.id}</td>
                <td style={{ padding: '10px' }}>{o.rep_name}</td>
                <td style={{ padding: '10px' }}>{o.territory_name}</td>
                <td style={{ padding: '10px' }}>{o.product_name}</td>
                <td style={{ padding: '10px', fontWeight: 600 }}>₹{Number(o.total_amount).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}