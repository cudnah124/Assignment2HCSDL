const express = require('express');

module.exports = (db) => {
    const router = express.Router();

    // Tạo nhà cung cấp mới
    router.post('/', async (req, res) => {
        const { MaNCC, TenNCC, MaSoThue, addresses, phones, emails } = req.body;
        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();

            await conn.query(
                `INSERT INTO NhaCungCap (MaNCC, TenNCC, MaSoThue) VALUES (?, ?, ?)`,
                [MaNCC, TenNCC, MaSoThue]
            );

            if (addresses?.length) {
                for (const addr of addresses) {
                    await conn.query(
                        `INSERT INTO DiaChiNCC (SoNha, Duong, Quan, ThanhPho, MaNCC)
                         VALUES (?, ?, ?, ?, ?)`,
                        [addr.SoNha, addr.Duong, addr.Quan, addr.ThanhPho, MaNCC]
                    );
                }
            }

            if (phones?.length) {
                for (const phone of phones) {
                    await conn.query(
                        `INSERT INTO SDT_NCC (MaNCC, SDT) VALUES (?, ?)`,
                        [MaNCC, phone]
                    );
                }
            }

            if (emails?.length) {
                for (const email of emails) {
                    await conn.query(
                        `INSERT INTO Email_NCC (MaNCC, Email) VALUES (?, ?)`,
                        [MaNCC, email]
                    );
                }
            }

            await conn.commit();
            res.status(201).json({ message: 'Supplier created successfully.' });
        } catch (error) {
            await conn.rollback();
            console.error(error);
            res.status(500).json({ error: 'Error creating supplier.' });
        } finally {
            conn.release();
        }
    });

    // Lấy tất cả nhà cung cấp
    router.get('/', async (req, res) => {
        try {
            const [rows] = await db.query(`
                SELECT 
                ncc.MaNCC AS MaNCC,
                ncc.TenNCC AS TenNCC,
                ncc.MaSoThue AS MaSoThue,
                sdt.SDT AS phone,
                email.Email AS email,
                CONCAT(diachi.SoNha, ' ', diachi.Duong, ', ', diachi.Quan, ', ', diachi.ThanhPho) AS address
            FROM 
                NhaCungCap ncc
            LEFT JOIN 
                SDT_NCC sdt ON ncc.MaNCC = sdt.MaNCC
            LEFT JOIN 
                Email_NCC email ON ncc.MaNCC = email.MaNCC
            LEFT JOIN 
                DiaChiNCC diachi ON ncc.MaNCC = diachi.MaNCC;
            `);
            res.json(rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error fetching suppliers.' });
        }
    });

    // Xóa nhà cung cấp
    router.delete('/:MaNCC', async (req, res) => {
        const { MaNCC } = req.params;
        try {
            await db.query(`DELETE FROM NhaCungCap WHERE MaNCC = ?`, [MaNCC]);
            res.json({ message: 'Supplier deleted successfully.' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error deleting supplier.' });
        }
    });

    return router;
};
