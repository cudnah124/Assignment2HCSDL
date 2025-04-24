import React, { useState } from "react";
import { FaTrash } from "react-icons/fa" 
import OS from "../styles/orderSideBar.module.css";
import Customer from "./Customer/Customer"
import { useOrder } from "../context/OrderContext";

function OrderSidebar() {

    const { orderItems, appliedVoucher, total, discount, subtotal,
        increaseQuantity, decreaseQuantity, removeItem } = useOrder();
    const [showModal, setShowModal] = useState(false);

    const openModal = () => {
        setShowModal(true);
    };

    // Hàm đóng modal
    const closeModal = () => {
        setShowModal(false);
    };

    const handleCustomerSubmit = (customerData) => {
        console.log("Thông tin khách hàng:", customerData);
        // Bạn có thể gọi API để thanh toán tại đây hoặc xử lý dữ liệu
    };

    return (
        <div className={OS.sidebar}>
            <div className={OS.customerInfo} >
                <span> Customer </span>
            </div>

            <div className={OS.itemList}>
                {orderItems.map((item, index) => (
                    <div key={index} className={OS.item}>
                        <div className={OS.itemInfo}>
                            <span className={OS.name}>{item.name}</span>
                            {item.options && (
                                <ul className={OS.options}>
                                    {item.options.map((opt, i) => (
                                        <li key={i}>+ {opt}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <span className={OS.size}>{item.size}</span>
                        <span className={OS.price}>{(item.price * item.quantity).toLocaleString()} VND</span>
                        <div className={OS.quantityContainer}>
                            <button className={OS.quantityBtn} onClick={() => decreaseQuantity(item)}>-</button>
                            <span className={OS.quantity}>{item.quantity}</span>
                            <button className={OS.quantityBtn} onClick={() => increaseQuantity(item)}>+</button>
                        </div>
                        <button className={OS.removeBtn} onClick={() => removeItem(item)}>
                            <FaTrash />
                        </button>
                    </div>
                ))}
            </div>

            <div className={OS.summary}>
                <div className={OS.row}>
                    <span>Subtotal</span>
                    <span>{subtotal.toLocaleString()} VND</span>
                </div>

                {appliedVoucher && (
                    <div className={OS.row}>
                        <span>Voucher ({appliedVoucher.code})</span>
                        <span>-{discount.toLocaleString()} VND</span>
                    </div>
                )}
                <div className={OS.rowTotal}>
                    <span>Total</span>
                    <span>{total.toLocaleString()} VND</span>
                </div>
            </div>

            <button className={OS.printButton} onClick={openModal}>Print Receipt</button>
            {showModal && (
                <Customer onClose={closeModal} onSubmit={handleCustomerSubmit} total={total} />
            )}
        </div>
    );
}

export default OrderSidebar;
