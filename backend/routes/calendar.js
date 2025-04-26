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
      ORDER BY CL.NgayLam ASC, CL.GioLam ASC;
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
    const { NgayLam, GioLam, GioTan, MaNV } = req.body; 
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const [result] = await connection.query(
        'SELECT MaCa FROM CaLam ORDER BY MaCa DESC LIMIT 1'
      );
      let MaCa;
    
    if (result.length === 0) {
      // Nếu chưa có mã ca nào, bắt đầu từ "CA001"
      MaCa = 'CA001';
    } else {
      // Tách phần số của mã ca (ví dụ: "CA005" -> "005")
      const lastMaCa = result[0].MaCa;
      const lastNumber = parseInt(lastMaCa.slice(2), 10);
      const newNumber = lastNumber + 1;

      // Tạo mã ca mới theo định dạng "CAxxx"
      MaCa = `CA${String(newNumber).padStart(3, '0')}`;
    }


    await connection.query(
      'INSERT INTO CaLam (MaCa, NgayLam, GioLam, GioTan) VALUES (?, ?, ?, ?)',
      [MaCa, NgayLam, GioLam, GioTan]
    );

    // Bước 3: Insert phân công nhân viên vào ca
    // MaNV có thể là một mảng, nên cần phải thực hiện insert từng nhân viên vào bảng NV_Lam
    
    await connection.query(
      'INSERT INTO NV_Lam (MaNV, MaCa) VALUES (?, ?)',
      [MaNV, MaCa]
    );
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
    const { NgayLam, GioLam, GioTan, MaNV } = req.body;
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      if (id === undefined) {
        return res.status(400).json({ error: 'Mã ca làm không hợp lệ' });
    }
      // Update thông tin ca làm
      await connection.query(
        'UPDATE CaLam SET NgayLam = ?, GioLam = ?, GioTan = ? WHERE MaCa = ?',
        [NgayLam, GioLam, GioTan, id]
      );

      // Xóa hết nhân viên cũ
      await connection.query('DELETE FROM NV_Lam WHERE MaCa = ?', [id]);

      // Thêm nhân viên mới
        await connection.query(
          'INSERT INTO NV_Lam (MaNV, MaCa) VALUES (?, ?)',
          [MaNV, id]
        );

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
