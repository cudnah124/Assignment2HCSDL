// routes/auth.js
const express = require('express');

module.exports = (db) => {
  const router = express.Router();

  // Test route
  router.get('/login', (req, res) => {
    res.json({ message: "Hello from auth route!" });
  });

  // Đăng nhập
  router.post('/login', async (req, res) => {
    const { username, password, role } = req.body;
    const table = role === 'Manager' ? 'UserAccount' : 'UserAccount'; // Có thể mở rộng role về sau

    let connection;

    try {
      connection = await db.getConnection(); 

      const [rows] = await connection.query(
        `SELECT * FROM ${table} WHERE Username = ? AND Password = ?`,
        [username, password]
      );

      if (rows.length > 0) {
        res.json({ success: true, message: 'Đăng nhập thành công!' });
      } else {
        res.status(401).json({ success: false, message: 'Sai tài khoản hoặc mật khẩu.' });
      }
    } catch (err) {
      console.error("Lỗi DB:", err);
      res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: err.message });
    } finally {
      if (connection) connection.release(); // 🔥 rất quan trọng
    }
  });

  return router;
};
