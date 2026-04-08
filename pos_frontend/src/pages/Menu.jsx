import React, { useState } from 'react';
import BottomNav from '../components/shared/BottomNav';
import BackButton from '../components/shared/BackButton';
import { MdRestaurantMenu } from "react-icons/md";
import MenuContainer from '../components/menu/MenuContainer';
import CustomerInfo from '../components/menu/CustomerInfo'; 
import CartInfo from '../components/menu/CartInfo';
import Bill from '../components/menu/Bill';
import { useSelector } from 'react-redux';
import Modal from '../components/shared/Modal'; 
import { FaUserPlus } from 'react-icons/fa'; 

const Menu = () => {
    const customerData = useSelector((state) => state.customer);
    
    // Default to false. Modal only opens when button is clicked.
    const [isCustomerModalOpen, setCustomerModalOpen] = useState(false);

    return (
        <section className='bg-[#1f1f1f] h-[calc(100vh-5rem)] overflow-hidden flex gap-3 pb-16 relative'>
            
            {/* Left Div (Menu Grid) */}
            <div className='flex-[3]'>
                <div className='flex items-center justify-between px-10 py-4'>
                    <div className='flex items-center gap-4'>
                        <BackButton />
                        <h1 className='text-[#f5f5f5] text-2xl font-bold tracking-wider'>Menu</h1>
                    </div>
                    <div className='flex items-center justify-around gap-4'>
                        <div className='flex items-center gap-3 cursor-pointer'>
                            <MdRestaurantMenu className='text-[#f5f5f5] text-4xl' />
                            <div className='flex flex-col items-start'>
                                <h1 className='text-md text-[#f5f5f5] font tracking-wide'>
                                    {customerData.customerName || "No Customer Selected"}
                                </h1>
                            </div>
                        </div>
                    </div>
                </div>
                <MenuContainer />
            </div>

            {/* Right Div (Sidebar) */}
            <div className='flex-[1] bg-[#1a1a1a] mt-4 mr-3 h-[780px] rounded-lg pt-2 flex flex-col'>
                
                {/* --- SIDEBAR HEADER (With New Button) --- */}
                <div className="px-6 py-4 border-b border-[#2a2a2a]">
                    <div className="flex items-center justify-between">
                        <div className="overflow-hidden mr-2">
                            <p className="text-[#ababab] text-xs font-bold uppercase tracking-wider mb-1">
                                Current Order For
                            </p>
                            <h2 className="text-[#f6b100] text-xl font-bold truncate" title={customerData.customerName}>
                                {customerData.customerName || "..."}
                            </h2>
                            <p className='text-xs text-[#555] font-medium mt-1'>
                                #{customerData.orderId || "---"}
                            </p>
                        </div>

                        {/* NEW CUSTOMER BUTTON */}
                        <button 
                            onClick={() => setCustomerModalOpen(true)}
                            className="bg-[#262626] border border-[#f6b100] text-[#f6b100] hover:bg-[#f6b100] hover:text-[#1a1a1a] p-3 rounded-lg transition-all shadow-lg flex flex-col items-center justify-center gap-1 min-w-[70px]"
                            title="New Order / Change Customer"
                        >
                            <FaUserPlus size={18} />
                            <span className="text-[10px] font-bold">NEW</span>
                        </button>
                    </div>
                </div>
                
                {/* Cart Items Area */}
                <div className="flex-1 overflow-y-auto custom-scroll">
                    <CartInfo />
                </div>
                
                <hr className='border-[#2a2a2a] border-t-2' />
                
                {/* Billing Area */}
                <div className="pb-4">
                    <Bill />
                </div>
            </div>
            
            <BottomNav />

            {/* --- MODAL WITH INPUT FORM --- */}
            <Modal 
                isOpen={isCustomerModalOpen} 
                title="Customer Details"
                onClose={() => setCustomerModalOpen(false)} 
            >
                {/* Pass the close function to the form so it closes after submit */}
                <CustomerInfo onClose={() => setCustomerModalOpen(false)} /> 
            </Modal>

        </section>
    );
};

export default Menu;