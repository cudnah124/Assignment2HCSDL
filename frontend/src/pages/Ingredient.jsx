import React, { useContext, useState, useEffect } from "react";
import '../styles/format.css';
import ING from '../styles/ingredient.module.css';
import { IngredientContext } from "../context/IngredientContext";

function Ingredient() {
    const {
        ingredients,
        purchaseOrders,
        suppliers,
        loading,
        addIngredient,
        addPurchaseOrder,
        addSupplier,
        updateIngredient,
        updatePurchaseOrder,
        deletePurchaseOrder,
        deleteSupplier,
        deleteIngredient,  
    } = useContext(IngredientContext);

    const [newIngr, setNewIngr] = useState({ id: '', name: '', price: '', quantity: '', unit: '',supplier_id: ''});
    const [newSupplier, setNewSupplier] = useState({
        TenNCC: '',         // Supplier Name
        MaSoThue: '',       // Tax Code
        addresses: [{ soNha: '', tenDuong: '', quan: '', thanhPho: '' }],  // Initial empty address object
        phones: [''],        // Initial empty phone number
        emails: ['']          // Array to hold email addresses
    });
    const [newPur, setNewPur] = useState({
        MaNV: '',
        MaNCC: '',
        items: [],
    });
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingIngr, setEditingIngr] = useState(null);
    const [editingPur, setEditingPur] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteIngr, setDeleteIngr] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [actionStatus, setActionStatus] = useState({ message: '', type: '' });
    const [searchDate, setSearchDate] = useState('');
    
    const [deleteSup, setDeleteSup] = useState(null);
    const [showDeleteSupConfirm, setShowDeleteSupConfirm] = useState(false);

    const [deletePur, setDeletePur] = useState(null);
    const [showDeletePurConfirm, setShowDeletePurConfirm] = useState(false);

     

      // Handling purchase order and supplier form visibility
    const [showAddPurchaseOrderForm, setShowAddPurchaseOrderForm] = useState(false);
    const [showAddSupplierForm, setShowAddSupplierForm] = useState(false);

    const handleDeleteSupConfirm = async () => {
        if (deleteSup?.id) {
            const result = await deleteSupplier(deleteSup.id);
            if (result.success) {
                setActionStatus({ message: 'Sup deleted successfully!', type: 'success' });
            } else {
                setActionStatus({ message: `Failed to delete: ${result.error}`, type: 'error' });
            }
        }
        setShowDeleteSupConfirm(false);
        setDeleteSup(null);
    };
    
    const handleDeletePurConfirm = async () => {
        if (deletePur?.id) {
            const result = await deletePurchaseOrder(deletePur.id);
            if (result.success) {
                setActionStatus({ message: 'Sup deleted successfully!', type: 'success' });
            } else {
                setActionStatus({ message: `Failed to delete: ${result.error}`, type: 'error' });
            }
        }
        setShowDeletePurConfirm(false);
        setDeletePur(null);
    };
    const handlePurAddSave = async () => {
        if (!newPur.MaNV || !newPur.MaNCC) {
            setActionStatus({ message: 'Employee ID (MaNV) and Supplier ID (MaNCC) are required!', type: 'error' });
            return;
        }
    
        if (newPur.items.length === 0) {
            setActionStatus({ message: 'At least one item must be added!', type: 'error' });
            return;
        }
    
        try {
            const response = await addPurchaseOrder(newPur);
    
            if (response && response.MaDon) {
                setActionStatus({ message: 'Purchase Order added successfully!', type: 'success' });
                setShowAddPurchaseOrderForm(false);  // Đóng popup
                setNewPur({ MaNV: '', MaNCC: '', items: [] }); // Reset form
                // Nếu bạn có list purchase orders thì nhớ cập nhật list luôn ở đây.
            } else {
                setActionStatus({ message: 'Failed to add Purchase Order.', type: 'error' });
            }
        } catch (error) {
            console.error('Error saving purchase order:', error);
            setActionStatus({ message: 'An error occurred while saving.', type: 'error' });
        }
    };
    const handlePurEditSave = async () => {
        // Convert string values to appropriate types
        const updatedPurchaseOrder = {
            ...editingPur,
            price: parseFloat(editingPur.price),
            quantity: parseInt(editingPur.quantity, 10)
        };

        const result = await updatePurchaseOrder(updatedPurchaseOrder);
        if (result) {
            setActionStatus({ message: 'PurchaseOrder updated successfully!', type: 'success' });
            setEditingPur(null);
        } else {
            setActionStatus({ message: `Failed to update: ${result.error}`, type: 'error' });
        }
    };
    
    const handlePurEditClick = (pur) => { 
        setEditingPur(pur)
    };
    const handleEditClick = (ingr) => setEditingIngr(ingr);


    const handleDeleteClick = (ingr) => {
        setDeleteIngr(ingr);
        setShowDeleteConfirm(true);
    };
    const handleSupDeleteClick = (supp) => {
        setDeleteSup(supp);
        setShowDeleteSupConfirm(true);
    };
    const handlePurDeleteClick = (pur) => {
        setDeletePur(pur);
        setShowDeletePurConfirm(true);
    };

    const handleDeleteConfirm = async () => {
        if (deleteIngr?.id) {
            const result = await deleteIngredient(deleteIngr.id);
            if (result.success) {
                setActionStatus({ message: 'Ingredient deleted successfully!', type: 'success' });
            } else {
                setActionStatus({ message: `Failed to delete: ${result.error}`, type: 'error' });
            }
        }
        setShowDeleteConfirm(false);
        setDeleteIngr(null);
    };

    const handleEditSave = async () => {
        // Convert string values to appropriate types
        const updatedIngredient = {
            ...editingIngr,
            price: parseFloat(editingIngr.price),
            quantity: parseInt(editingIngr.quantity, 10)
        };

        const result = await updateIngredient(updatedIngredient);
        if (result.success) {
            setActionStatus({ message: 'Ingredient updated successfully!', type: 'success' });
            setEditingIngr(null);
        } else {
            setActionStatus({ message: `Failed to update: ${result.error}`, type: 'error' });
        }
    };

    const handleAddSave = async () => {
        if (newIngr.id && newIngr.name) {
            // Convert string values to appropriate types
            const ingredientToAdd = {
                ...newIngr,
                price: parseFloat(newIngr.price),
                quantity: parseInt(newIngr.quantity, 10)
            };

            const result = await addIngredient(ingredientToAdd);
            if (result.success) {
                setActionStatus({ message: 'Ingredient added successfully!', type: 'success' });
                setNewIngr({ id: '', name: '', price: '', quantity: '', unit: '' });
                setShowAddForm(false);
            } else {
                setActionStatus({ message: `Failed to add: ${result.error}`, type: 'error' });
            }
        } else {
            setActionStatus({ message: 'ID and Name are required!', type: 'error' });
        }
    };


    // Add new supplier
    const handleAddSupplierSave = async () => {
        console.log(newSupplier.addresses)
        const result = await addSupplier({
            TenNCC: newSupplier.TenNCC,
            MaSoThue: newSupplier.MaSoThue,
            addresses: newSupplier.addresses,
            phones: newSupplier.phones,
            emails: newSupplier.emails
        });
    
        if (result) {
            setActionStatus({ message: 'Supplier added successfully!', type: 'success' });
            // Reset form fields
            setNewSupplier({
                TenNCC: '',
                MaSoThue: '',
                addresses: [],
                phones: [],
                emails: []
            });
            setShowAddSupplierForm(false);
        } else {
            setActionStatus({ message: `Failed to add Supplier: ${result.error}`, type: 'error' });
        }
    };
    


    // Clear status message after 3 seconds
    useEffect(() => {
        if (actionStatus.message) {
            const timer = setTimeout(() => {
                setActionStatus({ message: '', type: '' });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [actionStatus]);

    if (loading) return <div className="container">Loading ingredients...</div>;
    // if (error) return <div className="container">Error: {error}</div>;


    return (
        <div className="container">
            <div className="header">
                <h2>Ingredient Management</h2>
            </div>

             {/* Status Message */}
             {actionStatus.message && (
                <div className={`status-message ${actionStatus.type}`}>
                    {actionStatus.message}
                </div>
            )}

            <div className="table">
                <div className="ingredient-row header">
                    <span>ID</span>
                    <span>Name</span>
                    <span>Price</span>
                    <span>Quantity</span>
                    <span>Unit</span>
                    <span>Action <button onClick={() => setShowAddForm(true)}>+</button></span>
                </div>
            </div>

            {ingredients
            .sort((a, b) => a.id.localeCompare(b.id)) // Sort ingredients by 'id'
            .map((ingr, index) => (
                <div className="ingredient-row" key={`${ingr.id}-${index}`}>
                <span>{ingr.id}</span>
                <span>{ingr.name}</span>
                <span>{ingr.price.toLocaleString()}</span>
                <span>{ingr.quantity}</span>
                <span>{ingr.unit}</span>
                <span className="action-icons">
                    <img
                    src="/images/icon/edit.png"
                    alt="Edit"
                    onClick={() => handleEditClick(ingr)}
                    />
                    <img
                    src="/images/icon/delete.png"
                    alt="Delete"
                    onClick={() => handleDeleteClick(ingr)}
                    />
                </span>
                </div>
            ))}


            {/* Add Ingredient Form */}
            {showAddForm && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <h3>Add New Ingredient</h3>
                        <label>ID:</label>
                        <input value={newIngr.id} onChange={(e) => setNewIngr({ ...newIngr, id: e.target.value })} /><br />
                        <label>Name:</label>
                        <input value={newIngr.name} onChange={(e) => setNewIngr({ ...newIngr, name: e.target.value })} /><br />
                        <label>Price:</label>
                        <input 
                            type="number" 
                            value={newIngr.price} 
                            onChange={(e) => setNewIngr({ ...newIngr, price: e.target.value })} 
                        /><br />
                        <label>Quantity:</label>
                        <input 
                            type="number" 
                            value={newIngr.quantity} 
                            onChange={(e) => setNewIngr({ ...newIngr, quantity: e.target.value })} 
                        /><br />
                        <label>Unit:</label>
                        <input value={newIngr.unit} onChange={(e) => setNewIngr({ ...newIngr, unit: e.target.value })} /><br />
                        <label>Supplier ID:</label>
                        <input value={newIngr.supplier_id} onChange={(e) => setNewIngr({ ...newIngr, supplier_id: e.target.value })} /><br />

                        <button onClick={handleAddSave}>Add</button>
                        <button onClick={() => setShowAddForm(false)} style={{ marginLeft: '10px' }}>Cancel</button>
                    </div>
                </div>
            )}
            {/* Add Supplier Form */}
            {showAddSupplierForm && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <h3>Add New Supplier</h3>

                        <label>Supplier Name (TenNCC):</label>
                        <input 
                            value={newSupplier.TenNCC} 
                            onChange={(e) => setNewSupplier({ ...newSupplier, TenNCC: e.target.value })} 
                        /><br />

                        <label>Tax Code (MaSoThue):</label>
                        <input 
                            value={newSupplier.MaSoThue} 
                            onChange={(e) => setNewSupplier({ ...newSupplier, MaSoThue: e.target.value })} 
                        /><br />

                        {/* For handling addresses */}
                        <label>Address</label>
                        {newSupplier.addresses.map((address, index) => (
                            <div key={index} style={{ marginBottom: '10px', borderBottom: '1px solid #ccc' }}>
                                <label>Số nhà:</label>
                                <input
                                value={address.soNha}
                                onChange={(e) => {
                                    const updatedAddresses = [...newSupplier.addresses];
                                    updatedAddresses[index].soNha = e.target.value;
                                    setNewSupplier({ ...newSupplier, addresses: updatedAddresses });
                                }}
                                /><br />

                                <label>Tên đường:</label>
                                <input
                                value={address.tenDuong}
                                onChange={(e) => {
                                    const updatedAddresses = [...newSupplier.addresses];
                                    updatedAddresses[index].tenDuong = e.target.value;
                                    setNewSupplier({ ...newSupplier, addresses: updatedAddresses });
                                }}
                                /><br />

                                <label>Quận:</label>
                                <input
                                value={address.quan}
                                onChange={(e) => {
                                    const updatedAddresses = [...newSupplier.addresses];
                                    updatedAddresses[index].quan = e.target.value;
                                    setNewSupplier({ ...newSupplier, addresses: updatedAddresses });
                                }}
                                /><br />

                                <label>Thành phố:</label>
                                <input
                                value={address.thanhPho}
                                onChange={(e) => {
                                    const updatedAddresses = [...newSupplier.addresses];
                                    updatedAddresses[index].thanhPho = e.target.value;
                                    setNewSupplier({ ...newSupplier, addresses: updatedAddresses });
                                }}
                                /><br />
                            </div>
                        ))}

                        {/* For handling phones */}
                        <label>Phones:</label>
                        {newSupplier.phones.map((phone, index) => (
                            <div key={index} style={{ marginBottom: '5px' }}>
                                <input
                                value={phone}
                                onChange={(e) => {
                                    const updatedPhones = [...newSupplier.phones];
                                    updatedPhones[index] = e.target.value;
                                    setNewSupplier({ ...newSupplier, phones: updatedPhones });
                                }}
                                />
                            </div>
                        ))}

                        {/* For handling emails */}
                        <label>Emails:</label>
                        {newSupplier.emails.map((email, index) => (
                            <div key={index} style={{ marginBottom: '5px' }}>
                                <input
                                value={email}
                                onChange={(e) => {
                                    const updatedEmails = [...newSupplier.emails];
                                    updatedEmails[index] = e.target.value;
                                    setNewSupplier({ ...newSupplier, emails: updatedEmails });
                                }}
                                />
                            </div>
                        ))}

                        <button onClick={handleAddSupplierSave}>Add</button>
                        <button
                        onClick={() => {
                            setShowAddSupplierForm(false);
                            setNewSupplier({
                                TenNCC: '',         // Supplier Name
                                MaSoThue: '',       // Tax Code
                                addresses: [{ soNha: '', tenDuong: '', quan: '', thanhPho: '' }],  // Initial empty address object
                                phones: [''],       
                                emails: ['']       
                            });
                        }}
                        style={{ marginLeft: '10px' }}
                        >
                        Cancel
                        </button>
                    </div>
                </div>
            )}


            {/* Edit Ingredient */}
            {editingIngr && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <h3>Edit Ingredient</h3>
                        <label>ID: {editingIngr.id}</label><br />
                        <label>Name:</label>
                        <input 
                            value={editingIngr.name} 
                            onChange={(e) => setEditingIngr({ ...editingIngr, name: e.target.value })} 
                        /><br />
                        <label>Price:</label>
                        <input 
                            type="number" 
                            value={editingIngr.price} 
                            onChange={(e) => setEditingIngr({ ...editingIngr, price: e.target.value })} 
                        /><br />
                        <label>Quantity:</label>
                        <input 
                            type="number" 
                            value={editingIngr.quantity} 
                            onChange={(e) => setEditingIngr({ ...editingIngr, quantity: e.target.value })} 
                        /><br />
                        <label>Unit:</label>
                        <input 
                            value={editingIngr.unit} 
                            onChange={(e) => setEditingIngr({ ...editingIngr, unit: e.target.value })} 
                        /><br />
                        <label>Supplier ID:</label>
                        <input 
                            value={editingIngr.supplier_id} 
                            onChange={(e) => setEditingIngr({ ...editingIngr, supplier_id: e.target.value })} 
                        /><br />

                        <button onClick={handleEditSave}>Save</button>
                        <button onClick={() => setEditingIngr(null)} style={{ marginLeft: '10px' }}>Cancel</button>
                    </div>
                </div>
            )}


            {/* Delete Confirmation */}
            {showDeleteConfirm && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <h3>Confirm Delete</h3>
                        <p>Are you sure you want to delete ingredient <b>{deleteIngr.name}</b>?</p>
                        <button onClick={handleDeleteConfirm}>Yes, Delete</button>
                        <button onClick={() => setShowDeleteConfirm(false)} style={{ marginLeft: '10px' }}>Cancel</button>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {showDeleteSupConfirm && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <h3>Confirm Delete</h3>
                        <p>Are you sure you want to delete suppliers <b>{deleteSup.name}</b>?</p>
                        <button onClick={handleDeleteSupConfirm}>Yes, Delete</button>
                        <button onClick={() => setShowDeleteSupConfirm(false)} style={{ marginLeft: '10px' }}>Cancel</button>
                    </div>
                </div>
            )}

            


            {/* Purchase Orders Section */}
            <div className={ING.container}>
                <div className={ING.box}>
                    <h2 className={ING.sectionTitle}>PURCHASE ORDER</h2>
                    <button onClick={() => setShowAddPurchaseOrderForm(true)}>Add Purchase</button>
                    <div className={ING.tableHeader}>
                        <span>ID</span>
                        <span>Date</span>
                        <span>EmployeeID</span>
                        <span>Supplier</span>
                    </div>
                    <input
                    type="date"
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    />
                    {purchaseOrders.filter(pur => !searchDate || pur.date === searchDate)
                    .sort((b, a) => a.id - b.id).map((pur) => (
                        <div className={ING.tableRow} key={pur.id}>
                            <span>{pur.id}</span>
                            <span>{pur.date}</span>
                            <span>{pur.employeeId}</span>
                            <span>{pur.supplierId}</span>
                            <span className="action-icons">
                                <img
                                src="/images/icon/edit.png"
                                alt="Detail"
                                onClick={() => handlePurEditClick(pur)}
                                />
                                <img
                                src="/images/icon/delete.png"
                                alt="Delete"
                                onClick={() => handlePurDeleteClick(pur)}
                                />
                            </span>
                        </div>
                    ))}
                </div>
                    {showAddPurchaseOrderForm && (
                            <div className="popup-overlay">
                                <div className="popup-content">
                                <h3>Add New Purchase Order</h3>

                                <label>Employee ID (MaNV):</label>
                                <input
                                    value={newPur.MaNV}
                                    onChange={(e) => setNewPur({ ...newPur, MaNV: e.target.value })}
                                /><br />

                                <label>Supplier ID (MaNCC):</label>
                                <input
                                    value={newPur.MaNCC}
                                    onChange={(e) => setNewPur({ ...newPur, MaNCC: e.target.value })}
                                /><br />

                                <h4>Items:</h4>
                                {newPur.items.map((item, index) => (
                                    <div key={index} style={{ marginBottom: '10px', borderBottom: '1px solid #ccc' }}>
                                    <label>Material ID (MaNguyenLieu):</label>
                                    <input
                                        value={item.MaNguyenLieu}
                                        onChange={(e) => {
                                        const updatedItems = [...newPur.items];
                                        updatedItems[index].MaNguyenLieu = e.target.value;
                                        setNewPur({ ...newPur, items: updatedItems });
                                        }}
                                    /><br />

                                    <label>Quantity (SoLuong):</label>
                                    <input
                                        type="number"
                                        value={item.SoLuong}
                                        onChange={(e) => {
                                        const updatedItems = [...newPur.items];
                                        updatedItems[index].SoLuong = e.target.value;
                                        setNewPur({ ...newPur, items: updatedItems });
                                        }}
                                    /><br />

                                    <label>Import Price (GiaNhap):</label>
                                    <input
                                        type="number"
                                        value={item.GiaNhap}
                                        onChange={(e) => {
                                        const updatedItems = [...newPur.items];
                                        updatedItems[index].GiaNhap = e.target.value;
                                        setNewPur({ ...newPur, items: updatedItems });
                                        }}
                                    /><br />
                                    </div>
                                ))}

                                <button
                                    onClick={() => setNewPur({
                                    ...newPur,
                                    items: [...newPur.items, { MaNguyenLieu: '', SoLuong: '', GiaNhap: '' }]
                                    })}
                                >
                                    Add Item
                                </button>
                                <br /><br />
                                <button onClick={handlePurAddSave}>Save Purchase Order</button>
                                <button onClick={() => {
                                    setShowAddPurchaseOrderForm(false);  // Đóng form "Add Purchase Order"
                                    setNewPur({ MaNV: '', MaNCC: '', items: [] });  // Reset dữ liệu trong form
                                }} style={{ marginLeft: '10px' }}>
                                    Cancel
                                </button>
                                </div>
                            </div>
                            )}
                   {editingPur && (
                        <div className="popup-overlay">
                            <div className="popup-content">
                                <h3>Edit Purchase Order</h3>

                                {/* Chỉnh sửa mã nhân viên (MaNV) */}
                                <label>Employee ID (MaNV):</label>
                                <input
                                    value={editingPur.employeeId}
                                    onChange={(e) => setEditingPur({ ...editingPur, employeeId: e.target.value })}
                                /><br />

                                {/* Chỉnh sửa mã nhà cung cấp (MaNCC) */}
                                <label>Supplier ID (MaNCC):</label>
                                <input
                                    value={editingPur.supplierId}
                                    onChange={(e) => setEditingPur({ ...editingPur, supplierId: e.target.value })}
                                /><br />

                                <h4>Items:</h4>
                                {/* Hiển thị danh sách nguyên liệu trong đơn hàng */}
                                {editingPur.products.map((product, index) => (
                                    <div key={index} style={{ marginBottom: '10px', borderBottom: '1px solid #ccc' }}>
                                        {/* Chỉnh sửa mã nguyên liệu (MaNguyenLieu) */}
                                        <label>Material ID (MaNguyenLieu):</label>
                                        <input
                                            value={product.productId}
                                            onChange={(e) => {
                                                const updatedItems = [...editingPur.products];
                                                updatedItems[index].productId = e.target.value;
                                                setEditingPur({ ...editingPur, products: updatedItems });
                                            }}
                                        /><br />

                                        {/* Chỉnh sửa số lượng (SoLuong) */}
                                        <label>Quantity (SoLuong):</label>
                                        <input
                                            type="number"
                                            value={product.quantity}
                                            onChange={(e) => {
                                                const updatedItems = [...editingPur.products];
                                                updatedItems[index].quantity = e.target.value;
                                                setEditingPur({ ...editingPur, products: updatedItems });
                                            }}
                                        /><br />

                                        {/* Chỉnh sửa giá nhập (GiaNhap) */}
                                        <label>Import Price (GiaNhap):</label>
                                        <input
                                            type="number"
                                            value={product.price}
                                            onChange={(e) => {
                                                const updatedItems = [...editingPur.products];
                                                updatedItems[index].price = e.target.value;
                                                setEditingPur({ ...editingPur, products: updatedItems });
                                            }}
                                        /><br />
                                    </div>
                                ))}

                                {/* Button để thêm một item mới */}
                                <button
                                    onClick={() => setEditingPur({
                                        ...editingPur,
                                        items: [...editingPur.products, {productId: '', quantity: '', price: '' }]
                                    })}
                                >
                                    Add Item
                                </button>
                                <br /><br />

                                {/* Button để lưu chỉnh sửa */}
                                <button onClick={handlePurEditSave}>Save Changes</button>

                                {/* Button để hủy và đóng form */}
                                <button onClick={() => {
                                    setEditingPur(null);  // Đóng form "Edit Purchase Order"
                                }} style={{ marginLeft: '10px' }}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                {showDeletePurConfirm && (
                    <div className="popup-overlay">
                        <div className="popup-content">
                            <h3>Confirm Delete</h3>
                            <p>Are you sure you want to delete PurchaseOrder <b>{deletePur.name}</b>?</p>
                            <button onClick={handleDeletePurConfirm}>Yes, Delete</button>
                            <button onClick={() => setShowDeletePurConfirm(false)} style={{ marginLeft: '10px' }}>Cancel</button>
                        </div>
                    </div>
                )}




                {/* Suppliers Section  */}
                <div className={ING.box}>
                    <h2 className={ING.sectionTitle}>SUPPLIER</h2>
                    <button onClick={() => setShowAddSupplierForm(true)}>Add Supplier</button>
                    <div className={ING.tableHeader2}>
                        <span>ID</span>
                        <span>Name</span>
                        <span>Phone</span>
                        <span>TaxCode</span>
                    </div>
                    {suppliers.map((supp, index) => (
                        <div className={ING.tableRow2} key={`${supp.id}-${index}`} >
                            <span>{supp.id}</span>
                            <span>{supp.name}</span>
                            <span>{supp.phone}</span>
                            <span>{supp.taxCode}</span>
                            <span className="action-icons">
                                <img
                                src="/images/icon/delete.png"
                                alt="Delete"
                                onClick={() => handleSupDeleteClick(supp)}
                                />
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {selectedOrder && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <h3>Purchase Order Detail</h3>
                        <p><b>Supplier ID:</b> {selectedOrder.supplierId}</p>
                        <table className={ING.popupTable} >
                            <thead>
                                <tr>
                                    <th>ProductID</th>
                                    <th>Quantity</th>
                                    <th>Price</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedOrder.products.map((product, index) => (
                                    <tr key={index}>
                                        <td>{product.productId}</td>
                                        <td>{product.quantity}</td>
                                        <td>{product.price.toLocaleString()} </td>
                                        <td>{(product.quantity * product.price).toLocaleString()} </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button onClick={() => setSelectedOrder(null)}>Close</button>
                    </div>
                </div>
            )}

        </div>
    );
}

export default Ingredient;

