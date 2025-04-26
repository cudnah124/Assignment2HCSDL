import React, { createContext, useState, useEffect } from "react";
import axios from "axios"; // ✨ thêm dòng này

// context to manage ingredient data
export const IngredientContext = createContext();

export const IngredientProvider = ({ children }) => {
    const [ingredients, setIngredients] = useState([]);
    const [purchaseOrders, setPurchaseOrder] = useState([]);
    const [suppliers, setSupplier] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchIngredients = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/ingredient');
    
                const groupIngredients = res.data.reduce((acc, item) => {
                    const { id, name, description, price, quantity, unit } = item;
    
                    acc.push({
                        id: id || "",
                        name: name || "",
                        description: description || "",
                        price: typeof price === 'string' ? parseFloat(price) : (price || 0),
                        quantity: typeof quantity === 'string' ? parseInt(quantity) : (quantity || 0),
                        unit: unit || ""
                    });
    
                    return acc;
                }, []);
    
                setIngredients(groupIngredients);
            } catch (err) {
                console.error('Lỗi lấy nguyên liệu:', err);
                setError('Failed to load ingredients');
            } finally {
                setLoading(false);
            }
        };
    
        const fetchSuppliers = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/suppliers');
    
                const groupSuppliers = res.data.reduce((acc, item) => {
                    const { MaNCC, TenNCC, MaSoThue, address, phone, email } = item;
    
                    acc.push({
                        id: MaNCC || "",
                        name: TenNCC || "",
                        taxCode: MaSoThue || "",
                        address: address || "",
                        phone: phone || "",
                        email: email || ""
                    });
    
                    return acc;
                }, []);
    
                setSupplier(groupSuppliers);
            } catch (err) {
                console.error('Lỗi lấy nhà cung cấp:', err);
            }
        };
    
        const fetchPurchaseOrders = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/purchase_orders');
                const orders = res.data; // Mảng các đơn nhập
        
                // Promise.all để gọi tất cả API lấy sản phẩm song song (cho nhanh)
                const purchaseOrdersWithProducts = await Promise.all(
                    orders.map(async (order) => {
                        const { MaDon, NgayNhap, MaNV, MaNCC } = order;
        
                        // Gọi chi tiết sản phẩm của đơn nhập này
                        let products = [];
                        try {
                            const prodRes = await axios.get(`http://localhost:5000/api/purchase_orders/${MaDon}/items`);
                            products = prodRes.data.map(prod => ({
                                productId: prod.MaNguyenLieu || "",
                                productName: prod.TenNguyenLieu || "",
                                quantity: typeof prod.SoLuong === 'string' ? parseInt(prod.SoLuong) : (prod.SoLuong || 0),
                                price: typeof prod.GiaNhap === 'string' ? parseFloat(prod.GiaNhap) : (prod.GiaNhap || 0),
                            }));
                        } catch (err) {
                            console.error(`Lỗi lấy chi tiết cho đơn ${MaDon}:`, err);
                        }
        
                        return {
                            id: MaDon || 0,
                            date: NgayNhap || "",
                            employeeId: MaNV || "",
                            supplierId: MaNCC || "",
                            products: products
                        };
                    })
                );
        
                setPurchaseOrder(purchaseOrdersWithProducts);
            } catch (err) {
                console.error('Lỗi lấy đơn nhập hàng:', err);
            }
        };
    
        fetchIngredients();
        fetchSuppliers();
        fetchPurchaseOrders();
    }, []);

    // Add ingredient 
    const addIngredient = async (newIngredient) => {
        try {
            const { data } = await axios.post('http://localhost:5000/api/ingredient', newIngredient);
            setIngredients((prevIngredients) => [...prevIngredients, data.data || newIngredient]);
            return { success: true };
        } catch (err) {
            console.error('Error adding ingredient:', err);
            return { success: false, error: err.message };
        }
    };

    // Update ingredient info
    const updateIngredient = async (updateIngr) => {
        try {
            await axios.put(`http://localhost:5000/api/ingredient/${updateIngr.id}`, updateIngr);
            setIngredients(prev => prev.map(ingr => ingr.id === updateIngr.id ? updateIngr : ingr));
            return { success: true };
        } catch (err) {
            console.error('Error updating ingredient:', err);
            return { success: false, error: err.message };
        }
    };

    // Delete ingredient
    const deleteIngredient = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/ingredient/${id}`);
            setIngredients(prev => prev.filter(ingr => ingr.id !== id));
            return { success: true };
        } catch (err) {
            console.error('Error deleting ingredient:', err);
            return { success: false, error: err.message };
        }
    };

    // Sort Date of Purchase Order
    const [isDateAsc, setIsDateAsc] = useState(true);

    const sortPurchaseOrdersByDate = () => {
        setPurchaseOrder(prev => {
            const sorted = [...prev].sort((a, b) =>
                isDateAsc
                    ? new Date(a.date) - new Date(b.date)
                    : new Date(b.date) - new Date(a.date)
            );
            return sorted;
        });
        setIsDateAsc(prev => !prev);
    };

    return (
        <IngredientContext.Provider value={{
            ingredients,
            purchaseOrders,
            suppliers,
            loading,
            error,
            addIngredient,
            updateIngredient,
            deleteIngredient,
            sortPurchaseOrdersByDate
        }}>
            {children}
        </IngredientContext.Provider>
    );
};
