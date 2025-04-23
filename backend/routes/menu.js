const express = require('express');
const router = express.Router();

module.exports = (db) => {

  // Lấy danh sách menu
  router.get('/', async (req, res) => {
    const sql = `
            SELECT
  m.MaMon AS id,
  m.TenMon AS name,
  'Drink' AS category,
  kt.KichThuoc AS size,
  kt.Gia AS price
FROM
  Menu m
LEFT JOIN
  NuocUong nu ON m.MaMon = nu.MaMon
LEFT JOIN
  KichThuocDoUong kt ON nu.MaMon = kt.MaMon

UNION ALL

SELECT
  m.MaMon AS id,
  m.TenMon AS name,
  'Topping' AS category,
  NULL AS size,
  t.Gia AS price
FROM
  Menu m
LEFT JOIN
  Topping t ON m.MaMon = t.MaMon

ORDER BY
  category, name, size;

    `;

    try {
      const [results] = await db.query(sql);
      res.json(results); // Trả kết quả dưới dạng JSON
    } catch (err) {
      console.error('Lỗi lấy menu:', err);
      res.status(500).json({ error: 'Lỗi server' });
    }
  });


  router.post('/', async (req, res) => {
    const { id, name, category, size, price } = req.body;

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      // Thêm vào bảng Menu
      await connection.query(
        'INSERT INTO Menu (MaMon, TenMon) VALUES (?, ?)', [id, name]
      );
      
      // Thêm vào bảng NuocUong hoặc Topping tùy theo category
      if (category === 'Drink' && size) {
        await connection.query(
          'INSERT INTO NuocUong (MaMon) VALUES (?)', [id]
        );
        await connection.query(
          'INSERT INTO KichThuocDoUong (MaMon, KichThuoc, Gia) VALUES (?, ?, ?)',
          [id, size, price]
        );
      } else if (category === 'Topping') {
        await connection.query(
          'INSERT INTO Topping (MaMon) VALUES (?)', [id]
        );
        await connection.query(
          'INSERT INTO Topping (MaMon, Gia) VALUES (?, ?)',
          [id, price]
        );
      }
  
      await connection.commit();
      res.status(201).json({ message: 'Món đã được thêm thành công!' });
    } catch (err) {
      await connection.rollback();
      console.error('Lỗi thêm món:', err);
      res.status(500).json({ error: 'Không thể thêm món' });
    } finally {
      connection.release();
    }
  });

  // Cập nhật món trong menu (PUT)
  router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, category, size, price } = req.body;

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Cập nhật thông tin món trong bảng Menu
      await connection.query(
        'UPDATE Menu SET TenMon = ? WHERE MaMon = ?', [name, id]
      );

      // Cập nhật thông tin cho drink hoặc topping
      if (category === 'Drink' && size) {
        // Cập nhật thông tin trong bảng KichThuocDoUong
        await connection.query(
          'UPDATE KichThuocDoUong SET KichThuoc = ?, Gia = ? WHERE MaMon = ?',
          [size, price, id]
        );
      } else if (category === 'Topping') {
        // Cập nhật thông tin trong bảng Topping
        await connection.query(
          'UPDATE Topping SET Gia = ? WHERE MaMon = ?',
          [price, id]
        );
      }

      await connection.commit();
      res.status(200).json({ message: 'Món đã được cập nhật!' });
    } catch (err) {
      await connection.rollback();
      console.error('Lỗi cập nhật món:', err);
      res.status(500).json({ error: 'Không thể cập nhật món' });
    } finally {
      connection.release();
    }
  });

  // Xóa món khỏi menu (DELETE)
  router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Xóa từ các bảng tương ứng: Topping, KichThuocDoUong, NuocUong, Menu
      await connection.query('DELETE FROM KichThuocDoUong WHERE MaMon = ?', [id]);
      await connection.query('DELETE FROM Topping WHERE MaMon = ?', [id]);
      await connection.query('DELETE FROM NuocUong WHERE MaMon = ?', [id]);
      await connection.query('DELETE FROM Menu WHERE MaMon = ?', [id]);

      await connection.commit();
      res.status(200).json({ message: 'Món đã được xóa' });
    } catch (err) {
      await connection.rollback();
      console.error('Lỗi xóa món:', err);
      res.status(500).json({ error: 'Không thể xóa món' });
    } finally {
      connection.release();
    }
  });

  return router;
};
