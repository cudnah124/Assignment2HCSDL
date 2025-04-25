import React, { createContext, useState } from "react";
import ingredientData from "../data/ingredient.json";
import purchaseOrder from "../data/purchaseOrder.json";
import supplier from "../data/supplier.json";

// context to manage ingredient data
export const IngredientContext = createContext();
 
export const IngredientProvider = ({children}) => {

    const [ingredients, setIngredients] = useState(ingredientData);
    const [purchaseOrders, setPurchaseOrder] = useState(purchaseOrder);
    const [suppliers, setSupplier] = useState(supplier);

    // Add ingredient 
    const addIngredient = (newIngredient) => {
        setIngredients((prevIngredients) => [...prevIngredients, newIngredient]);
    };

    //Update ingr info 
    const updateIngredient = (updateIngr) => {
        setIngredients(prev => prev.map(ingr => ingr.id === updateIngr.id ? updateIngr : ingr));
    };

    //Delete ingredient
    const deleteIngredient = (id) => {
        setIngredients(prev => prev.filter(ingr => ingr.id !== id));
    };
     
    //Sort Date of Purchase Order
    const [isDateAsc, setIsDateAsc] = useState(true); // track sort order

    const sortPurchaseOrdersByDate = () => {
        setPurchaseOrder(prev => {
            const sorted = [...prev].sort((a, b) =>
                isDateAsc
                    ? new Date(a.date) - new Date(b.date)  // Ascending
                    : new Date(b.date) - new Date(a.date)  // Descending
            );
            return sorted;
        });
        setIsDateAsc(prev => !prev); // toggle order
    };

    
    return (
        <IngredientContext.Provider value={{
            ingredients,
            purchaseOrders,
            suppliers,
            addIngredient,
            updateIngredient,
            deleteIngredient, 
            sortPurchaseOrdersByDate
        }}>
            {children}
        </IngredientContext.Provider>
    );
}; 