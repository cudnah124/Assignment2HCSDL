const express = require('express');
const router = express.Router();

module.exports = (db) => {

    router.get('/', async (req, res) => {
        const sql = `
        SELECT 
            MaKhuyenMai AS code,
            PhanTramChietKhau AS discountPercent,
            DonToiThieu AS minOrder,
            GiamToiDa AS maxDiscount,
            DATE_FORMAT(NgayBatDau, '%Y-%m-%d') AS dateBegin,
            DATE_FORMAT(NgayKetThuc, '%Y-%m-%d') AS dateEnd,
            SoLanSuDungToiDa AS Times
        FROM 
            KhuyenMai;
        `;
        try {
            const [results] = await db.query(sql);
            res.json(results);
        } catch (err) {
            console.error('Lỗi lấy đơn hàng:', err);
            res.status(500).json({ error: 'Lỗi server' });
        }
    });

    router.post('/', async (req, res) => {
        const { code, discountPercent, minOrder, maxDiscount, dateBegin, dateEnd, times } = req.body;

        const sql = `
        INSERT INTO KhuyenMai
            (MaKhuyenMai, PhanTramChietKhau, DonToiThieu, GiamToiDa, NgayBatDau, NgayKetThuc, SoLanSuDungToiDa)
        VALUES
            (?, ?, ?, ?, ?, ?, ?);
        `;

        try {
            const [result] = await db.query(sql, [code, discountPercent, minOrder, maxDiscount, dateBegin, dateEnd, times]);
            res.status(201).json({ message: 'Khuyến mãi đã được thêm', id: result.insertId });
        } catch (err) {
            console.error('Lỗi thêm khuyến mãi:', err);
            res.status(500).json({ error: 'Lỗi server' });
        }
    });
    router.put('/:code', async (req, res) => {
        const { code } = req.params;
        const { times } = req.body; 
      
        const sql = `
        UPDATE KhuyenMai
        SET SoLanSuDungToiDa = ?
        WHERE MaKhuyenMai = ?;
        `;
      
        try {
          const [result] = await db.query(sql, [times, code]);
          if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Voucher not found' });
          }
          res.json({ message: 'Voucher usage count updated' });
        } catch (err) {
          console.error('Error updating voucher usage:', err);
          res.status(500).json({ error: 'Server error' });
        }
      });

    return router;
}
