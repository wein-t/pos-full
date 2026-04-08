import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setCustomer } from '../../redux/slices/customerSlice';
import { FaCheck } from 'react-icons/fa';

// Accept onClose as a prop from Menu.jsx
const CustomerInfo = ({ onClose }) => {
    const [name, setName] = useState('');
    const dispatch = useDispatch();

    const handleSubmit = (e) => {
        e.preventDefault();
        const finalName = name.trim() || "Walk-in";
        dispatch(setCustomer({ name: finalName }));
        
        // Close the modal explicitly after saving
        if (onClose) onClose(); 
    };

    return (
        <div className="w-full">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-[#ababab] uppercase mb-2 ml-1">
                        Customer Name
                    </label>
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Juan (or leave blank for Walk-in)"
                        className="w-full bg-[#262626] text-white border border-[#333] rounded-lg px-4 py-3 focus:outline-none focus:border-[#f6b100] focus:ring-1 focus:ring-[#f6b100] transition-all placeholder-gray-600"
                        autoFocus
                    />
                </div>

                <button 
                    type="submit" 
                    className="w-full bg-[#f6b100] text-[#1a1a1a] font-bold py-3 rounded-lg hover:bg-yellow-500 transition-colors shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                    <FaCheck /> Start Order
                </button>
            </form>
        </div>
    );
};

export default CustomerInfo;