import React, { createContext, useContext, useState } from 'react';

// Context to manage order data
const OrderContext = createContext();

export const useOrder = () => useContext(OrderContext);



export const OrderProvider = ({ children }) => {
  // State to store list of item & applied voucher
  const [orderItems, setOrderItems] = useState([]);
  const [appliedVoucher, setAppliedVoucher] = useState(null);

  // Them item va voucher
  const addItem = (item) => {
    setOrderItems((prevItems) => {
      // Kiểm tra xem món đã có trong giỏ hàng chưa
      const existingItem = prevItems.find(
        (orderItem) => orderItem.name === item.name && orderItem.size === item.size
      );
      if (existingItem) {
        // Nếu đã có, tăng số lượng
        return prevItems.map((orderItem) =>
          orderItem.name === item.name && orderItem.size === item.size
            ? { ...orderItem, quantity: orderItem.quantity + 1 }
            : orderItem
        );
      } else {
        // Nếu chưa có, thêm mới với số lượng = 1
        return [...prevItems, { ...item, quantity: 1 }];
      }
    });
  };
  
  const removeItem = (itemToRemove) => {
    setOrderItems((prevItems) => 
      prevItems.filter(item => item.name !== itemToRemove.name || item.size !== itemToRemove.size)
    );
  };

  const increaseQuantity = (itemToIncrease) => {
    setOrderItems((prevItems) =>
      prevItems.map((item) =>
        item.name === itemToIncrease.name && item.size === itemToIncrease.size
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseQuantity = (itemToDecrease) => {
    setOrderItems((prevItems) =>
      prevItems.map((item) =>
        item.name === itemToDecrease.name && item.size === itemToDecrease.size
          ? { ...item, quantity: item.quantity > 1 ? item.quantity - 1 : 1 }
          : item
      )
    );
  };
  const applyVoucher = (voucher) => setAppliedVoucher(voucher);

  // Reset order 
  const resetOrder = () => {
    setOrderItems([]);
    setAppliedVoucher(null);
  };

  return (
    <OrderContext.Provider value={{ orderItems, addItem, removeItem, increaseQuantity, decreaseQuantity, resetOrder }}>
      {children}
    </OrderContext.Provider>
  );
}; 