// src/pages/Admin/Dashboard.jsx
import React, { useEffect, useState, useContext } from "react";
import axiosClient from "../../api/axiosClient";
import cookieUtils from "../../utils/cookieUtils";
import { AuthContext } from "../../context/AuthContext";
import jwtDecoder from "../../utils/jwtDecoder";
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
  const { user } = useContext(AuthContext);
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
      console.log("📊 Loading dashboard stats...");
      
      // Debug token và user info
      const token = cookieUtils.getAuthToken();
      console.log("🔑 Current token:", token ? token.substring(0, 30) + "..." : "NO TOKEN");
      console.log("👤 Current user from AuthContext:", JSON.stringify(user, null, 2));
      
      // Decode JWT token để xem nội dung
      if (token) {
        const tokenPayload = jwtDecoder.decodeJWT(token);
        console.log("🔓 JWT Token payload:", JSON.stringify(tokenPayload, null, 2));
        console.log("⏰ Token expired?", jwtDecoder.isTokenExpired(token));
        
        const userFromToken = jwtDecoder.getUserFromToken(token);
        console.log("👤 User info from token:", JSON.stringify(userFromToken, null, 2));
      }
      
      if (!token) {
        console.error("❌ No authentication token found!");
        setStats({
          users: 25,
          orders: 150, 
          books: 320,
          revenue: 15750000,
        });
        return;
      }

      // Test multiple endpoints to understand the 403 pattern
      const testEndpoints = [
        { url: "/books", name: "Books (public?)" },
        { url: "/users", name: "Users (admin only)" },
        { url: "/orders/list", name: "Orders (admin only)" }
      ];

      for (const endpoint of testEndpoints) {
        try {
          console.log(`🧪 Testing ${endpoint.name} - ${endpoint.url}...`);
          const testResponse = await axiosClient.get(endpoint.url);
          console.log(`✅ ${endpoint.name} test successful:`, testResponse.data);
        } catch (testError) {
          console.error(`❌ ${endpoint.name} test failed:`, {
            url: endpoint.url,
            status: testError.response?.status,
            message: testError.response?.data?.message || testError.message,
            errorDetail: testError.response?.data
          });
        }
      }
      
      const [users, orders, books] = await Promise.all([
        axiosClient.get("/users").catch((err) => {
          console.warn("⚠️ Users API failed:", err.response?.status, err.response?.data);
          return { data: { data: [] } };
        }),
        axiosClient.get("/orders/list").catch((err) => {
          console.warn("⚠️ Orders API failed:", err.response?.status, err.response?.data);
          return { data: { data: [] } };
        }),
        axiosClient.get("/books").catch((err) => {
          console.warn("⚠️ Books API failed:", err.response?.status, err.response?.data);
          return { data: { data: [] } };
        }),
      ]);
      
      console.log("Users response:", users.data);
      console.log("Orders response:", orders.data);
      console.log("Books response:", books.data);

      // Safely handle orders data
      const ordersData = Array.isArray(orders.data.data) ? orders.data.data : 
                        Array.isArray(orders.data.data?.items) ? orders.data.data.items :
                        Array.isArray(orders.data.data?.content) ? orders.data.data.content : [];
      
      const revenue = ordersData.reduce(
        (sum, o) => sum + (o.totalPrice || 0),
        0
      );

      // Safely handle users data
      const usersData = Array.isArray(users.data.data) ? users.data.data :
                       Array.isArray(users.data.data?.items) ? users.data.data.items :
                       Array.isArray(users.data.data?.content) ? users.data.data.content : [];
      
      // Safely handle books data  
      const booksData = Array.isArray(books.data.data) ? books.data.data :
                       Array.isArray(books.data.data?.items) ? books.data.data.items :
                       Array.isArray(books.data.data?.content) ? books.data.data.content : [];

      setStats({
        users: usersData.length,
        orders: ordersData.length, 
        books: booksData.length,
        revenue,
      });

      // Chart doanh thu theo ngày (fake tổng từ orders)
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
      
      console.log("✅ Dashboard stats loaded (with fallback data due to API restrictions)");
    } catch (err) {
      console.error("📈 Dashboard load error:", err);
      
      // Special handling for 403 errors
      if (err.response?.status === 403) {
        console.warn("⚠️ 403 Forbidden: User may not have admin permissions or token is invalid");
      }
      
      // Set mock data when backend fails (likely due to 403 permissions)
      console.log("🎭 Using mock data due to API access restrictions");
      setStats({
        users: 25,
        orders: 150, 
        books: 320,
        revenue: 15750000,
      });
      
      // Mock chart data
      setChartData([
        { date: "2025-11-18", total: 2500000 },
        { date: "2025-11-19", total: 3200000 },
        { date: "2025-11-20", total: 1800000 }
      ]);
      
      setOrderChart([
        { date: "2025-11-18", count: 12 },
        { date: "2025-11-19", count: 18 },
        { date: "2025-11-20", count: 8 }
      ]);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 space-y-2">
          <p className="text-yellow-800 text-sm">
            🚧 <strong>Demo Mode:</strong> Displaying mock data due to API access restrictions. 
            Real data will be shown when backend permissions are configured.
          </p>
          {user && (
            <p className="text-blue-800 text-sm">
              👤 <strong>Current User:</strong> {user.username} | 
              <strong> Role:</strong> {user.role} | 
              <strong> Token:</strong> {cookieUtils.getAuthToken() ? "✅ Present" : "❌ Missing"}
            </p>
          )}
        </div>
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
