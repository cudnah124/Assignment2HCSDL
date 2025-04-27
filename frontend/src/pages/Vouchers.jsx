import React from "react";
import VC from '../styles/voucher.module.css';
import OrderSidebar from "../component/OrderSideBar";
// import voucherData from "../data/voucher.json";
import { useOrder} from "../context/OrderContext";

function Vouchers() {


    const { appliedVoucher, applyVoucher, vouchers } = useOrder();

    
    return (
        <div className={VC.voucherManageContainer}>
            <div className={VC.mainContent}>
                <div className={VC.voucherHeader}>
                    <h2>Vouchers</h2>
                </div>

                <div className={VC.voucherList}>
                    {vouchers.map((voucher) => (
                        <div className={VC.voucherItem} key={voucher.code}>
                            <h3>{voucher.name}</h3>
                            <p>Code: <strong>{voucher.code}</strong></p>
                            <p>Discount: {voucher.discountPercent}%</p>
                            <p>Min Order: {voucher.minOrder.toLocaleString()} VND</p>
                            <p>Max Discount: {voucher.maxDiscount.toLocaleString()} VND</p>
                            <p>Date begin: {voucher.dateBegin}</p>
                            <p>Date end: {voucher.dateEnd}</p>
                            <button className={VC.addBtn}
                                onClick={() => applyVoucher(voucher)}>Apply</button>
                        </div>
                    ))}
                </div>
                {/* Render appliedVoucher info if available */}
                {appliedVoucher && (
                    <div className={VC.appliedVoucher}>
                        <h3>Applied Voucher:</h3>
                        <p>Code: {appliedVoucher.code}</p>
                        <p>Discount: {appliedVoucher.discountPercent}%</p>
                        <p>Min Order: {appliedVoucher.minOrder.toLocaleString()} VND</p>
                        <p>Max Discount: {appliedVoucher.maxDiscount.toLocaleString()} VND</p>
                    </div>
                )}

                {/* Order Sidebar */}
                <OrderSidebar appliedVoucher={appliedVoucher} />
            </div>
        </div>
    );
}

export default Vouchers;
