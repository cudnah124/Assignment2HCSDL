const express = require('express');
const router = express.Router();

module.exports = (db) => {
    // API GET danh sách đơn hàng
    router.get('/', async (req, res) => {
        const sql = `
        SELECT 
            dh.MaDonHang,
            dh.MaNV,
            dh.TrangThai,
    
            GROUP_CONCAT(DISTINCT 
                CONCAT(m1.TenMon, ' (', gnu.KichThuoc, ') x', gnu.SoLuong)
                SEPARATOR ', '
            ) AS NuocUong,
    
            GROUP_CONCAT(DISTINCT 
                CONCAT(m2.TenMon, ' x', gt.SoLuong)
                SEPARATOR ', '
            ) AS Topping,
    
            CAST(
                IFNULL(SUM(gnu.SoLuong * ktd.Gia), 0) +
                IFNULL(SUM(gt.SoLuong * t.Gia), 0)
                AS DECIMAL(10,2)
            ) AS TongTien,
    
            DATE_FORMAT(dh.NgayGioTao, '%Y-%m-%dT%H:%i:%s') AS NgayGioTao
    
        FROM DonHang dh
        JOIN GomDH_NuocUong gnu ON dh.MaDonHang = gnu.MaDonHang
        LEFT JOIN KichThuocDoUong ktd ON gnu.MaMon = ktd.MaMon AND gnu.KichThuoc = ktd.KichThuoc
        LEFT JOIN Menu m1 ON gnu.MaMon = m1.MaMon
    
        LEFT JOIN GomDH_Topping gt ON dh.MaDonHang = gt.MaDonHang
        LEFT JOIN Topping t ON gt.MaMon = t.MaMon
        LEFT JOIN Menu m2 ON gt.MaMon = m2.MaMon
    
        GROUP BY dh.MaDonHang, dh.MaNV, dh.TrangThai, dh.NgayGioTao
        ORDER BY dh.NgayGioTao DESC;
        `;
    
        try {
            const [results] = await db.query(sql);
            res.json(results.map(row => ({
                ...row,
                TongTien: parseFloat(row.TongTien),  // Ép kiểu số rõ ràng
            })));
        } catch (err) {
            console.error('Lỗi lấy đơn hàng:', err);
            res.status(500).json({ error: 'Lỗi server' });
        }
    });

    // API POST thêm đơn hàng mới
    router.post('/', async (req, res) => {
        const { MaNV, TrangThai, NuocUong, Topping, NgayGioTao } = req.body;

        // Kiểm tra và ép kiểu các trường dữ liệu
        const employeeId = String(MaNV).trim();  // Mã nhân viên cần là string
        const status = String(TrangThai).trim(); // Trạng thái đơn hàng cần là string
        const orderDate = new Date(NgayGioTao);  // Ngày giờ tạo cần là kiểu Date
        if (isNaN(orderDate)) {
            return res.status(400).json({ error: 'Ngày giờ tạo không hợp lệ' });
        }

        // Kiểm tra và ép kiểu các mục trong NuocUong và Topping
        const drinks = NuocUong.map(item => {
            return {
                MaMon: String(item.MaMon).trim(),
                KichThuoc: String(item.KichThuoc).trim(),
                SoLuong: parseInt(item.SoLuong, 10)
            };
        });

        const toppings = Topping.map(item => {
            return {
                MaMon: String(item.MaMon).trim(),
                SoLuong: parseInt(item.SoLuong, 10)
            };
        });

        // Bắt đầu transaction để đảm bảo tính toàn vẹn của dữ liệu
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // Bước 1: Truy vấn mã đơn hàng lớn nhất hiện có
            const [result] = await connection.query('SELECT MAX(MaDonHang) AS maxOrderId FROM DonHang');
            const maxOrderId = result[0].maxOrderId || 0; // Nếu không có đơn hàng nào, maxOrderId = 0
            const newOrderId = maxOrderId + 1; // Tạo mã đơn hàng mới

            // Bước 2: Thêm đơn hàng vào bảng DonHang
            const [insertOrderResult] = await connection.query(
                `INSERT INTO DonHang (MaDonHang, MaNV, TrangThai, NgayGioTao) VALUES (?, ?, ?, ?)`,
                [newOrderId, employeeId, status, orderDate]
            );

            // Bước 3: Thêm nước uống vào bảng GomDH_NuocUong
            for (const nuoc of drinks) {
                const { MaMon, KichThuoc, SoLuong } = nuoc;
                await connection.query(
                    `INSERT INTO GomDH_NuocUong (MaDonHang, MaMon, KichThuoc, SoLuong) VALUES (?, ?, ?, ?)`,
                    [newOrderId, MaMon, KichThuoc, SoLuong]
                );
            }

            // Bước 4: Thêm topping vào bảng GomDH_Topping
            for (const topping of toppings) {
                const { MaMon, SoLuong } = topping;
                await connection.query(
                    `INSERT INTO GomDH_Topping (MaDonHang, MaMon, SoLuong) VALUES (?, ?, ?)`,
                    [newOrderId, MaMon, SoLuong]
                );
            }

            // Commit transaction
            await connection.commit();
            res.status(201).json({ message: 'Đơn hàng đã được thêm thành công!', MaDonHang: newOrderId });
        } catch (err) {
            // Rollback transaction nếu có lỗi
            await connection.rollback();
            console.error('Lỗi thêm đơn hàng:', err);
            res.status(500).json({ error: 'Lỗi server khi thêm đơn hàng' });
        } finally {
            connection.release();
        }
    });

    router.put('/:id', async (req, res) => {
        const orderId = req.params.id;  // Get the order ID from the URL
        const { status } = req.body;    // Get the new status from the request body
    
        // Kiểm tra xem trạng thái có hợp lệ không
        const validStatuses = ['Pending', 'Completed', 'Preparing', 'Cancelled'];  // List of valid statuses
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
        }
    
        // Cập nhật trạng thái đơn hàng trong bảng DonHang
        const sql = `UPDATE DonHang SET TrangThai = ? WHERE MaDonHang = ?`;
    
        try {
            const [result] = await db.query(sql, [status, orderId]);
            
            // Nếu không tìm thấy đơn hàng với ID này
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Đơn hàng không tồn tại' });
            }
    
            res.json({ message: 'Cập nhật trạng thái đơn hàng thành công' });
        } catch (err) {
            console.error('Lỗi cập nhật trạng thái đơn hàng:', err);
            res.status(500).json({ error: 'Lỗi server khi cập nhật trạng thái' });
        }
    });
    router.delete('/:id', async (req, res) => {
        const orderId = req.params.id;  // Lấy ID từ URL
    
        // Kiểm tra đơn hàng có tồn tại trước khi xóa
        const checkOrderSql = 'SELECT 1 FROM DonHang WHERE MaDonHang = ?';
        const [orderCheck] = await db.query(checkOrderSql, [orderId]);
    
        if (orderCheck.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
    
        // Bắt đầu transaction để đảm bảo tính toàn vẹn của dữ liệu
        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();
            
            // Xóa chi tiết nguyên liệu của đơn hàng trước
            await conn.query(`DELETE FROM GomDH_NuocUong WHERE MaDonHang = ?`, [orderId]);
            await conn.query(`DELETE FROM GomDH_Topping WHERE MaDonHang = ?`, [orderId]);
            
            // Xóa đơn hàng chính
            const [result] = await conn.query(`DELETE FROM DonHang WHERE MaDonHang = ?`, [orderId]);
            
            // Nếu không tìm thấy đơn hàng
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Order not found' });
            }
            
            // Commit transaction
            await conn.commit();
            res.status(200).json({ message: 'Order deleted successfully' });
        } catch (err) {
            await conn.rollback();  // Rollback nếu có lỗi
            console.error('Error deleting order:', err);
            res.status(500).json({ error: 'Server error when deleting order' });
        } finally {
            conn.release();
        }
    });

    return router;
};
