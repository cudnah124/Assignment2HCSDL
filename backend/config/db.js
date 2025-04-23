
const mysql = require('mysql2/promise');

let db; 
async function createDBPool() {
  try {
    db = await mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: 'Nhanha213#',
      database: 'TAKEAWAY_CAFE',
      port: 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 50000,
      acquireTimeout: 50000
    });
    console.log('✅ Kết nối pool DB thành công!');
  } catch (err) {
    console.error("❌ Không thể kết nối tới database:", err);
    process.exit(1);  // Dừng server nếu không thể kết nối DB
  }
}
createDBPool();

module.exports = db;
