import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Context to manage order data
const OrderContext = createContext();

export const useOrder = () => useContext(OrderContext);

export const OrderProvider = ({ children }) => {
  // State to store list of item & applied voucher
  const [orderItems, setOrderItems] = useState([]);
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [vouchers, setVouchers] = useState([]);  // Corrected line

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/voucher'); // Adjust the URL as needed
        setVouchers(response.data); // Store the vouchers in state
      } catch (error) {
        console.error('Error fetching vouchers:', error);
      }
    };

    fetchVouchers();
  }, []);

  // Add item to the cart
  const addItem = (item) => {
    setOrderItems((orderItems) => {
      const existingItem = orderItems.find(
        (orderItem) => orderItem.name === item.name && orderItem.size === item.size
      );
      if (existingItem) {
        return orderItems.map((orderItem) =>
          orderItem.name === item.name && orderItem.size === item.size
            ? { ...orderItem, quantity: orderItem.quantity + 1 }
            : orderItem
        );
      } else {
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

  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const getDiscount = () => {
    if (!appliedVoucher || subtotal < appliedVoucher.minOrder) return 0;
    return Math.min(
      (subtotal * appliedVoucher.discountPercent) / 100,
      appliedVoucher.maxDiscount
    );
  };

  const discount = getDiscount();
  const total = subtotal - discount;

  const applyVoucher = async (voucher) => {
    if (appliedVoucher) return false;  // Prevent applying multiple vouchers

    if (subtotal >= voucher.minOrder) {
      // Update the voucher usage count (decrement by 1)
      const updatedVoucher = { ...voucher, Times: voucher.Times - 1 };
      // Update the voucher in the state
      setAppliedVoucher(updatedVoucher);

      try {
        // Send PUT request to backend to update the voucher usage count
        await axios.put(`http://localhost:5000/api/voucher/${voucher.code}`, {
          times: updatedVoucher.Times,
        });
        return true;  // Successfully applied voucher
      } catch (error) {
        console.error('Error updating voucher usage:', error);
        return false;
      }
    }

    return false;
  };


  const resetOrder = () => {
    setOrderItems([]);
    setAppliedVoucher(null);
  };

  return (
    <OrderContext.Provider value={{
      orderItems,
      vouchers,
      appliedVoucher,
      total,
      discount,
      subtotal,
      addItem,
      applyVoucher,
      removeItem,
      increaseQuantity,
      decreaseQuantity,
      resetOrder
    }}>
      {children}
    </OrderContext.Provider>
  );
};
