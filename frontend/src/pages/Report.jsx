import React, { useEffect, useState } from "react";
import "../styles/format.css";

function ReportByDate() {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [searchDate, setSearchDate] = useState("");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/recepit");
        const data = await res.json();

        const completed = data.filter((d) => d.TrangThai === "Completed");
        const grouped = {};

        for (const order of completed) {
          const date = order.NgayGioTao.slice(0, 10);
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
            return d; // fallback nếu không khớp
          }) || [];

          grouped[date].orders.push({
            id: order.MaDonHang,
            drinkNames,
            bill: tongTien,
            voucher: "Không rõ",
            employee: order.MaNV,
          });
        }

        const finalReports = Object.values(grouped);
        setReports(finalReports);
      } catch (err) {
        console.error("Lỗi lấy báo cáo:", err);
      }
    };

    fetchReports();
  }, []);

  const filteredReports = searchDate
    ? reports.filter((r) => r.date === searchDate)
    : reports;

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

      <div className="report-table">
        <div className="report-row header">
          <span>Date</span>
          <span>Order ID</span>
          <span>Sold Drinks</span>
          <span>Total</span>
          <span>Discount</span>
          <span>Profit</span>
          <span>Action</span>
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
                {/* <span>
                  <button onClick={() => setSelectedReport(order)}>View</button>
                </span> */}
              </div>
            ))}
          </div>
        ))}
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
