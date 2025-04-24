import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const DrinkContext = createContext();

export const DrinkProvider = ({ children }) => {
    const [drinks, setDrinks] = useState([]);

    useEffect(() => {
        const fetchDrinks = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/menu');
                const groupMenuItems = res.data.reduce((acc, item) => {
                    const { id, name, category, size, price } = item;
                  
                    // Chuyển price thành số
                    const priceNumber = typeof price === 'string' ? parseFloat(price) : price;
                
                    if (!acc[id]) {
                      acc[id] = {
                        id,
                        name,
                        category,
                        price: {}
                      };
                    }
                  
                    // Nếu là đồ uống, thêm giá theo size
                    if (category === "Drink" && size) {
                      acc[id].price[size] = priceNumber;
                    }
                  
                    // Nếu là topping, chỉ có một giá duy nhất
                    if (category === "Topping") {
                      acc[id].price = { "": priceNumber };
                    }
                  
                    return acc;
                  }, {});
                
                
                  const filteredDrinks = Object.values(groupMenuItems);
                setDrinks(filteredDrinks);
            } catch (err) {
                console.error('Lỗi lấy đồ uống:', err);
            }
        };
        fetchDrinks();
    }, []);
    

    // Thêm đồ uống
    const addDrinks = async (newDrk) => {
        try {
          const { id, name, category, price } = newDrk;
      
          // Tạo dữ liệu phù hợp để gửi tới backend
          let newDrkForDB = { id, name, category };
      
          if (category === 'Drink') {
            newDrkForDB = {
              ...newDrkForDB,
              priceS: price.S,
              priceM: price.M,
              priceL: price.L,
            };
          } else if (category === 'Topping') {
            newDrkForDB = {
              ...newDrkForDB,
              price,
            };
          }
      
          const res = await axios.post('http://localhost:5000/api/menu', newDrkForDB);
          if (res.status === 201) {
            setDrinks((prev) => [...prev, newDrk]);
          }
        } catch (err) {
          console.error('Lỗi thêm đồ uống:', err);
        }
      };
      

    // Cập nhật đồ uống
    const updateDrinks = async (updatedDrk) => {
        try {
            const { id, name, category, price } = updatedDrk;
    
            // Chuẩn bị object gửi lên backend
            let updatedDrkForDB = { id, name, category };
    
            if (category === 'Drink') {
                updatedDrkForDB = {
                    ...updatedDrkForDB,
                    priceS: price.S,
                    priceM: price.M,
                    priceL: price.L
                };
            } else if (category === 'Topping') {
                // Chỉ gửi 1 giá duy nhất (dùng S)
                updatedDrkForDB = {
                    ...updatedDrkForDB,
                    price: price.S
                };
            }
    
            const res = await axios.put(`http://localhost:5000/api/menu/${id}`, updatedDrkForDB);
    
            if (res.status === 200) {
                setDrinks((prev) =>
                    prev.map((drk) => (drk.id === updatedDrk.id ? updatedDrk : drk))
                );
            }
        } catch (err) {
            console.error('Lỗi cập nhật đồ uống:', err);
        }
    };

    // Xoá đồ uống
    const deleteDrinks = async (id) => {
        try {
            const res = await axios.delete(`http://localhost:5000/api/menu/${id}`);
            if (res.status === 200) {
                setDrinks((prev) => prev.filter((drk) => drk.id !== id));
            }
        } catch (err) {
            console.error('Lỗi xoá đồ uống:', err);
        }
    };

    return (
        <DrinkContext.Provider value={{ drinks, addDrinks, updateDrinks, deleteDrinks }}>
            {children}
        </DrinkContext.Provider>
    );
};
