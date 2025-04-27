import React, { useState, useContext } from "react";
import MN from '../styles/menu.module.css';
import images from '../data/drink.json'; 
import backgroundImage from './background.png';
import OrderSidebar from "../component/OrderSideBar";
import { useOrder } from "../context/OrderContext"; /*use shared data*/
import { DrinkContext } from "../context/DrinkContext";

function Menu() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [popupDrink, setPopupDrink] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const { addItem } = useOrder();
  const [searchTerm, setSearchTerm] = useState("");
  const { drinks: menuItems } = useContext(DrinkContext); // Lấy drinks từ DrinkContext

  const addToOrder = () => {
    if (!popupDrink) return;
    
    // Nếu là Drink thì bắt buộc phải chọn size
    if (popupDrink.category === "Drink" && selectedSize === null) return;
  
    const selectedDrink = menuItems.find(item => item.id === popupDrink.id);
    if (!selectedDrink) return;
  
    const priceObj = selectedDrink.price;
  
    const newItem = {
      id: selectedDrink.id,               // MaMon
      name: selectedDrink.name,
      category: selectedDrink.category,  // "Drink" hoặc "Topping"
      size: selectedDrink.category === "Drink" ? selectedSize : null, // 👈 null nếu là Topping
      price: priceObj[selectedSize] || priceObj[""], // Giá theo size hoặc mặc định
      quantity: 1
    };
  
    addItem(newItem);
  
    setPopupDrink(null);
    setSelectedSize(null);
  };
  

  const filteredDrinks = menuItems.filter((drink) => {
    if (selectedCategory !== "All" && drink.category !== selectedCategory) {
      return false;
    }

    if (searchTerm && !drink.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    return true;
  });

  return (
    <div className={MN.drinkManageContainer}  style={{ backgroundImage: `url(${backgroundImage})` }} > 
      <div className={MN.mainContent}  >
        <div className={MN.drinkHeader} >
          <h2>Menu</h2>
        </div>

        {/* Tìm kiếm món */}
        <div className={MN.searchbar}>
          <input
            type="text"
            placeholder="Tìm món..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="MN.search-icon">🔍</span>
        </div>

        <div className={MN.categoryButtons}>
          {["All", "Drink", "Topping"].map((category) => (
            <button
              key={category}
              className={selectedCategory === category ? MN.active : "All"}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className={MN.drinkList}>
          {filteredDrinks.map((drink) => {
            return (
              <div className={MN.drinkItem} key={drink.id}>
                {/* Sử dụng ảnh từ drinkImage nếu có, nếu không thì dùng ảnh mặc định */}
                <img
                  src={`/images/drinks/${drink.id}.jpg`}
                  alt={drink.name}
                  className={MN.drinkImg}
                />
                <span className={MN.drinkName}>{drink.name}</span>
                <button
                  className={MN.addBtn}
                  onClick={() => {
                    setPopupDrink(drink);
                    setSelectedSize(null);
                  }}
                >
                  +
                </button>
              </div>
            );
          })}
        </div>

        {/* Overlay the screen, only show popup */}
        {popupDrink && (
          <div className={MN.popupOverlay} onClick={() => setPopupDrink(null)}>
            <div className={MN.popupContent} onClick={(e) => e.stopPropagation()}>
              <img
                src={images.find((image) => image.name === popupDrink.name)?.image}
                alt={popupDrink.name}
                className={MN.popupImg}
              />
              <div className={MN.popupDetails}>
                <h3>{popupDrink.name}</h3>
                <table className={MN.sizeTable}>
                  <thead>
                    <tr>
                      <th> Size</th>
                      <th> Price (VND) </th>
                      <th> Choose</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Render size and price */}
                    {Object.entries(popupDrink.price).map(([size, price], index) => (
                      <tr key={index}>
                        <td>{size}</td>
                        <td>{price.toLocaleString()}</td>
                        <td>
                          <input
                            type="radio"
                            name="size"
                            checked={selectedSize === size}
                            onChange={() => setSelectedSize(size)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  onClick={addToOrder}
                  disabled={selectedSize === null}
                  className={MN.confirmBtn}
                >
                  Add to Order
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Order Sidebar */}
        <OrderSidebar />
      </div>
    </div>
  );
}

export default Menu;
