import React, { useEffect, useRef } from 'react';
import { FaNotesMedical } from "react-icons/fa6";
import { RiDeleteBin2Fill } from "react-icons/ri";
import { useDispatch, useSelector } from 'react-redux';
import { removeItem, incrementItem } from "../../redux/slices/cartSlice";

const CartInfo = () => {
    const cartData = useSelector(state => state.cart);
    const scrollRef = useRef();
    const dispatch = useDispatch();

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
        }
    }, [cartData]);

    const handleRemove = (itemId) => {
        dispatch(removeItem(itemId));
    };

    const handleIncrement = (itemName) => {
        dispatch(incrementItem(itemName));
    };

    return (
        <div className='px-4 py-2'>
            <h1 className='text-lg text-[#e4e4e4] font-semibold tracking-wide'>Order Details</h1>
            <div className='mt-4 overflow-y-scroll scrollbar-hide h-[380px]' ref={scrollRef}>
                {cartData.length === 0 ? (
                    <p className='text-[#ababab] text-sm flex justify-center items-center h-[380px]'>The cart is empty. Start adding items!</p>
                ) : cartData.map((item) => (
                    <div key={item.id} className='bg-[#1f1f1f] rounded-lg px-4 py-4 mb-2'>
                        <div className='flex items-center justify-between'>
                            <h1 className='text-[#ababab] font-semibold tracing-wide text-md '>{item.name}</h1>
                            <p className='text-[#ababab] font-semibold'>x{item.quantity}</p>
                        </div>
                        <div className='flex items-center justify-between mt-3'>
                            <div className='flex items-center gap-3'>
                                
                                <RiDeleteBin2Fill
                                    onClick={() => handleRemove(item.id)}
                                    className='text-[#ababab] cursor-pointer hover:text-red-500' size={20} />
                                <FaNotesMedical
                                    onClick={() => handleIncrement(item.name)}
                                    className='text-[#ababab] cursor-pointer hover:text-green-500' size={20} />
                            </div>
                            <p className='text-[#f5f5f5] text-md font-bold'>₱{item.price.toFixed(2)}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CartInfo;