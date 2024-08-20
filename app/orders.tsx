'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import Dashboard from './dashboard';

const OrderLinesTable = () => {
  const [orderLines, setOrderLines] = useState([]);
  const [groupedView, setGroupedView] = useState(true);
  const [scrollLeft, setScrollLeft] = useState(0);
  const tableRef = useRef(null);

  useEffect(() => {
    const fetchXMLData = async () => {
      try {
        const response = await fetch('/data.xml');
        const xmlText = await response.text();
        parseXMLData(xmlText);
      } catch (error) {
        console.error('Error fetching XML data:', error);
      }
    };

    const parseXMLData = (xmlString) => {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
      const orders = xmlDoc.getElementsByTagName('ORDER');

      const units = ['RS Enhet 1', 'RS Enhet 2'];
      let currentUnitIndex = 0;

      const extractedOrderLines = Array.from(orders).flatMap(
        (order, orderIndex) => {
          const orderId = order.getElementsByTagName('ORDERID')[0]?.textContent;
          const yourRef = order.getElementsByTagName('YOURREF')[0]?.textContent;

          const unit = units[currentUnitIndex];
          currentUnitIndex = (currentUnitIndex + 1) % units.length;

          const orderLines = Array.from(
            order.getElementsByTagName('ORDERLINE')
          ).map((line, lineIndex) => ({
            unit,
            orderId,
            yourRef,
            prodId: line.getElementsByTagName('PRODID')[0]?.textContent,
            productName:
              line.getElementsByTagName('DESCRIPTION')[0]?.textContent || 'N/A',
            quantity:
              parseFloat(
                line.getElementsByTagName('QUANTITY')[0]?.textContent
              ) || 0,
            price:
              parseFloat(line.getElementsByTagName('PRICE')[0]?.textContent) ||
              0,
            discount:
              parseFloat(
                line.getElementsByTagName('DISCOUNT')[0]?.textContent
              ) || 0,
            total:
              (parseFloat(
                line.getElementsByTagName('QUANTITY')[0]?.textContent
              ) || 0) *
              (parseFloat(line.getElementsByTagName('PRICE')[0]?.textContent) ||
                0) *
              (1 -
                (parseFloat(
                  line.getElementsByTagName('DISCOUNT')[0]?.textContent
                ) || 0) /
                  100),
            isFirstInOrder: lineIndex === 0,
            isLastInOrder: false,
            orderIndex,
            isOrderTotal: false,
          }));

          const orderTotal = orderLines.reduce(
            (sum, line) => sum + line.total,
            0
          );

          orderLines[orderLines.length - 1].isLastInOrder = true;

          orderLines.push({
            unit,
            orderId,
            yourRef,
            isOrderTotal: true,
            total: orderTotal,
            orderIndex,
          });

          return orderLines;
        }
      );

      // Sort by order ID
      extractedOrderLines.sort((a, b) =>
        a.orderId.localeCompare(b.orderId, undefined, { numeric: true })
      );

      setOrderLines(extractedOrderLines);
    };

    fetchXMLData();
  }, []);

  const handleScroll = (e) => {
    setScrollLeft(e.target.scrollLeft);
  };

  const toggleGrouping = () => {
    setGroupedView(!groupedView);
  };

  const renderTableBody = () => {
    if (groupedView) {
      return orderLines.map((line, index) => (
        <tr
          key={index}
          className={`
            ${
              line.isOrderTotal
                ? 'bg-green-100 font-bold'
                : line.orderIndex % 2 === 0
                ? 'bg-gray-50'
                : 'bg-white'
            }
            ${line.isFirstInOrder ? 'border-t-2 border-green-500' : ''}
            ${
              line.isLastInOrder || line.isOrderTotal
                ? 'border-b-2 border-green-500'
                : ''
            }
            ${
              line.isFirstInOrder || line.isLastInOrder || line.isOrderTotal
                ? 'border-r-2 border-green-500'
                : ''
            }
          `}
        >
          <td
            className={`sticky left-0 z-10 px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${
              line.isOrderTotal
                ? 'bg-green-100'
                : line.orderIndex % 2 === 0
                ? 'bg-gray-50'
                : 'bg-white'
            } border-l-2 border-green-500`}
          >
            {line.unit}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {line.orderId}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {line.yourRef}
          </td>
          {line.isOrderTotal ? (
            <td
              colSpan="5"
              className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right"
            >
              Order Total:
            </td>
          ) : (
            <>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {line.prodId}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {line.productName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {line.quantity}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {line.price?.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {line.discount}%
              </td>
            </>
          )}
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {line.total?.toFixed(2)}
          </td>
        </tr>
      ));
    } else {
      return orderLines
        .filter((line) => !line.isOrderTotal)
        .map((line, index) => (
          <tr
            key={index}
            className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
          >
            <td
              className={`sticky left-0 z-10 px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${
                index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
              }`}
            >
              {line.unit}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {line.orderId}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {line.yourRef}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {line.prodId}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {line.productName}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {line.quantity}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {line.price?.toFixed(2)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {line.discount}%
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {line.total?.toFixed(2)}
            </td>
          </tr>
        ));
    }
  };

  const dashboardData = useMemo(() => {
    const totalSum = orderLines.reduce(
      (sum, line) => sum + (line.total || 0),
      0
    );

    const productConsumption = orderLines.reduce((acc, line) => {
      if (!line.isOrderTotal) {
        acc[line.prodId] = (acc[line.prodId] || 0) + line.quantity;
      }
      return acc;
    }, {});

    const topProducts = Object.entries(productConsumption)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    const customerSpending = orderLines.reduce((acc, line) => {
      if (!line.isOrderTotal) {
        acc[line.yourRef] = (acc[line.yourRef] || 0) + line.total;
      }
      return acc;
    }, {});

    const topCustomers = Object.entries(customerSpending)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    return { totalSum, topProducts, topCustomers };
  }, [orderLines]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Order Lines</h1>
      <div className="mb-4">
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            className="form-checkbox h-5 w-5 text-blue-600"
            checked={groupedView}
            onChange={toggleGrouping}
          />
          <span className="ml-2 text-gray-700">Group by Order</span>
        </label>
      </div>
      <div className="relative">
        <div
          className="overflow-x-auto"
          style={{ maxHeight: '600px' }}
          onScroll={handleScroll}
          ref={tableRef}
        >
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="sticky left-0 z-10 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-100">
                  Enhet
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Your Reference
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Discount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>{renderTableBody()}</tbody>
          </table>
        </div>
      </div>
      {/* Dashboard */}
      <div className="mt-8 space-y-6">
        {dashboardData ? (
          <Dashboard data={dashboardData} lines={orderLines} />
        ) : (
          <span></span>
        )}
      </div>
    </div>
  );
};

export default OrderLinesTable;
