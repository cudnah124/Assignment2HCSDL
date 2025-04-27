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
                    const { id, name, description, price, quantity, unit ,supplier_id, supplier_name} = item;
    
                    acc.push({
                        id: id || "",
                        name: name || "",
                        description: description || "",
                        price: typeof price === 'string' ? parseFloat(price) : (price || 0),
                        quantity: typeof quantity === 'string' ? parseInt(quantity) : (quantity || 0),
                        unit: unit || "",
                        supplier_id: supplier_id || "", // Thêm thuộc tính nhà cung cấp
                        supplier_name: supplier_name || ""
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

    

    // Add supplier function
    const addSupplier = async (newSupplier) => {
        try {
            // Make API call using axios
            const response = await axios.post('http://localhost:5000/api/suppliers', {
                MaNCC: newSupplier.MaNCC,
                TenNCC: newSupplier.TenNCC,
                MaSoThue: newSupplier.MaSoThue,
                addresses: newSupplier.addresses,
                phones: newSupplier.phones,
                emails: newSupplier.emails,
            });
            
            console.log("Hehe")
            if (response.data.message) {
                // If supplier is created successfully, update the state
                setSupplier([...suppliers, newSupplier]);
            }
    
            return response.data;
        } catch (error) {
            console.error('Error adding supplier:', error);
            return { success: false, error: error.message };
        }
    };
    const deleteSupplier = async (id) => {
        try {
            // Make the API call to delete the supplier
            const response = await axios.delete(`http://localhost:5000/api/suppliers/${id}`);
            
            // If the supplier was deleted successfully, update the state
            if (response.data.message) {
                setSupplier(prev => prev.filter(supplier => supplier.id !== id));
            }
    
            return { success: true };
        } catch (err) {
            console.error('Error deleting supplier:', err);
            return { success: false, error: err.message };
        }
    };
    const updateSupplier = async (updatedSupplier) => {
        try {
            const response = await axios.put(`http://localhost:5000/api/suppliers/${updatedSupplier.MaNCC}`, updatedSupplier);
            if (response.data.message) {
                setSupplier(prev => prev.map(sup => sup.id === updatedSupplier.MaNCC ? updatedSupplier : sup));
            }
            return response.data;
        } catch (error) {
            console.error('Error updating supplier:', error);
            return { success: false, error: error.message };
        }
    };

    
    const addPurchaseOrder = async (newOrder) => {
        try {
            const response = await axios.post('http://localhost:5000/api/purchase_orders', newOrder);
    
            const { MaDon } = response.data;
    
            // Tạo bản ghi mới để thêm vào state
            const newPurchaseOrder = {
                ...newOrder,
                MaDon: MaDon,
                NgayNhap: new Date().toISOString().split('T')[0], // hoặc lấy từ server nếu server trả về
            };
    
            setPurchaseOrder(prev => [...prev, newPurchaseOrder]);
    
            return response.data;
        } catch (error) {
            console.error('Error creating purchase order:', error.response?.data || error.message);
            throw error; // Nếu muốn bắt lỗi ở nơi gọi hàm
        }
    };

    const deletePurchaseOrder = async (id) => {
        try {

            console.log(id);
            // Make the API call to delete the purchase order
            const response = await axios.delete(`http://localhost:5000/api/purchase_orders/${id}`);
            
            // If the purchase order was deleted successfully, update the state
            if (response.data.message) {
                setPurchaseOrder(prev => prev.filter(order => order.id !== id));
            }
    
            return { success: true };
        } catch (err) {
            console.error('Error deleting purchase order:', err);
            return { success: false, error: err.message };
        }
    };
    // Update purchase order
    const updatePurchaseOrder = async (updatedOrder) => {
        try {
            const response = await axios.put(`http://localhost:5000/api/purchase_orders/${updatedOrder.id}`, updatedOrder);
            
            // Check if the response contains a message
            if (response.data.message) {
                // Successfully updated the order, so update the state
                setPurchaseOrder(prev => prev.map(order => order.id === updatedOrder.id ? updatedOrder : order));
            }

    
            return response.data; // Ensure to return the response data to handle success or failure
        } catch (err) {
            console.error('Error updating purchase order:', err);
            return { success: false, error: err.message }; // Ensure this is returned if there’s an error
        }
    };


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
            addPurchaseOrder,
            addSupplier,
            updateSupplier,
            updateIngredient,
            updatePurchaseOrder,
            deleteSupplier,
            deletePurchaseOrder,
            deleteIngredient,
            sortPurchaseOrdersByDate
        }}>
            {children}
        </IngredientContext.Provider>
    );
};
