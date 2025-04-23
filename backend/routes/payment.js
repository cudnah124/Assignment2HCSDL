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
router.get('/', (req, res) => {
  res.json({ message: "Hello from customer route!" });
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

  if (!firstname && !lastname && !phone) {
    return res.status(400).json({ message: 'Thiếu thông tin khách hàng.' });
  }

  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    console.log("Bắt đầu thêm khách hàng...");

    const [result] = await connection.query(
      `INSERT INTO KhachHang (Ho, Ten) VALUES (?, ?)`,
      [firstname, lastname]
    );

    const newMaKH = result.insertId;

    await connection.query(
      `INSERT INTO SDT_KhachHang (MaKH, SDT) VALUES (?, ?)`,
      [newMaKH, phone]
    );

    await connection.commit();

    const allCustomers = await fetchAllCustomers();

    res.status(200).json({
      message: 'Thêm khách hàng thành công.',
      MaKH: newMaKH,
      firstname,
      lastname,
      phone,
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
