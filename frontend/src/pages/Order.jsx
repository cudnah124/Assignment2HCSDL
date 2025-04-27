import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/format.css";  

function OrderStatus() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deleteOrder, setDeleteOrder] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actionStatus, setActionStatus] = useState({ message: '', type: '' });
  // Hàm gọi API để lấy dữ liệu đơn hàng
  const fetchOrders = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/recepit");
  
      const formattedOrders = response.data.map(order => {
        const tongTien = Number(order.TongTien) || 0;
  
        return {
          id: order.MaDonHang,
          bill: `${tongTien.toFixed(0)}`,
          date: order.NgayGioTao.slice(0, 10),
          voucher: order.voucher || "None",  // nếu không có trường này trong DB thì bỏ hoặc xử lý riêng
          items: order.NuocUong ? order.NuocUong.split(", ") : [],
          status: order.TrangThai,
          employeeID: order.MaNV,
          customerID: order.customerID || "Unknown",  // nếu có trường này trong DB
        };
      });
  
      setOrders(formattedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };
  
  const handleDeleteClick = (order) => {
    setDeleteOrder(order);
    setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = async () => {
        if (deleteOrder?.id) {
            try {
                const result = await axios.delete(`http://localhost:5000/api/recepit/${deleteOrder.id}`);
                if (result.status === 200) {
                    setActionStatus({ message: 'Order deleted successfully!', type: 'success' });
                    const response = await axios.get("http://localhost:5000/api/recepit");

                    const formattedOrders = response.data.map(order => {
                        const tongTien = Number(order.TongTien) || 0;

                        return {
                            id: order.MaDonHang,
                            bill: `${tongTien.toFixed(0)}`,
                            date: order.NgayGioTao.slice(0, 10),
                            voucher: order.voucher || "None",  // nếu không có trường này trong DB thì bỏ hoặc xử lý riêng
                            items: order.NuocUong ? order.NuocUong.split(", ") : [],
                            status: order.TrangThai,
                            employeeID: order.MaNV,
                            customerID: order.customerID || "Unknown",  // nếu có trường này trong DB
                        };
                    });

                    setOrders(formattedOrders);
                } else {
                    setActionStatus({ message: `Failed to delete: ${result.data.error}`, type: 'error' });
                }
            } catch (error) {
                console.error('Error deleting order:', error);
                setActionStatus({ message: `Failed to delete: ${error.message}`, type: 'error' });
            }
        }
        setShowDeleteConfirm(false);  // Đóng modal xác nhận
        setDeleteOrder(null);  // Reset state của đơn hàng cần xóa
    };
     useEffect(() => {
                if (actionStatus.message) {
                    const timer = setTimeout(() => {
                        setActionStatus({ message: '', type: '' });
                    }, 3000);
                    return () => clearTimeout(timer);
                }
            }, [actionStatus]);
  useEffect(() => {
    fetchOrders(); // Lấy đơn hàng khi component được render
  }, []);

  return (
    <div className="container">
      <div className="main-content">
        <div className="header">
          <h2>Order Status</h2>
        </div>

        <div className="table">
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
                  onClick={() => handleDeleteClick(order)}
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
      {showDeleteConfirm && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <h3>Confirm Delete</h3>
                        <p>Are you sure you want to delete order <b>{deleteOrder.id}</b>?</p>
                        <button onClick={handleDeleteConfirm}>Yes, Delete</button>
                        <button onClick={() => setShowDeleteConfirm(false)} style={{ marginLeft: '10px' }}>Cancel</button>
                    </div>
                </div>
            )}
    </div>
  );
}

export default OrderStatus;
