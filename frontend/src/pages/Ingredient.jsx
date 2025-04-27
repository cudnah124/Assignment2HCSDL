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
        deletePurchaseOrder,
        deleteSupplier,
        deleteIngredient,  
    } = useContext(IngredientContext);

    const [newIngr, setNewIngr] = useState({ id: '', name: '', price: '', quantity: '', unit: '',supplier_id: ''});
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingIngr, setEditingIngr] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteIngr, setDeleteIngr] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [actionStatus, setActionStatus] = useState({ message: '', type: '' });
    const [searchDate, setSearchDate] = useState('');
    
    const [deleteSup, setDeleteSup] = useState(null);
    const [showDeleteSupConfirm, setShowDeleteSupConfirm] = useState(false);

    const [deletePur, setDeletePur] = useState(null);
    const [showDeletePurConfirm, setShowDeletePurConfirm] = useState(false);

     // For adding a new purchase order and supplier
     const [newPurchaseOrder, setNewPurchaseOrder] = useState({ date: '', employeeId: '', supplierId: '' });
     const [newSupplier, setNewSupplier] = useState({
        TenNCC: '',         // Supplier Name
        MaSoThue: '',       // Tax Code
        addresses: [],      // Array to hold addresses
        phones: [],         // Array to hold phone numbers
        emails: []          // Array to hold email addresses
    });


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


    const handleDetailClick = (order) => {
        setSelectedOrder(order);
    }
    

    const handleEditClick = (ingr) => setEditingIngr(ingr);
    // const handleSupEditClick = (supp) => setEditingSup(supp);
    // const handlePurEditClick = (pur) => setEditingPur(pur);

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

     // Add new purchase order
     const handleAddPurchaseOrderSave = async () => {
        const result = await addPurchaseOrder(newPurchaseOrder); // Add your API call logic
        if (result.success) {
            setActionStatus({ message: 'Purchase Order added successfully!', type: 'success' });
            setNewPurchaseOrder({ date: '', employeeId: '', supplierId: '' });
            setShowAddPurchaseOrderForm(false);
        } else {
            setActionStatus({ message: `Failed to add Purchase Order: ${result.error}`, type: 'error' });
        }
    };

    // Add new supplier
    const handleAddSupplierSave = async () => {
        const result = await addSupplier({
            TenNCC: newSupplier.TenNCC,
            MaSoThue: newSupplier.MaSoThue,
            addresses: newSupplier.addresses,
            phones: newSupplier.phones,
            emails: newSupplier.emails
        });
    
        if (result.success) {
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
            {/* Add Purchase Order Form */}
            {showAddPurchaseOrderForm && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <h3>Add New Purchase Order</h3>
                        <label>Date:</label>
                        <input type="date" value={newPurchaseOrder.date} onChange={(e) => setNewPurchaseOrder({ ...newPurchaseOrder, date: e.target.value })} /><br />
                        <label>Employee ID:</label>
                        <input value={newPurchaseOrder.employeeId} onChange={(e) => setNewPurchaseOrder({ ...newPurchaseOrder, employeeId: e.target.value })} /><br />
                        <label>Supplier ID:</label>
                        <input value={newPurchaseOrder.supplierId} onChange={(e) => setNewPurchaseOrder({ ...newPurchaseOrder, supplierId: e.target.value })} /><br />
                        <button onClick={handleAddPurchaseOrderSave}>Add</button>
                        <button onClick={() => setShowAddPurchaseOrderForm(false)} style={{ marginLeft: '10px' }}>Cancel</button>
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
                        <label>Addresses:</label>
                        <input 
                            value={newSupplier.addresses.join(', ')} 
                            onChange={(e) => setNewSupplier({ 
                                ...newSupplier, 
                                addresses: e.target.value.split(',').map(item => item.trim()) 
                            })} 
                            placeholder="Enter addresses separated by commas" 
                        /><br />

                        {/* For handling phones */}
                        <label>Phones:</label>
                        <input 
                            value={newSupplier.phones.join(', ')} 
                            onChange={(e) => setNewSupplier({ 
                                ...newSupplier, 
                                phones: e.target.value.split(',').map(item => item.trim()) 
                            })} 
                            placeholder="Enter phones separated by commas" 
                        /><br />

                        {/* For handling emails */}
                        <label>Emails:</label>
                        <input 
                            value={newSupplier.emails.join(', ')} 
                            onChange={(e) => setNewSupplier({ 
                                ...newSupplier, 
                                emails: e.target.value.split(',').map(item => item.trim()) 
                            })} 
                            placeholder="Enter emails separated by commas" 
                        /><br />

                        <button onClick={handleAddSupplierSave}>Add</button>
                        <button onClick={() => setShowAddSupplierForm(false)} style={{ marginLeft: '10px' }}>Cancel</button>
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

            {/* Delete Confirmation */}
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


            {/* Purchase Orders and Suppliers Section */}
            <div className={ING.container}>
                <div className={ING.box}>
                    <h2 className={ING.sectionTitle}>PURCHASE ORDER</h2>
                    <button onClick={() => setShowAddPurchaseOrderForm(true)}>Add Purchase</button>
                    <div className={ING.tableHeader}>
                        <span>ID</span>
                        <span>Date
                        </span>
                        <span>EmployeeID</span>
                        <span>Supplier</span>
                    </div>
                    <input
                    type="date"
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    />
                    {purchaseOrders.filter(pur => !searchDate || pur.date === searchDate).map((pur) => (
                        <div className={ING.tableRow} key={pur.id}>
                            <span>{pur.id}</span>
                            <span>{pur.date}</span>
                            <span>{pur.employeeId}</span>
                            <span>{pur.supplierId}</span>
                            <span className="action-icons">
                                <img
                                    src="/images/icon/edit.png"
                                    alt="Detail"
                                    onClick={() => handleDetailClick(pur)}
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
                                {/* <img
                                src="/images/icon/edit.png"
                                alt="Edit"
                                onClick={() => handleEditClick(ingr)}
                                /> */}
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

