const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');

const authRoutes = require('./routes/auth');
const menuRoutes = require('./routes/menu');
const paymentRoutes = require('./routes/customer');
const employeesRoutes = require('./routes/employee');
const recepit = require('./routes/recepit');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());



// Biến toàn cục để lưu pool
let db;

async function startServer() {
  try {
    db = await mysql.createPool({
      host: 'crossover.proxy.rlwy.net',
      user: 'root',
      password: 'RcUnvKZHWbCAUZDDaovUEOvuOdYUTOTp',
      database: 'railway',
      port: 30541,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 5000
    });


    app.use('/api/auth', authRoutes(db));
    app.use('/api/menu', menuRoutes(db));
    app.use('/api/customer', paymentRoutes(db));
    app.use('/api/employees', employeesRoutes(db));
    // app.use('/api/recepit', recepitRoutes(db));

    app.get('/users', async (req, res) => {
      try {
        const [rows] = await db.query("SELECT * FROM UserAccount");
        res.json(rows);
      } catch (err) {
        console.error("Lỗi truy vấn:", err);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    app.get('/', (req, res) => {
      res.json({ message: "Hello from backend!" });
    });

    app.listen(port, () => {
      console.log(`✅ Server is running on port ${port}`);
    });

  } catch (err) {
    console.error("❌ Không thể kết nối tới database:", err);
    process.exit(1);
  } 
}

startServer(); 
