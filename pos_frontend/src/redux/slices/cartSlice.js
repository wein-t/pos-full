import { createSlice } from "@reduxjs/toolkit";

const initialState = [];

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        

       
        addItems: (state, action) => {
            const newItem = action.payload;
            
            const existingItem = state.find(item => item.name === newItem.name);

            if (existingItem) {
                
                existingItem.quantity += newItem.quantity;
                existingItem.price = existingItem.quantity * existingItem.pricePerQuantity;
            } else {
               
                state.push({ ...newItem, id: newItem.name });
            }
        },

       
        incrementItem: (state, action) => {
            const itemName = action.payload;
            const itemToIncrement = state.find(item => item.name === itemName);

            if (itemToIncrement) {
                itemToIncrement.quantity += 1;
                itemToIncrement.price = itemToIncrement.quantity * itemToIncrement.pricePerQuantity;
            }
        },
        
        

        removeItem: (state, action) => {
            const itemIdToRemove = action.payload;
            return state.filter(item => item.id !== itemIdToRemove);
        },

        clearCart: (state, action) => {
            return initialState;
        }
    }
});

export const getTotalPrice = (state) => state.cart.reduce((total, item) => total + item.price, 0);


export const { addItems, removeItem, clearCart, incrementItem } = cartSlice.actions;
export default cartSlice.reducer;