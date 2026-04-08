import React from 'react';
import { FaSearch } from "react-icons/fa";
import { Link } from 'react-router-dom';


const RecentOrders = ({ orders, isLoading, searchTerm, setSearchTerm }) => {

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending':
                return 'text-orange-500';
            case 'In Progress':
                return 'text-yellow-500';
            case 'Completed':
                return 'text-green-500';
            default:
                return 'text-gray-400';
        }
    };

    return (
        <>
            {/* Custom Scrollbar Styles */}
            <style jsx>{`
                .scroll-container {
                    position: relative;
                }
                
                .scroll-content {
                    height: 300px;
                    overflow-y: scroll;
                    scrollbar-width: none; /* Firefox */
                    -ms-overflow-style: none; /* IE/Edge */
                }
                
                .scroll-content::-webkit-scrollbar {
                    display: none; /* Chrome, Safari, Edge */
                }
                
                .custom-scrollbar-track {
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 6px;
                    height: 100%;
                    background: transparent;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    z-index: 10;
                    pointer-events: none;
                }
                
                .scroll-container:hover .custom-scrollbar-track {
                    opacity: 1;
                }
                
                .custom-scrollbar-thumb {
                    width: 100%;
                    background: rgba(128, 128, 128, 0.6);
                    border-radius: 3px;
                    transition: background 0.2s ease;
                    position: absolute;
                    top: 0;
                }
                
                .custom-scrollbar-thumb:hover {
                    background: rgba(128, 128, 128, 0.8);
                }
            `}</style>

            <div className='px-8 mt-6'>
                <div className='bg-[#1a1a1a] w-full h-[450px] rounded-lg'>
                    <div className='flex justify-between items-center px-6 py-4'>
                        <h1 className='text-[#f5f5f5] text-lg font-semibold tracking-wide'>Recent Orders</h1>
                        <Link to="/orders" className='text-[#025cca] text-sm font-semibold'>View all</Link>
                    </div>

                    <div className='flex items-center gap-4 bg-[#1f1f1f] rounded-[20px] px-6 py-4 mx-6'>
                        <FaSearch className='text-[#f5f5f5]' />
                        <input
                            type="text"
                            placeholder='Search recent orders by customer...'
                            className='bg-[#1f1f1f] outline-none text-[#f5f5f5] w-full'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className='mt-4 px-6 scroll-container'>
                        <div className='scroll-content'>
                            <div className="flex items-center p-3 text-[#ababab] font-bold border-b border-gray-700">
                                <span className="w-2/5">Customer</span>
                                <span className="w-2/5 text-center">Order ID</span>
                                <span className="w-1/5 text-right">Status</span>
                            </div>

                            {isLoading ? (
                                <p className="text-white text-center mt-4">Loading...</p>
                            ) : (
                                orders.length > 0 ? (
                                    orders.map(order => (
                                        <div key={order._id} className="flex items-center p-3 border-b border-gray-700">
                                            <span className="text-white w-2/5 truncate">{order.customerDetails?.name || 'Walk-in'}</span>
                                            <span className="text-gray-400 w-2/5 text-center">#{order._id.slice(-6)}</span>
                                            <span className={`w-1/5 text-right font-semibold ${getStatusColor(order.orderStatus)}`}>
                                                {order.orderStatus}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-gray-500 mt-10">No matching orders found.</p>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default RecentOrders;