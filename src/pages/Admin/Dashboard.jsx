import React, { useEffect, useState, useContext } from "react";
import axiosClient from "../../api/axiosClient";
import cookieUtils from "../../utils/cookieUtils";
import { AuthContext } from "../../context/AuthContext";
import jwtDecoder from "../../utils/jwtDecoder";
import { useNavigate } from "react-router-dom";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    users: 0,
    orders: 0,
    books: 0,
    revenue: 0,
  });

  const [chartData, setChartData] = useState([]);
  const [orderChart, setOrderChart] = useState([]);

  const loadStats = async () => {
    try {
      const token = cookieUtils.getAuthToken();

      if (!token) {
        setStats({
          users: 25,
          orders: 150,
          books: 320,
          revenue: 15750000,
        });
        return;
      }

      const [users, orders, books] = await Promise.all([
        axiosClient.get("/users").catch(() => ({ data: { data: [] } })),
        axiosClient.get("/orders/list").catch(() => ({ data: { data: [] } })),
        axiosClient.get("/books").catch(() => ({ data: { data: [] } })),
      ]);

      // Safely handle orders data
      const ordersData = Array.isArray(orders.data.data)
        ? orders.data.data
        : Array.isArray(orders.data.data?.items)
        ? orders.data.data.items
        : Array.isArray(orders.data.data?.content)
        ? orders.data.data.content
        : [];

      const revenue = ordersData.reduce(
        (sum, o) => sum + (o.totalPrice || 0),
        0
      );

      // Safely handle users data
      const usersData = Array.isArray(users.data.data)
        ? users.data.data
        : Array.isArray(users.data.data?.items)
        ? users.data.data.items
        : Array.isArray(users.data.data?.content)
        ? users.data.data.content
        : [];

      // Safely handle books data
      const booksData = Array.isArray(books.data.data)
        ? books.data.data
        : Array.isArray(books.data.data?.items)
        ? books.data.data.items
        : Array.isArray(books.data.data?.content)
        ? books.data.data.content
        : [];

      setStats({
        users: usersData.length,
        orders: ordersData.length,
        books: booksData.length,
        revenue,
      });

      // Chart doanh thu theo ngày
      const grouped = {};
      ordersData.forEach((o) => {
        const day = o.createdAt?.split("T")[0] || "Unknown";
        grouped[day] = (grouped[day] || 0) + (o.totalPrice || 0);
      });

      setChartData(
        Object.entries(grouped).map(([date, total]) => ({ date, total }))
      );

      // Chart số đơn hàng theo ngày
      const groupedCount = {};
      ordersData.forEach((o) => {
        const day = o.createdAt?.split("T")[0] || "Unknown";
        groupedCount[day] = (groupedCount[day] || 0) + 1;
      });

      setOrderChart(
        Object.entries(groupedCount).map(([date, count]) => ({
          date,
          count,
        }))
      );
    } catch (err) {
      setStats({
        users: 25,
        orders: 150,
        books: 320,
        revenue: 15750000,
      });

      setChartData([
        { date: "2025-11-18", total: 2500000 },
        { date: "2025-11-19", total: 3200000 },
        { date: "2025-11-20", total: 1800000 },
      ]);

      setOrderChart([
        { date: "2025-11-18", count: 12 },
        { date: "2025-11-19", count: 18 },
        { date: "2025-11-20", count: 8 },
      ]);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
      </div>

      <button
        onClick={async () => {
          await logout();
          navigate("/login");
        }}
        className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center gap-2"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
        Đăng xuất
      </button>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 space-y-2">
        <p className="text-yellow-800 text-sm">
          🚧 <strong>Demo Mode:</strong> Displaying mock data due to API access
          restrictions. Real data will be shown when backend permissions are
          configured.
        </p>

        {/* Order Testing Debug Section */}
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-blue-800 text-sm font-medium mb-2">
            🛒 Order Debug Tools
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={async () => {
                const { testCreateOrder } = await import(
                  "../../utils/testOrders"
                );
                console.log("🔍 Testing order creation...");
                const result = await testCreateOrder(user);
                console.table(result);
                alert(
                  `Order creation test completed. Check console for details.`
                );
              }}
              className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
            >
              Test Create Order
            </button>

            <button
              onClick={async () => {
                const { testOrderRetrieval } = await import(
                  "../../utils/testOrders"
                );
                console.log("🔍 Testing order retrieval...");
                const result = await testOrderRetrieval(user);
                console.table(result);
                const workingEndpoints = result.filter(
                  (r) => r.success && r.hasContent
                );
                alert(
                  `Found ${workingEndpoints.length} working endpoints with orders. Check console for details.`
                );
              }}
              className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
            >
              Test Get Orders
            </button>

            <button
              onClick={async () => {
                const { fullOrderTest } = await import(
                  "../../utils/testOrders"
                );
                console.log("🔍 Running full order test...");
                const result = await fullOrderTest(user);
                console.log("Full order test result:", result);
                if (result.success) {
                  alert(
                    `✅ Full test passed!\nOrder ID: ${result.summary.orderId}\nBest endpoint: ${result.summary.bestRetrieveEndpoint}`
                  );
                } else {
                  alert(`❌ Full test failed: ${result.error}`);
                }
              }}
              className="px-3 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600"
            >
              Full Order Test
            </button>
          </div>
        </div>

        {user && (
          <p className="text-blue-800 text-sm">
            👤 <strong>Current User:</strong> {user.username} |{" "}
            <strong>Role:</strong> {user.role} |{" "}
            <strong>Token:</strong>{" "}
            {cookieUtils.getAuthToken() ? "✅ Present" : "❌ Missing"}
          </p>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-sm text-gray-500">Total Users</h3>
          <p className="text-2xl font-semibold">{stats.users}</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-sm text-gray-500">Total Orders</h3>
          <p className="text-2xl font-semibold">{stats.orders}</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-sm text-gray-500">Total Books</h3>
          <p className="text-2xl font-semibold">{stats.books}</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-sm text-gray-500">Total Revenue</h3>
          <p className="text-2xl font-semibold text-green-600">
            {stats.revenue.toLocaleString()} đ
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue Line Chart */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">Revenue (per day)</h3>

          <Line
            data={{
              labels: chartData.map((i) => i.date),
              datasets: [
                {
                  label: "Revenue",
                  data: chartData.map((i) => i.total),
                  fill: false,
                  borderColor: "#4F46E5",
                  tension: 0.2,
                },
              ],
            }}
          />
        </div>

        {/* Orders Count */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">Orders (per day)</h3>

          <Bar
            data={{
              labels: orderChart.map((i) => i.date),
              datasets: [
                {
                  label: "Orders",
                  data: orderChart.map((i) => i.count),
                  backgroundColor: "#10B981",
                },
              ],
            }}
          />
        </div>
      </div>
    </div>
  );
}
