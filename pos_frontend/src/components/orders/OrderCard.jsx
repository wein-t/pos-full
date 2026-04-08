import React from 'react';
import { FaCheckDouble } from "react-icons/fa";
import { FaCircle } from "react-icons/fa";
import { GrInProgress } from 'react-icons/gr';

// Accept a single 'order' object as a prop
const OrderCard = ({ order }) => {

    // Helper object to determine styles based on status
    const statusStyles = {
        "Pending": { text: "Pending", color: "text-orange-500", bgColor: "bg-orange-900", icon: <FaCircle /> },
        "In Progress": { text: "In Progress", color: "text-yellow-500", bgColor: "bg-yellow-900", icon: <GrInProgress /> },
        "Completed": { text: "Completed", color: "text-green-500", bgColor: "bg-green-900", icon: <FaCheckDouble /> },
    };

    const currentStatus = statusStyles[order.orderStatus] || statusStyles["Pending"];

    // Get the first two initials of the customer's name
    const initials = order.customerDetails.name.split(' ').map(n => n[0]).slice(0, 2).join('');

    return (
        <div className='w-[500px] bg-[#262626] p-4 rounded-lg mb-4'>
            <div className='flex items-center gap-5 '>
               
                <button className='bg-[#f6b100] p-4 text-xl font-bold rounded-lg w-[60px] h-[60px] flex items-center justify-center'>
                    {initials}
                </button>
                <div className='flex items-center justify-between w-[100%]'>
                    <div className='flex flex-col items-start gap-1'>
                        
                        <h1 className='text-[#f5f5f5] text-lg font-semibold tracking-wide'>{order.customerDetails.name}</h1>
                        <p className='text-[#ababab] text-sm'>#{order._id.slice(-6)}</p>
                    </div>
                    <div className='flex flex-col items-end gap-2'>
                       
                        <p className={`${currentStatus.color} ${currentStatus.bgColor} px-2 py-1 rounded-lg flex items-center gap-1`}>
                            {currentStatus.icon} {currentStatus.text}
                        </p>
                        <p className='text-[#ababab] text-sm'>
                            <FaCircle className={`inline mr-2 ${currentStatus.color}`} />
                            {order.orderStatus}
                        </p>
                    </div>
                </div>
            </div>
            <div className='flex justify-between items-center mt-4 text-[#ababab]'>
               
                <p>{new Date(order.createdAt).toLocaleString()}</p>
                <p>{order.items.length} Items</p>
            </div>
            <hr className='w-full mt-4 border-t-1 border-gray-500 ' />
            <div className='flex items-center justify-between mt-4 '>
                <h1 className='text-[#f5f5f5] text-lg font-semibold'>Total</h1>
                
                <p className='text-[#f5f5f5] text-lg font-semibold'>₱{order.bills.total.toFixed(2)}</p>
            </div>
        </div>
    )
}

export default OrderCard;