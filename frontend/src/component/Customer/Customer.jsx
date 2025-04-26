import React, { useState } from 'react';
import './Customer.css';
import axios from 'axios';
import { useOrder } from "../../context/OrderContext";


function Customer({ onClose, onSubmit, total, orderItems }) {
  const [wantToInputCustomer, setWantToInputCustomer] = useState(false);
  const [firstname, setFirstName] = useState('');
  const [lastname, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetOrder } = useOrder();
  const changeAmount = parseFloat(paidAmount) - total;

  const handleSubmit = async () => {
    setLoading(true);
    const now = new Date().toISOString();
    const status = "Pending";
  
    try {
      // B1: Nếu có khách hàng, thêm vào DB
      if (wantToInputCustomer) {
        const customerData = { firstname, lastname, phone };
        await axios.post('http://localhost:5000/api/customer', customerData);
      }
  
      // B2: Chuẩn bị dữ liệu đơn hàng
      const orderPayload = {
        MaNV: "NV0002",                      // mã nhân viên (string)
        TrangThai: status,           // trạng thái đơn hàng (string)
        NgayGioTao: now, // ISO datetime
        NuocUong: orderItems
          .filter(item => item.category === "Drink")
          .map(item => ({
            MaMon: item.id,                // mã món nước
            KichThuoc: item.size,          // size: "S", "M", "L"
            SoLuong: item.quantity         // số lượng
          })),
        Topping: orderItems
          .filter(item => item.category === "Topping")
          .map(item => ({
            MaMon: item.id,                // mã topping
            SoLuong: item.quantity         // số lượng
          }))
      };

  
      await axios.post('http://localhost:5000/api/recepit', orderPayload);
      alert("✅ Đơn hàng đã được thêm!");
      resetOrder();
      
      onSubmit({ customerData: { firstname, lastname, phone }, paidAmount });
      onClose();
    } catch (err) {
      console.error("Lỗi gửi đơn hàng:", err);
      alert("❌ Gửi đơn hàng thất bại!");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="customer-modal">
      <div className="customer-modal-content">
        <h2>Payment Confirm</h2> 
        <label>
          <input
          style={{ marginRight: "5px" }}
            type="checkbox"
            checked={wantToInputCustomer}
            onChange={(e) => setWantToInputCustomer(e.target.checked)}
          />
          Customer Details
        </label>

        {wantToInputCustomer && (
          <>
            <div className="form-group">
              <label>Last Name:</label>
              <input style={{ marginLeft: "5px" }} type="text" value={firstname} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>First Name:</label>
              <input style={{ marginLeft: "5px" }} type="text" value={lastname} onChange={(e) => setLastName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Phone:</label>
              <input style={{ marginLeft: "5px" }} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </>
        )}

        <div className="form-group">
          <label>Received</label>
          <input
            style={{ marginLeft: "5px" }}
            type="number"
            value={paidAmount}
            onChange={(e) => setPaidAmount(e.target.value)}
            placeholder=""
          />
        </div>

        {paidAmount && !isNaN(changeAmount) && (
          <div className="form-group">
            <label>Change:</label>
            <div>{changeAmount.toLocaleString()} VND</div>
          </div>
        )}

        <button
          type="button"
          className="submit-btn"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Confirm'}
        </button>
        <button className="close-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default Customer;
