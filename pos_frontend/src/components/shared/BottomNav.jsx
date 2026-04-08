import React, { useState } from 'react';
import { FaHome, FaHistory } from "react-icons/fa"; // Added FaHistory
import { MdOutlineReorder } from "react-icons/md";
import { ImStatsDots } from "react-icons/im";
import { CiCircleMore } from "react-icons/ci";
import { BiSolidDish } from "react-icons/bi";
import { useNavigate, useLocation } from 'react-router-dom';
import Modal from './Modal';
import { useDispatch, useSelector } from 'react-redux';
import { setCustomer } from "../../redux/slices/customerSlice";

const BottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [name, setName] = useState('');
    const userData = useSelector(state => state.user);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
        setIsModalOpen(false);
        setName('');
    }

    const isActive = (path) => location.pathname === path;

    const handleCreateOrder = () => {
        dispatch(setCustomer({ name }));
        navigate("/menu");
    }

    return (
        <div className='fixed bottom-0 left-0 right-0 bg-[#262626] p-2 h-16 flex justify-around'>
            
            {/* HOME TAB */}
            <button
                onClick={() => navigate("/")}
                className={`cursor-pointer flex items-center justify-center font-bold ${isActive("/") ? "text-[#f5f5f5] bg-[#343434]" : "text-[#ababab] hover:text-white"} w-[300px] rounded-[20px] transition-colors`}
            >
                <FaHome className="inline mr-2" size={20} /><p>Home</p>
            </button>

            {/* ORDERS TAB */}
            <button
                onClick={() => navigate("/orders")}
                className={`cursor-pointer flex items-center justify-center font-bold ${isActive("/orders") ? "text-[#f5f5f5] bg-[#343434]" : "text-[#ababab] hover:text-white"} w-[300px] rounded-[20px] transition-colors`}
            >
                <MdOutlineReorder className="inline mr-2" size={20} /><p>Orders</p>
            </button>

            {/* DATA TAB (Admin Only) */}
            {userData?.role === "admin" ? (
                <button
                    onClick={() => navigate("/data")}
                    className={`cursor-pointer flex items-center justify-center font-bold ${isActive("/data") ? "text-[#f5f5f5] bg-[#343434]" : "text-[#ababab] hover:text-white"} w-[300px] rounded-[20px] transition-colors`}
                >
                    <ImStatsDots className="inline mr-2" size={20} /><p>Data</p>
                </button>
            ) : (
                <div className="w-[300px]" />
            )}

            {/* AUDIT LOGS TAB (Admin) OR MORE TAB (User) */}
            {userData?.role === "admin" ? (
                <button
                    onClick={() => navigate("/audit")}
                    className={`cursor-pointer flex items-center justify-center font-bold ${isActive("/audit") ? "text-[#f5f5f5] bg-[#343434]" : "text-[#ababab] hover:text-white"} w-[200px] rounded-[20px] transition-colors`}
                >
                    <FaHistory className="inline mr-2" size={20} /><p>Audit</p>
                </button>
            ) : (
                <button className='cursor-pointer flex items-center justify-center text-[#ababab] hover:text-white w-[200px] transition-colors'>
                    <CiCircleMore className="inline mr-2" size={20} /><p>More</p>
                </button>
            )}

            {/* FLOATING ACTION BUTTON (Create Order) */}
            <button
                disabled={isActive("/data") || isActive("/menu") || isActive("/audit")}
                onClick={openModal}
                className='cursor-pointer absolute bottom-6 bg-[#F6B100] hover:bg-yellow-600 text-[#f5f5f5] rounded-full p-3 items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
                <BiSolidDish size={30} />
            </button>

            <Modal isOpen={isModalOpen} onClose={closeModal} title="Create Order">
                <div>
                    <label className='block text-[#ababab] mb-2 text-sm font-medium'>Customer Name</label>
                    <div className='flex items-center rounded-lg p-3 px-4 bg-[#1f1f1f]'>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            type="text"
                            placeholder='Enter customer name'
                            className='bg-transparent flex-1 text-white focus:outline-none'
                        />
                    </div>
                </div>
                <button
                    onClick={handleCreateOrder}
                    className='cursor-pointer w-full bg-[#F6B100] text-[#f5f5f5] rounded-lg py-3 mt-8 hover:bg-yellow-700'
                >
                    Create Order
                </button>
            </Modal>
        </div>
    );
};

export default BottomNav;