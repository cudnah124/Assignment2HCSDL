const express = require('express');

module.exports = (db) => {
  const router = express.Router();

  // GET all employees
  router.get('/', async (req, res) => {
    const sql = `
      SELECT 
  NV.MaNV,
  NV.Ho,
  NV.Ten,
  MAX(DN.SoNha) AS SoNha,
  MAX(DN.Duong) AS Duong,
  MAX(DN.Quan) AS Quan,
  MAX(DN.ThanhPho) AS ThanhPho,
  GROUP_CONCAT(DISTINCT SDT.SDT) AS SDT,
  GROUP_CONCAT(DISTINCT Email.Email) AS Email,
  MAX(DATE_FORMAT(CL.NgayLam, '%Y-%m-%d')) AS NgayLam,
  MAX(DATE_FORMAT(CL.GioLam, '%Y-%m-%d')) AS GioLam,
  MAX(DATE_FORMAT(CL.GioTan, '%Y-%m-%d')) AS GioTan
FROM 
  NhanVien NV
LEFT JOIN DiaChiNV DN ON NV.MaNV = DN.MaNV
LEFT JOIN SDT_NhanVien SDT ON NV.MaNV = SDT.MaNV
LEFT JOIN Email_NhanVien Email ON NV.MaNV = Email.MaNV
LEFT JOIN NV_Lam NVL ON NV.MaNV = NVL.MaNV
LEFT JOIN CaLam CL ON NVL.MaCa = CL.MaCa
GROUP BY NV.MaNV;
    `;
    try {
      const [results] = await db.query(sql);
      res.json(results);
    } catch (err) {
      console.error('Lỗi lấy employees:', err);
      res.status(500).json({ error: 'Lỗi server' });
    }
  });

  // POST add new employee
  router.post('/', async (req, res) => {
    const {
      MaNV,
      Ho,
      Ten,
      SoNha,
      Duong,
      Quan,
      ThanhPho,
      SDT,
      Email
    } = req.body;

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      await connection.query(
        'INSERT INTO NhanVien (MaNV, Ho, Ten) VALUES (?, ?, ?)',
        [MaNV, Ho, Ten]
      );
      await connection.query(
        'INSERT INTO DiaChiNV (MaNV, SoNha, Duong, Quan, ThanhPho) VALUES (?, ?, ?, ?, ?)',
        [MaNV, SoNha, Duong, Quan, ThanhPho]
      );
      await connection.query(
        'INSERT INTO SDT_NhanVien (MaNV, SDT) VALUES (?, ?)',
        [MaNV, SDT]
      );
      await connection.query(
        'INSERT INTO Email_NhanVien (MaNV, Email) VALUES (?, ?)',
        [MaNV, Email]
      );

      await connection.commit();
      res.status(201).json({ message: 'Thêm nhân viên thành công' });
    } catch (err) {
      await connection.rollback();
      console.error('Lỗi thêm nhân viên:', err);
      res.status(500).json({ error: 'Không thể thêm nhân viên' });
    } finally {
      connection.release();
    }
  });

    router.put('/:id', async (req, res) => {
        const id = req.params.id;
        const {
        Ho,
        Ten,
        SoNha,
        Duong,
        Quan,
        ThanhPho,
        SDT,
        Email
        } = req.body;
    
        const connection = await db.getConnection();
        try {
        await connection.beginTransaction();
    
        await connection.query(
            'UPDATE NhanVien SET Ho = ?, Ten = ? WHERE MaNV = ?',
            [Ho, Ten, id]
        );
        await connection.query(
            'UPDATE DiaChiNV SET SoNha = ?, Duong = ?, Quan = ?, ThanhPho = ? WHERE MaNV = ?',
            [SoNha, Duong, Quan, ThanhPho, id]
        );
        await connection.query(
            'UPDATE SDT_NhanVien SET SDT = ? WHERE MaNV = ?',
            [SDT, id]
        );
        await connection.query(
            'UPDATE Email_NhanVien SET Email = ? WHERE MaNV = ?',
            [Email, id]
        );
    
        await connection.commit();
        res.json({ message: 'Cập nhật nhân viên thành công' });
        } catch (err) {
        await connection.rollback();
        console.error('Lỗi cập nhật nhân viên:', err);
        res.status(500).json({ error: 'Không thể cập nhật nhân viên' });
        } finally {
        connection.release();
        }
    });

    // DELETE remove employee
    router.delete('/:id', async (req, res) => {
        const id = req.params.id;
        const connection = await db.getConnection();
        try {
        await connection.beginTransaction();
    
        await connection.query('DELETE FROM Email_NhanVien WHERE MaNV = ?', [id]);
        await connection.query('DELETE FROM SDT_NhanVien WHERE MaNV = ?', [id]);
        await connection.query('DELETE FROM DiaChiNV WHERE MaNV = ?', [id]);
        await connection.query('DELETE FROM NV_Lam WHERE MaNV = ?', [id]); // Nếu có ràng buộc trong CaLam
        await connection.query('DELETE FROM NhanVien WHERE MaNV = ?', [id]);
    
        await connection.commit();
        res.json({ message: 'Xóa nhân viên thành công' });
        } catch (err) {
        await connection.rollback();
        console.error('Lỗi xóa nhân viên:', err);
        res.status(500).json({ error: 'Không thể xóa nhân viên' });
        } finally {
        connection.release();
        }
    });
  

  return router;
};
