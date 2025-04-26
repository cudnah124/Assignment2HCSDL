import React, { useState, useContext } from "react";
import '../styles/drinkManagement.css';
import images from '../data/drink.json';
import { DrinkContext } from "../context/DrinkContext";

function DrinkManage() {

  const { drinks, updateDrinks, addDrinks, deleteDrinks } = useContext(DrinkContext);

  const [selectedCategory, setSelectedCategory] = useState("All");

  const [editingDrk, setEditingDrk] = useState(null);
  const [deleteDrk, setDeleteDrk] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDrk, setNewDrk] = useState({
    id: "",
    name: "",
    category: "Coffee",
    image: "",
    price: { S: 0, M: 0, L: 0 }
  });

  const filteredDrinks = selectedCategory === "All"
    ? drinks
    : drinks.filter((drink) => drink.category === selectedCategory);


  //Handle when click edit or delete button
  const handleEditClick = (drk) => {
    setEditingDrk(drk);
  }
  const handleDeleteClick = (drk) => {
    setDeleteDrk(drk);
    setShowDeleteConfirm(true);
  }

  //Confirm when delete item 
  const handleDeleteConfirm = async () => {
    try {
      await deleteDrinks(deleteDrk.id); // Call delete function with id
      setShowDeleteConfirm(false); // Hide delete confirmation after action
      setDeleteDrk(null); // Reset state after deletion
    } catch (error) {
      console.error("Failed to delete drink:", error);
      alert("There was an error deleting the drink.");
    }
  };

  //Handle save when edit or add item
  const handleEditSave = async () => {
    if (!editingDrk.name || !editingDrk.id) {
      alert("Please provide a valid name and ID for the drink.");
      return;
    }

    try {
      await updateDrinks(editingDrk);
      setEditingDrk(null); // Clear editing state after saving
    } catch (error) {
      console.error("Failed to update drink:", error);
      alert("There was an error updating the drink.");
    }
  };

  const handleAddSave = async () => {
    if (!newDrk.id || !newDrk.name) {
      alert("Please provide both ID and Name for the drink.");
      return;
    }

    console.log("Adding new drink:", newDrk);

    try {
      await addDrinks(newDrk);
      setNewDrk({
        id: "",
        name: "",
        category: selectedCategory,
        image: "",
        price: { S: 0, M: 0, L: 0 }
      });
      setShowAddForm(false); // Hide form after saving
    } catch (error) {
      console.error("Failed to add drink:", error);
      alert("There was an error adding the drink.");
    }
  };

  return (
    <div className="drink-manage-container">
      <div className="main-content">
        <div className="drink-header">
          <h2>Drink Categories</h2>
        </div>

        <div className="category-buttons">
          {["All", "Drink", "Topping"].map((category) => (
            <button
              key={category}
              className={selectedCategory === category ? "active" : ""}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {/*Add button*/}
        <button className="addDrink" onClick={() => setShowAddForm(true)} style={{ marginTop: '20px' }}> + Add Drink</button>

        <div className="drink-list">
          {filteredDrinks
            .sort((a, b) => a.id.localeCompare(b.id))
            .map((drink) => (
              <div className="drink-item" key={drink.id}>
                <img src={images.find((image) => image.name === drink.name)?.image} alt={drink.name} className="drink-img" />
                <span className="drink-name">{drink.name}</span>

                <div className="drink-action-icons">
                  <img src="/images/icon/edit.png" alt="Edit" onClick={() => handleEditClick(drink)} />
                  <img src="/images/icon/delete.png" alt="Delete" onClick={() => handleDeleteClick(drink)} />

                </div>
              </div>
            ))}
        </div>
      </div>

      {/*Add Drink Popup */}
      {showAddForm && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Add New Drink</h3>

            <label>ID: </label>
            <input
              value={newDrk.id}
              onChange={(e) => setNewDrk({ ...newDrk, id: e.target.value })}
            />

            <label>Name: </label>
            <input
              value={newDrk.name}
              onChange={(e) => setNewDrk({ ...newDrk, name: e.target.value })}
            />

            <label>Category: </label>
            <select
              value={newDrk.category}
              onChange={(e) =>
                setNewDrk({
                  ...newDrk,
                  category: e.target.value,
                  price: e.target.value === 'Drink' ? { S: 0, M: 0, L: 0 } : 0
                })
              }
            >
              <option value="">-- Select --</option>
              <option value="Drink">Drink</option>
              <option value="Topping">Topping</option>
            </select>

            <label>Image: </label>
            <input
              value={newDrk.image}
              onChange={(e) => setNewDrk({ ...newDrk, image: e.target.value })}
            />

            {newDrk.category === 'Drink' ? (
              <>
                <label>Price S: </label>
                <input
                  type="number"
                  value={newDrk.price.S}
                  onChange={(e) =>
                    setNewDrk({
                      ...newDrk,
                      price: { ...newDrk.price, S: parseInt(e.target.value) || 0 }
                    })
                  }
                />
                <label>Price M: </label>
                <input
                  type="number"
                  value={newDrk.price.M}
                  onChange={(e) =>
                    setNewDrk({
                      ...newDrk,
                      price: { ...newDrk.price, M: parseInt(e.target.value) || 0 }
                    })
                  }
                />
                <label>Price L: </label>
                <input
                  type="number"
                  value={newDrk.price.L}
                  onChange={(e) =>
                    setNewDrk({
                      ...newDrk,
                      price: { ...newDrk.price, L: parseInt(e.target.value) || 0 }
                    })
                  }
                />
              </>
            ) : newDrk.category === 'Topping' ? (
              <>
                <label>Price: </label>
                <input
                  type="number"
                  value={newDrk.price}
                  onChange={(e) =>
                    setNewDrk({
                      ...newDrk,
                      price: parseInt(e.target.value) || 0
                    })
                  }
                />
              </>
            ) : null}

            <button onClick={handleAddSave}>Add</button>
            <button
              onClick={() => setShowAddForm(false)}
              style={{ marginLeft: '10px' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Edit popup to edit Drink details */}
      {editingDrk && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Edit Drink</h3>
            <label>ID: {editingDrk.id}</label>
            <label>Name:</label>
            <input
              value={editingDrk.name}
              onChange={(e) => setEditingDrk({ ...editingDrk, name: e.target.value })}
            /><br />
            <label>Category:</label>
            <input
              value={editingDrk.category}
              onChange={(e) => setEditingDrk({ ...editingDrk, category: e.target.value })}
            /><br />
            <label>Image URL:</label>
            <input
              value={editingDrk.image}
              onChange={(e) =>
                setEditingDrk({ ...editingDrk, image: e.target.value })
              }
            />
            {/* Hiển thị các giá theo size nếu là Drink */}
            {editingDrk.category === 'Drink' ? (
              <>
                <label>Price S:</label>
                <input
                  type="number"
                  value={editingDrk.price.S}
                  onChange={(e) =>
                    setEditingDrk({
                      ...editingDrk,
                      price: { ...editingDrk.price, S: parseInt(e.target.value) }
                    })
                  }
                />
                <label>Price M:</label>
                <input
                  type="number"
                  value={editingDrk.price.M}
                  onChange={(e) =>
                    setEditingDrk({
                      ...editingDrk,
                      price: { ...editingDrk.price, M: parseInt(e.target.value) }
                    })
                  }
                />
                <label>Price L:</label>
                <input
                  type="number"
                  value={editingDrk.price.L}
                  onChange={(e) =>
                    setEditingDrk({
                      ...editingDrk,
                      price: { ...editingDrk.price, L: parseInt(e.target.value) }
                    })
                  }
                />
              </>
            ) : (
              // Nếu là Topping, chỉ sửa giá một lần
              <>
                <label>Price:</label>
                <input
                  type="number"
                  value={editingDrk.price?.[""] || ""} // Sử dụng giá của size S cho Topping
                  onChange={(e) =>
                    setEditingDrk({
                      ...editingDrk,
                      price: {"":parseInt(e.target.value) }
                    })
                  }
                />
              </>
            )}
            <button onClick={handleEditSave}>Save</button>
            <button onClick={() => setEditingDrk(null)} style={{ marginLeft: '10px' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete drink <b>{deleteDrk.name} </b>?</p>
            <button onClick={handleDeleteConfirm}> Yes, Delete </button>
            <button onClick={() => setShowDeleteConfirm(false)} style={{ marginLeft: '10px' }}>Cancle</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DrinkManage;
