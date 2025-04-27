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
    const now = new Date(); // Get the current date and time
    const status = "Pending";
  
    try {
      // Step 1: Fetch all shifts and their employee assignments
      const response = await axios.get('http://localhost:5000/api/calendar');
      
      // Step 2: Find the correct shift based on the current date and time
      const shift = response.data.find(item => {
        const shiftDate = new Date(item.NgayLam + 'T' + item.GioLam);  // Combine date and start time
        const shiftEndTime = new Date(item.NgayLam + 'T' + item.GioTan); // Combine date and end time
        return now >= shiftDate && now <= shiftEndTime;
      });
  
      // If a valid shift is found, get the MaNV (employee ID), otherwise default to 'AAAA'
      const MaNV = shift ? shift.MaNV : 'NV0001';  // Default to 'AAAA' if no shift is found
  
      // Step 3: If there's customer info to input, save it to the DB
      if (wantToInputCustomer) {
        const customerData = { firstname, lastname, phone };
        await axios.post('http://localhost:5000/api/customer', customerData);
      }
  
      // Step 4: Prepare the order payload
      const orderPayload = {
        MaNV: MaNV,  // Use the employee ID (MaNV) from the shift (or 'AAAA' if no shift)
        TrangThai: status,  // Order status
        NgayGioTao: now.toISOString(),  // Current timestamp
        NuocUong: orderItems
          .filter(item => item.category === "Drink")
          .map(item => ({
            MaMon: item.id,  // Drink code
            KichThuoc: item.size,  // Size: "S", "M", "L"
            SoLuong: item.quantity  // Quantity
          })),
        Topping: orderItems
          .filter(item => item.category === "Topping")
          .map(item => ({
            MaMon: item.id,  // Topping code
            SoLuong: item.quantity  // Quantity
          }))
      };
  
      // Step 5: Submit the order to the API
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
