const express = require('express');
const router = express.Router();

module.exports = (db) => {
    router.get('./', async (req, res) => {
        const sql=`SELECT 
            dh.MaDonHang,
            dh.MaNV,
            
            -- Danh sách nước uống (tên món + kích thước + số lượng)
            GROUP_CONCAT(DISTINCT 
                CONCAT(m1.TenMon, ' (', gnu.KichThuoc, ') x', gnu.SoLuong)
                SEPARATOR ', '
            ) AS NuocUong,

            -- Danh sách topping (tên + số lượng)
            GROUP_CONCAT(DISTINCT 
                CONCAT(m2.TenMon, ' x', gt.SoLuong)
                SEPARATOR ', '
            ) AS Topping,

            -- Tổng tiền
            IFNULL(SUM(gnu.SoLuong * ktd.Gia), 0) + IFNULL(SUM(gt.SoLuong * t.Gia), 0) AS TongTien,

            dh.NgayGioTao

        FROM DonHang dh
        LEFT JOIN GomDH_NuocUong gnu ON dh.MaDonHang = gnu.MaDonHang
        LEFT JOIN KichThuocDoUong ktd ON gnu.MaMon = ktd.MaMon AND gnu.KichThuoc = ktd.KichThuoc
        JOIN Menu m1 ON gnu.MaMon = m1.MaMon

        LEFT JOIN GomDH_Topping gt ON dh.MaDonHang = gt.MaDonHang
        LEFT JOIN Topping t ON gt.MaMon = t.MaMon
        JOIN Menu m2 ON gt.MaMon = m2.MaMon

        GROUP BY dh.MaDonHang, dh.MaNV, dh.NgayGioTao
        ORDER BY dh.NgayGioTao DESC;
        `
        try {
            const [results] = await db.query(sql);
            res.json(results); // Trả kết quả dưới dạng JSON
          } catch (err) {
            console.error('Lỗi lấy đơn hàng:', err);
            res.status(500).json({ error: 'Lỗi server' });
        }
    })

    
}