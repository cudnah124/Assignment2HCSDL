import React, { useState } from 'react';
import './Customer.css';
import axios from 'axios';
function Customer({ onClose, onSubmit, total }) {
  const [wantToInputCustomer, setWantToInputCustomer] = useState(false);
  const [firstname, setFirstName] = useState('');
  const [lastname, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const changeAmount = parseFloat(paidAmount) - total;

  const handleSubmit = async () => {
    if (isNaN(paidAmount) || parseFloat(paidAmount) < total) {
      alert("💵 Số tiền khách trả không đủ!");
      return;
    }

    const customerData = wantToInputCustomer ? {
      ho: firstname,
      ten: lastname,
      sdt: phone
    } : null;

    try {
      setLoading(true);
      if (wantToInputCustomer) {
        await axios.post('http://localhost:5000/api/customer', {
          firstname,
          lastname,
          phone
        });
      }

      alert("✅ Thanh toán thành công!");
      onSubmit({ customerData, paidAmount });
      onClose();
    } catch (error) {
      console.error("Error:", error);
      alert("Có lỗi xảy ra khi thanh toán. Vui lòng thử lại.");
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
          <label>Tiền nhận </label>
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
