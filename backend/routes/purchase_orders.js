const express = require('express');

module.exports = (db) => {
    const router = express.Router();

    // Tạo đơn nhập hàng mới
    router.post('/', async (req, res) => {
        const { MaNV, MaNCC, items } = req.body;
        const conn = await db.getConnection();
        console.log(req.body)
        try {
            await conn.beginTransaction();

            const [result] = await conn.query(
                `INSERT INTO DonNhapHang (MaNV, MaNCC) VALUES (?, ?)`,
                [MaNV, MaNCC]
            );

            const MaDon = result.insertId; 

            for (const item of items) {
                await conn.query(
                    `INSERT INTO GomDNH_NL (MaDon, MaNguyenLieu, SoLuong, GiaNhap)
                     VALUES (?, ?, ?, ?)`,
                    [MaDon, item.MaNguyenLieu, item.SoLuong, item.GiaNhap]
                );
            }

            await conn.commit();
            res.status(201).json({ message: 'Purchase order created successfully.', MaDon });
        } catch (error) {
            await conn.rollback();
            console.error(error);
            res.status(500).json({ error: 'Error creating purchase order.' });
        } finally {
            conn.release();
        }
    });

    // Lấy tất cả đơn nhập hàng
    router.get('/', async (req, res) => {
        const sql = `
                SELECT dnh.MaDon,  DATE_FORMAT(dnh.NgayNhap, '%Y-%m-%d') AS NgayNhap, dnh.MaNV, dnh.MaNCC, nv.Ten, ncc.TenNCC
                FROM DonNhapHang dnh
                LEFT JOIN NhanVien nv ON dnh.MaNV = nv.MaNV
                LEFT JOIN NhaCungCap ncc ON dnh.MaNCC = ncc.MaNCC
                ORDER BY dnh.NgayNhap DESC
            `;
            try {
                const [results] = await db.query(sql);
                res.json(results); 
              } catch (err) {
                console.error('Lỗi lấy menu:', err);
                res.status(500).json({ error: 'Lỗi server' });
              }
    });

    // Lấy chi tiết nguyên liệu của một đơn nhập
    router.get('/:MaDon/items', async (req, res) => {
        const { MaDon } = req.params;
        try {
            const [rows] = await db.query(`
                SELECT gnl.MaNguyenLieu, nl.TenNguyenLieu, gnl.SoLuong, gnl.GiaNhap
                FROM GomDNH_NL gnl
                JOIN NguyenLieu nl ON gnl.MaNguyenLieu = nl.MaNguyenLieu
                WHERE gnl.MaDon = ?
            `, [MaDon]);
            res.json(rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error fetching purchase order items.' });
        }
    });
    router.delete('/:MaDon', async (req, res) => {
        const { MaDon } = req.params;
        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();
    
            // Xóa chi tiết nguyên liệu của đơn trước (GomDNH_NL)
            await conn.query(`DELETE FROM GomDNH_NL WHERE MaDon = ?`, [MaDon]);
    
            // Sau đó xóa đơn nhập chính (DonNhapHang)
            await conn.query(`DELETE FROM DonNhapHang WHERE MaDon = ?`, [MaDon]);
    
            await conn.commit();
            res.json({ message: 'Purchase order deleted successfully.' });
        } catch (error) {
            await conn.rollback();
            console.error('Error deleting purchase order:', error);
            res.status(500).json({ error: 'Error deleting purchase order.' });
        } finally {
            conn.release();
        }
        
    });
    router.put('/:MaDon', async (req, res) => {
        const { 
            id ,employeeId, supplierId
            , products } = req.body;
        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();
    
            // Cập nhật đơn nhập hàng chính
            await conn.query(
                `UPDATE DonNhapHang SET MaNV = ?, MaNCC = ? WHERE MaDon = ?`,
                [employeeId, supplierId, id]
            );
    
            // Xóa các chi tiết nguyên liệu cũ của đơn nhập hàng này trước
            await conn.query(`DELETE FROM GomDNH_NL WHERE MaDon = ?`, [id]);
    
            // Thêm các chi tiết nguyên liệu mới vào (hoặc cập nhật)
            for (const product of products) {
                await conn.query(
                    `INSERT INTO GomDNH_NL (MaDon, MaNguyenLieu, SoLuong, GiaNhap)
                     VALUES (?, ?, ?, ?)`,
                    [id, product.productId, product.quantity, product.price]
                );
            }

            await conn.commit();
            res.status(200).json({ message: 'Purchase order updated successfully.' });
        } catch (error) {
            await conn.rollback();
            console.error(error);
            res.status(500).json({ error: 'Error updating purchase order.' });
        } finally {
            conn.release();
        }
    });

    return router;
};
