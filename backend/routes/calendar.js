const express = require('express');

module.exports = (db) => {
  const router = express.Router();

  // GET all shifts (ca làm)
  router.get('/', async (req, res) => {
    const sql = `
      SELECT 
        CL.MaCa,
        DATE_FORMAT(CL.NgayLam, '%Y-%m-%d') AS NgayLam,
        CL.GioLam,
        CL.GioTan,
        GROUP_CONCAT(CONCAT(NV.Ho, ' ', NV.Ten) SEPARATOR ', ') AS NhanVienLam
      FROM 
        CaLam CL
      LEFT JOIN NV_Lam NVL ON CL.MaCa = NVL.MaCa
      LEFT JOIN NhanVien NV ON NVL.MaNV = NV.MaNV
      GROUP BY CL.MaCa, CL.NgayLam, CL.GioLam, CL.GioTan
      ORDER BY CL.NgayLam ASC, CL.GioLam ASC
    `;
    try {
      const [results] = await db.query(sql);
      res.json(results);
    } catch (err) {
      console.error('Lỗi lấy ca làm:', err);
      res.status(500).json({ error: 'Lỗi server' });
    }
  });

  // POST add new shift (thêm ca làm mới + phân công nhân viên)
  router.post('/', async (req, res) => {
    const { NgayLam, GioLam, GioTan, MaNVs } = req.body; // MaNVs là array [ 'NV001', 'NV002' ]
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Insert ca làm
      const [result] = await connection.query(
        'INSERT INTO CaLam (NgayLam, GioLam, GioTan) VALUES (?, ?, ?)',
        [NgayLam, GioLam, GioTan]
      );
      const MaCa = result.insertId; // Lấy mã ca tự động

      // Insert phân công nhân viên vào ca
      for (const MaNV of MaNVs) {
        await connection.query(
          'INSERT INTO NV_Lam (MaNV, MaCa) VALUES (?, ?)',
          [MaNV, MaCa]
        );
      }

      await connection.commit();
      res.status(201).json({ message: 'Thêm ca làm thành công' });
    } catch (err) {
      await connection.rollback();
      console.error('Lỗi thêm ca làm:', err);
      res.status(500).json({ error: 'Không thể thêm ca làm' });
    } finally {
      connection.release();
    }
  });

  // PUT update a shift (chỉnh sửa thông tin ca + phân công lại nhân viên)
  router.put('/:id', async (req, res) => {
    const id = req.params.id; // MaCa
    const { NgayLam, GioLam, GioTan, MaNVs } = req.body;
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Update thông tin ca làm
      await connection.query(
        'UPDATE CaLam SET NgayLam = ?, GioLam = ?, GioTan = ? WHERE MaCa = ?',
        [NgayLam, GioLam, GioTan, id]
      );

      // Xóa hết nhân viên cũ
      await connection.query('DELETE FROM NV_Lam WHERE MaCa = ?', [id]);

      // Thêm nhân viên mới
      for (const MaNV of MaNVs) {
        await connection.query(
          'INSERT INTO NV_Lam (MaNV, MaCa) VALUES (?, ?)',
          [MaNV, id]
        );
      }

      await connection.commit();
      res.json({ message: 'Cập nhật ca làm thành công' });
    } catch (err) {
      await connection.rollback();
      console.error('Lỗi cập nhật ca làm:', err);
      res.status(500).json({ error: 'Không thể cập nhật ca làm' });
    } finally {
      connection.release();
    }
  });

  // DELETE remove a shift (xóa ca làm)
  router.delete('/:id', async (req, res) => {
    const id = req.params.id; // MaCa
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      await connection.query('DELETE FROM NV_Lam WHERE MaCa = ?', [id]);
      await connection.query('DELETE FROM CaLam WHERE MaCa = ?', [id]);

      await connection.commit();
      res.json({ message: 'Xóa ca làm thành công' });
    } catch (err) {
      await connection.rollback();
      console.error('Lỗi xóa ca làm:', err);
      res.status(500).json({ error: 'Không thể xóa ca làm' });
    } finally {
      connection.release();
    }
  });

  return router;
};
