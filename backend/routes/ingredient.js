const express = require('express');
const router = express.Router();

module.exports = (db) => {
    // GET all ingredients
    router.get('/', async (req, res) => {
        try {
            const sql = `
                SELECT 
                    NL.MaNguyenLieu AS id,
                    NL.TenNguyenLieu AS name,
                    NL.MoTa AS description,
                    NL.DonGia AS price,
                    NL.TonKho AS quantity,
                    NL.DonViTinh AS unit,
                    NCC.MaNCC AS supplier_id,
                    NCC.TenNCC AS supplier_name
                FROM 
                    NguyenLieu NL
                JOIN 
                    Dung D ON NL.MaNguyenLieu = D.MaNguyenLieu
                JOIN 
                    NhaCungCap NCC ON D.MaNCC = NCC.MaNCC;
            `;
            
            const [results] = await db.query(sql);
            
            res.status(200).json(results);
        } catch (error) {
            console.error('Error fetching ingredients:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch ingredients',
                error: error.message
            });
        }
    });

    // POST new ingredient
    router.post('/', async (req, res) => {
        try {
            const { id, name, description, price, quantity, unit } = req.body;

            const sql = `
                INSERT INTO NguyenLieu (MaNguyenLieu, TenNguyenLieu, MoTa, DonGia, TonKho, DonViTinh)
                VALUES (?, ?, ?, ?, ?, ?);
            `;
            await db.query(sql, [id, name, description, price, quantity, unit]);

            res.status(201).json({
                success: true,
                message: 'Ingredient added successfully',
                data: {
                    id,
                    name,
                    description,
                    price,
                    quantity,
                    unit
                }
            });
        } catch (error) {
            console.error('Error adding ingredient:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to add ingredient',
                error: error.message
            });
        }
    });

    // PUT update ingredient
    router.put('/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const { name, description, price, quantity, unit } = req.body;

            const sql = `
                UPDATE NguyenLieu
                SET TenNguyenLieu = ?, MoTa = ?, DonGia = ?, TonKho = ?, DonViTinh = ?
                WHERE MaNguyenLieu = ?;
            `;
            await db.query(sql, [name, description, price, quantity, unit, id]);

            res.status(200).json({
                success: true,
                message: 'Ingredient updated successfully'
            });
        } catch (error) {
            console.error('Error updating ingredient:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update ingredient',
                error: error.message
            });
        }
    });

    // DELETE ingredient
    router.delete('/:id', async (req, res) => {
        try {
            const { id } = req.params;

            const sql = `
                DELETE FROM NguyenLieu
                WHERE MaNguyenLieu = ?;
            `;
            await db.query(sql, [id]);

            res.status(200).json({
                success: true,
                message: 'Ingredient deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting ingredient:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete ingredient',
                error: error.message
            });
        }
    });

    return router;
};
