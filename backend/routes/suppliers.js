const express = require('express');

module.exports = (db) => {
    const router = express.Router();

    // Tạo nhà cung cấp mới
    router.post('/', async (req, res) => {
        const { TenNCC, MaSoThue, addresses, phones, emails } = req.body;
        const conn = await db.getConnection();
    
        try {
            await conn.beginTransaction();
    
            // Step 1: Get the current highest MaNCC
            const [rows] = await conn.query('SELECT MAX(MaNCC) AS highestMaNCC FROM NhaCungCap');
            let newMaNCC = 'NC0001'; // Default if no suppliers exist
    
            if (rows[0].highestMaNCC) {
                // Extract the numeric part of the current highest MaNCC
                const currentMax = rows[0].highestMaNCC;
                const numericPart = parseInt(currentMax.slice(2)); // Remove 'NC' and get the number
                newMaNCC = `NC${(numericPart + 1).toString().padStart(4, '0')}`; // Increment and format as 'NC0002'
            }
    
            // Step 2: Insert the supplier with the new MaNCC
            await conn.query(
                `INSERT INTO NhaCungCap (MaNCC, TenNCC, MaSoThue) VALUES (?, ?, ?)`,
                [newMaNCC, TenNCC, MaSoThue]
            );
    
            // Step 3: Insert addresses, phones, and emails
            if (addresses?.length) {
                for (const addr of addresses) {
                    await conn.query(
                        `INSERT INTO DiaChiNCC (SoNha, Duong, Quan, ThanhPho, MaNCC) VALUES (?, ?, ?, ?, ?)`,
                        [addr.SoNha, addr.Duong, addr.Quan, addr.ThanhPho, newMaNCC]
                    );
                }
            }
    
            if (phones?.length) {
                for (const phone of phones) {
                    await conn.query(
                        `INSERT INTO SDT_NCC (MaNCC, SDT) VALUES (?, ?)`,
                        [newMaNCC, phone]
                    );
                }
            }
    
            if (emails?.length) {
                for (const email of emails) {
                    await conn.query(
                        `INSERT INTO Email_NCC (MaNCC, Email) VALUES (?, ?)`,
                        [newMaNCC, email]
                    );
                }
            }
    
            // Commit the transaction
            await conn.commit();
            res.status(201).json({ message: 'Supplier created successfully.', MaNCC: newMaNCC });
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
        const conn = await db.getConnection();

        try {
            await conn.beginTransaction();

            // Step 1: Delete related data (addresses, phones, emails)
            await conn.query(`DELETE FROM DiaChiNCC WHERE MaNCC = ?`, [MaNCC]);
            await conn.query(`DELETE FROM SDT_NCC WHERE MaNCC = ?`, [MaNCC]);
            await conn.query(`DELETE FROM Email_NCC WHERE MaNCC = ?`, [MaNCC]);

            // Step 2: Delete the supplier
            await conn.query(`DELETE FROM NhaCungCap WHERE MaNCC = ?`, [MaNCC]);

            // Commit the transaction
            await conn.commit();
            res.json({ message: 'Supplier deleted successfully.' });
        } catch (error) {
            await conn.rollback();
            console.error(error);
            res.status(500).json({ error: 'Error deleting supplier.' });
        } finally {
            conn.release();
        }
    });

    router.put('/:MaNCC', async (req, res) => {
        const { MaNCC } = req.params;
        const { TenNCC, MaSoThue, addresses, phones, emails } = req.body;
        const conn = await db.getConnection();

        try {
            await conn.beginTransaction();

            // Step 1: Update the supplier's main details
            await conn.query(
                `UPDATE NhaCungCap SET TenNCC = ?, MaSoThue = ? WHERE MaNCC = ?`,
                [TenNCC, MaSoThue, MaNCC]
            );

            // Step 2: Update addresses
            if (addresses) {
                // Delete existing addresses before inserting new ones
                await conn.query(`DELETE FROM DiaChiNCC WHERE MaNCC = ?`, [MaNCC]);

                // Insert new addresses
                for (const addr of addresses) {
                    await conn.query(
                        `INSERT INTO DiaChiNCC (SoNha, Duong, Quan, ThanhPho, MaNCC) VALUES (?, ?, ?, ?, ?)`,
                        [addr.SoNha, addr.Duong, addr.Quan, addr.ThanhPho, MaNCC]
                    );
                }
            }

            // Step 3: Update phones
            if (phones) {
                // Delete existing phones before inserting new ones
                await conn.query(`DELETE FROM SDT_NCC WHERE MaNCC = ?`, [MaNCC]);

                // Insert new phones
                for (const phone of phones) {
                    await conn.query(
                        `INSERT INTO SDT_NCC (MaNCC, SDT) VALUES (?, ?)`,
                        [MaNCC, phone]
                    );
                }
            }

            // Step 4: Update emails
            if (emails) {
                // Delete existing emails before inserting new ones
                await conn.query(`DELETE FROM Email_NCC WHERE MaNCC = ?`, [MaNCC]);

                // Insert new emails
                for (const email of emails) {
                    await conn.query(
                        `INSERT INTO Email_NCC (MaNCC, Email) VALUES (?, ?)`,
                        [MaNCC, email]
                    );
                }
            }

            // Commit the transaction
            await conn.commit();
            res.json({ message: 'Supplier updated successfully.' });
        } catch (error) {
            await conn.rollback();
            console.error(error);
            res.status(500).json({ error: 'Error updating supplier.' });
        } finally {
            conn.release();
        }
    });


    return router;
};
