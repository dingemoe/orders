'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#00C49F', '#FFBB28', '#FF8042', '#0088FE', '#8884d8'];

const Dashboard = ({ data, lines }) => {
  const dashboardData = data;
  if (!dashboardData) {
    return <div className="text-white">Laster dashbord-data...</div>;
  }

  const { totalSum, topProducts, topCustomers } = dashboardData;

  // Prepare data for donut chart (top 5 products)
  const donutData = topProducts.slice(0, 5).map((product, index) => ({
    name: product.name,
    value: product.quantity,
    color: COLORS[index % COLORS.length],
  }));

  const CustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
    name,
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize="12"
      >
        {`${name} (${(percent * 100).toFixed(0)}%)`}
      </text>
    );
  };

  return (
    <div className="space-y-8 p-8 bg-gray-900 text-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Total Sum Card */}
        <div className="bg-gray-800 shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-2 text-gray-200">Total Salg</h2>
          <p className="text-4xl font-bold text-green-400">
            {totalSum ? totalSum.toFixed(2) : '0.00'}
          </p>
        </div>

        {/* Donut Chart - Top 5 Products by Consumption */}
        <div className="bg-gray-800 shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-200">
            Topp 5 Produkter
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={donutData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                labelLine={false}
                label={({
                  cx,
                  cy,
                  midAngle,
                  innerRadius,
                  outerRadius,
                  percent,
                  index,
                }) =>
                  CustomizedLabel({
                    cx,
                    cy,
                    midAngle,
                    innerRadius,
                    outerRadius,
                    percent,
                    index,
                    name: donutData[index].name,
                  })
                }
              >
                {donutData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Horizontal Bar Chart - Top 10 Products by Consumption */}
      <div className="bg-gray-800 shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-200">
          Topp 10 Produkter etter Forbruk
        </h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            layout="vertical"
            data={topProducts}
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis type="number" stroke="#D1D5DB" />
            <YAxis
              dataKey="name"
              type="category"
              width={90}
              tickFormatter={(value) =>
                value.length > 15 ? `${value.substring(0, 15)}...` : value
              }
              stroke="#D1D5DB"
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
            />
            <Legend />
            <Bar dataKey="quantity" fill="#00C49F" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart - Top 10 Customers by Spending */}
      <div className="bg-gray-800 shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-200">
          Topp 10 Kunder etter Forbruk
        </h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={dashboardData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#D1D5DB" />
            <YAxis stroke="#D1D5DB" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
            />
            <Legend />
            <Bar dataKey="total" fill="#FFBB28" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
