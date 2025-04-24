import React, { useState } from "react";
import '../styles/format.css';

const reports = [
  {
    date: "2025-04-17",
    soldDrinks: ["Espresso", "Latte", "Trà Đào"],
    total: 150,
    discount: 20,
    profit: 130,
    orders: [
      { id: "ORD001", items: ["Espresso", "Latte"], bill: 50, voucher: "SAVE10", employee: "NV0001" },
      { id: "ORD002", items: ["Trà Đào"], bill: 100, voucher: "NEW5", employee: "NV0002" },
    ],
  },
  {
    date: "2025-04-18",
    soldDrinks: ["Cappuccino"],
    total: 75,
    discount: 5,
    profit: 70,
    orders: [
      { id: "ORD003", items: ["Cappuccino"], bill: 75, voucher: "None", employee: "NV0003" },
    ],
  },
];

function ReportByDate() {
  const [selectedReport, setSelectedReport] = useState(null);
  const [searchDate, setSearchDate] = useState("");

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
          <span>Sold Drinks</span>
          <span>Total</span>
          <span>Discount</span>
          <span>Profit</span>
          <span>Action</span>
        </div>

        {filteredReports.map((report) => (
          <div className="report-row" key={report.date}>
            <span>{report.date}</span>
            <span>{report.soldDrinks.join(", ")}</span>
            <span>${report.total}</span>
            <span>${report.discount}</span>
            <span>${report.profit}</span>
            
          </div>
        ))}
      </div>

      {selectedReport && (
        <div className="popup-overlay" onClick={() => setSelectedReport(null)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <h3>Details for {selectedReport.date}</h3>
            {selectedReport.orders.map((order) => (
              <div key={order.id} style={{ marginBottom: "10px" }}>
                <p><strong>Order ID:</strong> {order.id}</p>
                <p><strong>Items:</strong> {order.items.join(", ")}</p>
                <p><strong>Bill:</strong> ${order.bill}</p>
                <p><strong>Voucher:</strong> {order.voucher}</p>
                <p><strong>Processed by:</strong> {order.employee}</p>
                <hr />
              </div>
            ))}
            <button onClick={() => setSelectedReport(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportByDate;
