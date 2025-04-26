import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import "../styles/report.css";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function ReportByDate() {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [searchDate, setSearchDate] = useState("");
  const [revenueData, setRevenueData] = useState([]); 

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/recepit");
        const data = await res.json();

        const completed = data.filter((d) => d.TrangThai === "Completed");
        const grouped = {}; 

        for (const order of completed) {
          const date = order.NgayGioTao.slice(0, 10);
          const month = new Date(order.NgayGioTao).getMonth(); // Extract month
          const tongTien = parseFloat(order.TongTien || 0);

          if (!grouped[date]) {
            grouped[date] = {
              date,
              orders: [],
            };
          }

          // Tách tên + số lượng: "Trà Sữa x2" => "Trà Sữa (2)"
          const drinkNames = order.NuocUong?.split(", ").map((d) => {
            const match = d.match(/^(.*)\s+x(\d+)$/);
            if (match) {
              const [, name, qty] = match; 
              return `${name} x ${qty}`;
            }
            return d; // fallback if no match
          }) || [];

          grouped[date].orders.push({
            id: order.MaDonHang,
            drinkNames,
            bill: tongTien,
            voucher: "Không rõ",
            employee: order.MaNV,
          });
        }

        // Prepare revenue data for the line chart (monthly total)
        const monthlyRevenue = Array(12).fill(0);
        for (const order of completed) {
          const month = new Date(order.NgayGioTao).getMonth();
          const tongTien = parseFloat(order.TongTien || 0);
          monthlyRevenue[month] += tongTien;
        }

        const finalReports = Object.values(grouped);
        setReports(finalReports);
        setRevenueData(monthlyRevenue); 

      } catch (err) {
        console.error("Lỗi lấy báo cáo:", err);
      }
    };

    fetchReports();
  }, []);

  const filteredReports = searchDate
    ? reports.filter((r) => r.date === searchDate)
    : reports;

  // Line chart data and options for revenue
  const revenueChartData = {
    labels: [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ],
    datasets: [
      {
        label: "Total Revenue ($)",
        data: revenueData,
        fill: false,
        borderColor: "rgba(75, 192, 192, 1)",
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="report-container">
      <div className="report-header">
        <h2>Report by Date</h2>
        <input
          type="date"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
        />
      </div>

      <div className="report-section">
        <div className="report-table">
          <div className="report-row header">
            <span>Date</span>
            <span>Order ID</span>
            <span>Sold Drinks</span>
            <span>Total</span>
            <span>Discount</span>
            <span>Profit</span>
          </div>

          {filteredReports.map((report) => (
            <div key={report.date}>
              {report.orders.map((order) => (
                <div className="report-row" key={order.id}>
                  <span>{report.date}</span>
                  <span>{order.id}</span>
                  <span>{order.drinkNames.join(", ")}</span>
                  <span>${order.bill.toFixed(0)}</span>
                  <span>$0</span>
                  <span>${order.bill.toFixed(0)}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Line chart for Total Revenue */}
        <div className="chart-container">
          <Line data={revenueChartData} />
        </div>
      </div> 

      {selectedReport && (
        <div className="popup-overlay" onClick={() => setSelectedReport(null)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <h3>Details for Order ID {selectedReport.id}</h3>
            <p><strong>Order ID:</strong> {selectedReport.id}</p>
            <p><strong>Items:</strong> {selectedReport.drinkNames.join(", ")}</p>
            <p><strong>Bill:</strong> ${selectedReport.bill.toFixed(2)}</p>
            <p><strong>Voucher:</strong> {selectedReport.voucher}</p>
            <p><strong>Processed by:</strong> {selectedReport.employee}</p>
            <button onClick={() => setSelectedReport(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportByDate;
