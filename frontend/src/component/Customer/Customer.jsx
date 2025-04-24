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
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const employeeId = "NV0001";
    const status = "Pending";
  
    try {
      // B1: Nếu có khách hàng, thêm vào DB
      let customerId = null;
      if (wantToInputCustomer) {
        const customerData = { ho: firstname, ten: lastname, sdt: phone };
        const res = await axios.post('http://localhost:5000/api/customer', customerData);
        customerId = res.data.insertId;
      }
  
      // B2: Chuẩn bị dữ liệu đơn hàng
      const drinks = orderItems
        .filter(item => item.category === "Drink")
        .map(item => ({
          MaMon: item.id,
          KichThuoc: item.size,
          SoLuong: item.quantity
        }));
  
      const toppings = orderItems
        .filter(item => item.category === "Topping")
        .map(item => ({
          MaMon: item.id,
          SoLuong: item.quantity
        }));
  
      const orderPayload = {
        TrangThai: status,
        MaNV: employeeId,
        MaKH: customerId,
        NgayGioTao: now,
        NuocUong: drinks,
        Topping: toppings
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
        <h2>Xác nhận thanh toán</h2>

        <label>
          <input
            type="checkbox"
            checked={wantToInputCustomer}
            onChange={(e) => setWantToInputCustomer(e.target.checked)}
          />
          Nhập thông tin khách hàng
        </label>

        {wantToInputCustomer && (
          <>
            <div className="form-group">
              <label>Họ:</label>
              <input type="text" value={firstname} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Tên:</label>
              <input type="text" value={lastname} onChange={(e) => setLastName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Số điện thoại:</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </>
        )}

        <div className="form-group">
          <label>Tiền nhận</label>
          <input
            type="number"
            value={paidAmount}
            onChange={(e) => setPaidAmount(e.target.value)}
            placeholder=""
          />
        </div>

        {paidAmount && !isNaN(changeAmount) && (
          <div className="form-group">
            <label>Tiền thối lại:</label>
            <div>{changeAmount.toLocaleString()} VND</div>
          </div>
        )}

        <button
          type="button"
          className="submit-btn"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Đang xử lý...' : 'Xác nhận'}
        </button>
        <button className="close-btn" onClick={onClose}>Đóng</button>
      </div>
    </div>
  );
}

export default Customer;
