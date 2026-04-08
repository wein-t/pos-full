import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    orderId: "",
    customerName: ''
}

const customerSlice = createSlice({
    name: 'customer',
    initialState,
    reducers: {
        setCustomer: (state, action) => {
            const { name } = action.payload;
            state.orderId = `${Date.now()}`;
            state.customerName = name;
        },

        setCustomerName: (state, action) => {
            state.customerName = action.payload;
        },
        removeCustomer: (state) => {
            state.customerName = ''
        }
    }
})


export const { setCustomer, removeCustomer, setCustomerName } = customerSlice.actions;
export default customerSlice.reducer;