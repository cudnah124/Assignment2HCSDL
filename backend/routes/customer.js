const express = require('express');
const router = express.Router();

module.exports = (db) => {

async function fetchAllCustomers() {
  const sql = `
    SELECT KH.MaKH, KH.Ho, KH.Ten, KH.DiemTichLuy, KH.LoaiThanhVien, SDT.SDT
    FROM KhachHang KH
    LEFT JOIN SDT_KhachHang SDT ON KH.MaKH = SDT.MaKH
    ORDER BY KH.MaKH DESC
  `;
  const [rows] = await db.query(sql);
  return rows;
}

// Route test
router.get('/', async (req, res) => {
  const sql = `
  SELECT KH.MaKH, KH.Ho, KH.Ten, KH.DiemTichLuy, KH.LoaiThanhVien, SDT.SDT
  FROM KhachHang KH
  LEFT JOIN SDT_KhachHang SDT ON KH.MaKH = SDT.MaKH
  ORDER BY KH.MaKH DESC
  `;
  try {
    const [results] = await db.query(sql);
    res.json(results);
  } catch (err) {
    console.error('Lỗi lấy employees:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Route GET để lấy toàn bộ khách hàng
router.get('/all', async (req, res) => {
  try {
    const customers = await fetchAllCustomers();
    res.status(200).json({ customers });
  } catch (err) {
    console.error("Lỗi khi truy vấn khách hàng:", err);
    res.status(500).json({ message: 'Lỗi server khi truy vấn khách hàng.', error: err });
  }
});

// Route POST để thêm khách hàng mới
router.post('/', async (req, res) => {
    const { firstname, lastname, phone } = req.body;

    if (!firstname || !lastname || !phone) {
      return res.status(400).json({ message: 'Thiếu thông tin khách hàng.' });
    }

    const cleanedFirstname = String(firstname).trim();
    const cleanedLastname = String(lastname).trim();
    const cleanedPhone = String(phone).trim();

    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(cleanedPhone)) {
      return res.status(400).json({ message: 'Số điện thoại không hợp lệ.' });
    }

    let connection;

    try {
      connection = await db.getConnection();
      await connection.beginTransaction();

      console.log("Bắt đầu kiểm tra số điện thoại...");

      // Kiểm tra nếu số điện thoại đã tồn tại
      const [existingPhoneRows] = await connection.query(
        `SELECT MaKH FROM SDT_KhachHang WHERE SDT = ?`,
        [cleanedPhone]
      );

      if (existingPhoneRows.length > 0) {
        const existingMaKH = existingPhoneRows[0].MaKH;

        await connection.rollback();  // Không thêm khách mới, rollback
        return res.status(200).json({
          message: 'Số điện thoại đã tồn tại.',
          MaKH: existingMaKH
        });
      }
      // Thêm khách hàng vào bảng KhachHang
      const [result] = await connection.query(
        `INSERT INTO KhachHang (Ho, Ten) VALUES (?, ?)`,
        [cleanedFirstname, cleanedLastname]
      );

      const newMaKH = result.insertId;

      // Thêm số điện thoại vào bảng SDT_KhachHang
      await connection.query(
        `INSERT INTO SDT_KhachHang (MaKH, SDT) VALUES (?, ?)`,
        [newMaKH, cleanedPhone]
      );

      await connection.commit();

      // Lấy lại danh sách tất cả khách hàng
      const allCustomers = await fetchAllCustomers();

      res.status(200).json({
        message: 'Thêm khách hàng thành công.',
        MaKH: newMaKH,
        firstname: cleanedFirstname,
        lastname: cleanedLastname,
        phone: cleanedPhone,
        allCustomers
      });
      
    } catch (err) {
      console.error("Lỗi trong quá trình xử lý:", err);
      if (connection) await connection.rollback();
      res.status(500).json({ message: 'Lỗi trong quá trình xử lý.', error: err });
    } finally {
      if (connection) connection.release();
    }
  });
return router;
}
