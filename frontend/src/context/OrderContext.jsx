import React, { createContext, useContext, useState } from 'react';

// Context to manage order data
const OrderContext = createContext();

export const useOrder = () => useContext(OrderContext);



export const OrderProvider = ({ children }) => {
  // State to store list of item & applied voucher
  const [orderItems, setOrderItems] = useState([]);
  const [appliedVoucher, setAppliedVoucher] = useState(null);

  // Them item vao gio hang
  const addItem = (item) => {
    setOrderItems((orderItems) => {
      // Kiểm tra xem món đã có trong giỏ hàng chưa
      const existingItem = orderItems.find(
        (orderItem) => orderItem.name === item.name && orderItem.size === item.size
      );
      if (existingItem) {
        // Nếu đã có, tăng số lượng
        return orderItems.map((orderItem) =>
          orderItem.name === item.name && orderItem.size === item.size
            ? { ...orderItem, quantity: orderItem.quantity + 1 }
            : orderItem
        );
      } else {
        // Nếu chưa có, thêm mới với số lượng = 1
        return [...orderItems, { ...item, quantity: 1 }];
      }
    });
  };

  const removeItem = (itemToRemove) => {
    setOrderItems((orderItems) =>
      orderItems.filter(item => item.name !== itemToRemove.name || item.size !== itemToRemove.size)
    );
  };

  const increaseQuantity = (itemToIncrease) => {
    setOrderItems((orderItems) =>
      orderItems.map((item) =>
        item.name === itemToIncrease.name && item.size === itemToIncrease.size
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseQuantity = (itemToDecrease) => {
    setOrderItems((orderItems) =>
      orderItems.map((item) =>
        item.name === itemToDecrease.name && item.size === itemToDecrease.size
          ? { ...item, quantity: item.quantity > 1 ? item.quantity - 1 : 1 }
          : item
      )
    );
  };

  // Tam tinh 
  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Gia tri chiet khau
  const getDiscount = () => {
    if (!appliedVoucher || subtotal < appliedVoucher.minOrder) return 0;
    return Math.min(
      (subtotal * appliedVoucher.discountPercent) / 100,
      appliedVoucher.maxDiscount
    );
  };

  const discount = getDiscount();
  const total = subtotal - discount;

  // Ap dung voucher
  const applyVoucher = (voucher) => {
    // Kiem tra neu don hang da duoc ap dung voucher
    if (appliedVoucher) return false;

    // Kiem tra dieu kien ap dung
    if (subtotal >= voucher.minOrder) {
      setAppliedVoucher(voucher);
      return true;
    }
    return false; 
  };

  // Reset order 
  const resetOrder = () => {
    setOrderItems([]);
    setAppliedVoucher(null);
  };

  return (
    <OrderContext.Provider value={{ orderItems, appliedVoucher, total, discount, subtotal, addItem, applyVoucher, removeItem, increaseQuantity, decreaseQuantity, resetOrder }}>
      {children}
    </OrderContext.Provider>
  );
}; 