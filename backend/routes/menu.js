const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const uploadPath = path.join(__dirname, '..','..', 'frontend', 'public', 'images', 'drinks');

// Đảm bảo thư mục uploads tồn tại
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

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
          JOIN
            NuocUong nu ON m.MaMon = nu.MaMon
          JOIN
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
          JOIN
            Topping t ON m.MaMon = t.MaMon

          ORDER BY
            category, name, size
    `;

    try {
      const [results] = await db.query(sql);
      res.json(results); // Trả kết quả dưới dạng JSON
    } catch (err) {
      console.error('Lỗi lấy menu:', err);
      res.status(500).json({ error: 'Lỗi server' });
    }
  });


  router.post('/', upload.single('image'), async (req, res) => {
    const id = String(req.body.id);
    const name = String(req.body.name);
    const category = String(req.body.category);
  
    const priceS = req.body.priceS != null ? Number(req.body.priceS) : null;
    const priceM = req.body.priceM != null ? Number(req.body.priceM) : null;
    const priceL = req.body.priceL != null ? Number(req.body.priceL) : null;
    const price = req.body.price != null ? Number(req.body.price) : null;
  
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
  
      // Thêm món vào bảng Menu
      await connection.query(
        'INSERT INTO Menu (MaMon, TenMon) VALUES (?, ?)', [id, name]
      );
  
      if (category === 'Drink') {
        await connection.query(
          'INSERT INTO NuocUong (MaMon) VALUES (?)', [id]
        );
  
        await connection.query(
          'INSERT INTO KichThuocDoUong (MaMon, KichThuoc, Gia) VALUES (?, ?, ?)',
          [id, 'S', priceS]
        );
        await connection.query(
          'INSERT INTO KichThuocDoUong (MaMon, KichThuoc, Gia) VALUES (?, ?, ?)',
          [id, 'M', priceM]
        );
        await connection.query(
          'INSERT INTO KichThuocDoUong (MaMon, KichThuoc, Gia) VALUES (?, ?, ?)',
          [id, 'L', priceL]
        );
      } else if (category === 'Topping') {
        await connection.query(
          'INSERT INTO Topping (MaMon, Gia) VALUES (?, ?)',
          [id, price]
        );
      }
  
      // Nếu có file ảnh được upload
      if (req.file) {
        const imageFile = req.file;
        const ext = path.extname(imageFile.originalname); // Lấy đuôi file .jpg
        const filename = `${id}${ext}`;
        const filepath = path.join(uploadPath, filename);
  
        await fs.promises.writeFile(filepath, imageFile.buffer);
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
    const id = String(req.params.id);
    const name = req.body.name ? String(req.body.name) : '';
    const category = req.body.category ? String(req.body.category) : '';
  
    const priceS = req.body.priceS != null ? Number(req.body.priceS) : null;
    const priceM = req.body.priceM != null ? Number(req.body.priceM) : null;
    const priceL = req.body.priceL != null ? Number(req.body.priceL) : null;
    const price = req.body.price != null ? Number(req.body.price) : null;
  
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
  
      // Cập nhật bảng Menu
      await connection.query(
        'UPDATE Menu SET TenMon = ? WHERE MaMon = ?',
        [name, id]
      );
  
      if (category === 'Drink') {
        // Cập nhật giá theo từng size
        await connection.query(
          'UPDATE KichThuocDoUong SET Gia = ? WHERE MaMon = ? AND KichThuoc = ?',
          [priceS, id, 'S']
        );
        await connection.query(
          'UPDATE KichThuocDoUong SET Gia = ? WHERE MaMon = ? AND KichThuoc = ?',
          [priceM, id, 'M']
        );
        await connection.query(
          'UPDATE KichThuocDoUong SET Gia = ? WHERE MaMon = ? AND KichThuoc = ?',
          [priceL, id, 'L']
        );
      } else if (category === 'Topping') {
        // Cập nhật bảng Topping
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
    const monId = String(id); 
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Xóa từ các bảng : Topping, KichThuocDoUong, NuocUong, Menu
      await connection.query('DELETE FROM KichThuocDoUong WHERE MaMon = ?', [monId]);
      await connection.query('DELETE FROM Topping WHERE MaMon = ?', [monId]);
      await connection.query('DELETE FROM NuocUong WHERE MaMon = ?', [monId]);
      await connection.query('DELETE FROM Menu WHERE MaMon = ?', [monId]);

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
