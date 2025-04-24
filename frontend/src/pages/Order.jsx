import React, { useState } from "react";
import '../styles/format.css';

const orders = [
  {
    id: "1",
    bill: "$18.50",
    date: "2025-04-18",
    voucher: "SAVE10",
    items: ["Espresso", "Matcha Latte"],
    status: "Completed",
    employeeID: "NV0001",
    customerID: "1",
  },
  {
    id: "2",
    bill: "$9.00",
    date: "2025-04-17",
    voucher: "NEW5",
    items: ["Cappuccino"],
    status: "Pending",
    employeeID: "NV0002",
    customerID: "2",

  },
  {
    id: "3",
    bill: "$12.75",
    date: "2025-04-17",
    voucher: "None",
    items: ["Trà Đào", "Bạc xỉu"],
    status: "Cancelled",
    employeeID: "NV0003",
    customerID: "3",
  },
];

function OrderStatus() {
  const [selectedOrder, setSelectedOrder] = useState(null);

  return (
    <div className="order-status-container">
      <div className="main-content">
        <div className="order-header">
          <h2>Order Status</h2>
        </div>

        <div className="order-table">
          <div className="order-row header">
            <span>Order ID</span>
            <span>Date Created</span>
            <span>Bill</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {orders.map((order) => (
            <div className="order-row" key={order.id}>
              <span>{order.id}</span>
              <span>{order.date}</span>
              <span>{order.bill}</span>
              <span className={`status ${order.status.toLowerCase()}`}>{order.status}</span>
              <span className="action-icons">
                <img
                  src="/images/icon/edit.png"
                  alt="Edit"
                  onClick={() => setSelectedOrder(order)}
                  style={{ cursor: "pointer", marginRight: "10px" }}
                />
                <img
                  src="/images/icon/delete.png"
                  alt="Delete"
                  style={{ cursor: "pointer" }}
                  onClick={() => alert(`Delete ${order.id}`)}
                />
              </span>
            </div>
          ))}
        </div>
      </div>

      {selectedOrder && (
        <div className="popup-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <h3>Order Details - {selectedOrder.id}</h3>
            <p><strong>Date:</strong> {selectedOrder.date}</p>
            <p><strong>Bill:</strong> {selectedOrder.bill}</p>
            <p><strong>Status:</strong> {selectedOrder.status}</p>
            <p><strong>Voucher:</strong> {selectedOrder.voucher}</p>
            <p><strong>Items:</strong> {selectedOrder.items.join(", ")}</p>
            <p><strong>EmployeeID:</strong> {selectedOrder.employeeID}</p>
            <p><strong>CustomerID:</strong> {selectedOrder.customerID}</p>
            <button onClick={() => setSelectedOrder(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderStatus;
