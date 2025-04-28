// routes/auth.js
const express = require('express');

module.exports = (db) => {
  const router = express.Router();

  // Test route
  router.get('/login', (req, res) => {
    res.json({ message: "Hello from auth route!" });
  });

  router.post('/login', async (req, res) => {
    const { username, password, role } = req.body;
    const table = role === 'sManager' ? 'ManagerAccount' : 'EmployeeAccount';
    let connection;

    try {
      connection = await db.getConnection(); 
      const [rowsCheck] = await connection.query(
        `SELECT * FROM ManagerAccount WHERE Username = ? AND Password = ?`,
        [username, password]
      );

      const [rows] = await connection.query(
        `SELECT * FROM ${table} WHERE Username = ? AND Password = ?`,
        [username, password]
      );

      if (rows.length > 0 || rowsCheck.length > 0) {
        res.json({ success: true, message: 'Đăng nhập thành công!' });
      } else {
        res.status(401).json({ success: false, message: 'Sai tài khoản hoặc mật khẩu.' });
      }
    } catch (err) {
      console.error("Lỗi DB:", err);
      res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: err.message });
    } finally {
      if (connection) connection.release();
    }
  });

  return router;
};
