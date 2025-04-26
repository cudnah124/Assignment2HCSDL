import React, { useContext, useState } from "react";
import '../styles/format.css';
import ING from '../styles/ingredient.module.css';
import { IngredientContext } from "../context/IngredientContext";

function Ingredient() {
    const {
        ingredients,
        purchaseOrders,
        suppliers,
        addIngredient,
        updateIngredient,
        deleteIngredient,  
    } = useContext(IngredientContext);

    const [newIngr, setNewIngr] = useState({ id: '', name: '', price: '', quantity: '', unit: '' });
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingIngr, setEditingIngr] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteIngr, setDeleteIngr] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const handleDetailClick = (order) => setSelectedOrder(order);

    const handleEditClick = (ingr) => setEditingIngr(ingr);
    const handleDeleteClick = (ingr) => {
        setDeleteIngr(ingr);
        setShowDeleteConfirm(true);
    };
    const handleDeleteConfirm = () => {
        if (deleteIngr?.id) deleteIngredient(deleteIngr.id);
        setShowDeleteConfirm(false);
        setDeleteIngr(null);
    };
    const handleEditSave = () => {
        updateIngredient(editingIngr);
        setEditingIngr(null);
    };
    const handleAddSave = () => {
        if (newIngr.id && newIngr.name) {
            addIngredient(newIngr);
            setNewIngr({ id: '', name: '', price: '', quantity: '', unit: '' });
            setShowAddForm(false);
        }
    };

    return (
        <div className="container">
            <div className="header">
                <h2>Ingredient Management</h2>
            </div>

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

            {ingredients.map((ingr) => (
                <div className="ingredient-row" key={ingr.id}>
                    <span>{ingr.id}</span>
                    <span>{ingr.name}</span>
                    <span>{ingr.price.toLocaleString()}</span>
                    <span>{ingr.quantity}</span>
                    <span>{ingr.unit}</span>
                    <span className="action-icons">
                        <img src="/images/icon/edit.png" alt="Edit" onClick={() => handleEditClick(ingr)} />
                        <img src="/images/icon/delete.png" alt="Delete" onClick={() => handleDeleteClick(ingr)} />
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
                        <input value={newIngr.price} onChange={(e) => setNewIngr({ ...newIngr, price: e.target.value })} /><br />
                        <label>Quantity:</label>
                        <input value={newIngr.quantity} onChange={(e) => setNewIngr({ ...newIngr, quantity: e.target.value })} /><br />
                        <label>Unit:</label>
                        <input value={newIngr.unit} onChange={(e) => setNewIngr({ ...newIngr, unit: e.target.value })} /><br />

                        <button onClick={handleAddSave}>Add</button>
                        <button onClick={() => setShowAddForm(false)} style={{ marginLeft: '10px' }}>Cancel</button>
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
                        <input value={editingIngr.name} onChange={(e) => setEditingIngr({ ...editingIngr, name: e.target.value })} /><br />
                        <label>Price:</label>
                        <input value={editingIngr.price} onChange={(e) => setEditingIngr({ ...editingIngr, price: e.target.value })} /><br />
                        <label>Quantity:</label>
                        <input value={editingIngr.quantity} onChange={(e) => setEditingIngr({ ...editingIngr, quantity: e.target.value })} /><br />
                        <label>Unit:</label>
                        <input value={editingIngr.unit} onChange={(e) => setEditingIngr({ ...editingIngr, unit: e.target.value })} /><br />

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

            {/* Purchase Orders and Suppliers Section */}
            <div className={ING.container}>
                <div className={ING.box}>
                    <h2 className={ING.sectionTitle}>PURCHASE ORDER</h2>
                    <div className={ING.tableHeader}>
                        <span>ID</span>
                        <span>Date
                        </span>
                        <span>EmployeeID</span>
                        <span>Supplier</span>
                    </div>
                    {purchaseOrders.map((pur) => (
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
                            </span>
                        </div>
                    ))}

                </div>
                <div className={ING.box}>
                    <h2 className={ING.sectionTitle}>SUPPLIER</h2>
                    <div className={ING.tableHeader2}>
                        <span>ID</span>
                        <span>Name</span>
                        <span>Phone</span>
                        <span>TaxCode</span>
                    </div>
                    {suppliers.map((supp) => (
                        <div className={ING.tableRow2} key={supp.id} >
                            <span>{supp.id}</span>
                            <span>{supp.name}</span>
                            <span>{supp.phone}</span>
                            <span>{supp.taxCode}</span>
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

