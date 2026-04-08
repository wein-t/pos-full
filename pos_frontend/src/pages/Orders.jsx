import React, { useState } from 'react';
import BottomNav from "../components/shared/BottomNav";
import OrderCard from "../components/orders/OrderCard";
import BackButton from "../components/shared/BackButton";
import ManageOrders from "../components/dashboard/ManageOrders";
import { useQuery } from '@tanstack/react-query';
import { getAllOrders } from '../https';

const Orders = () => {
    const [status, setStatus] = useState("pending");

    const { data: ordersData, isLoading } = useQuery({
        queryKey: ['orders'],
        queryFn: getAllOrders,
    });

    const allOrders = ordersData?.data?.data || [];
    const sortedOrders = [...allOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const filteredOrders = sortedOrders.filter(order => {
        if (status === 'pending') return order.orderStatus === 'Pending';
        if (status === 'progress') return order.orderStatus === 'In Progress';
        if (status === 'completed') return order.orderStatus === 'Completed';
        return true;
    });

    return (
        <section className="bg-[#1f1f1f] h-[calc(100vh-5rem)] overflow-hidden">
            <div className="flex items-center justify-between px-10 py-4 mt-2">
                <div className="flex items-center gap-4">
                    <BackButton />
                    <h1 className="text-[#f5f5f5] text-2xl font-bold tracking-wider">Orders</h1>
                </div>
                <div className="flex items-center justify-around gap-4">

                    <button
                        onClick={() => setStatus("pending")}
                        className={`cursor-pointer text-[#ababab] text-lg rounded-lg px-5 py-2 font-semibold transition-colors duration-200 ${status === "pending" ? "bg-[#383838] text-white" : "hover:bg-[#2a2a2a]"}`}
                    >
                        Pending
                    </button>
                    <button
                        onClick={() => setStatus("progress")}
                        className={`cursor-pointer text-[#ababab] text-lg rounded-lg px-5 py-2 font-semibold transition-colors duration-200 ${status === "progress" ? "bg-[#383838] text-white" : "hover:bg-[#2a2a2a]"}`}
                    >
                        In Progress
                    </button>
                    <button
                        onClick={() => setStatus("completed")}
                        className={`cursor-pointer text-[#ababab] text-lg rounded-lg px-5 py-2 font-semibold transition-colors duration-200 ${status === "completed" ? "bg-[#383838] text-white" : "hover:bg-[#2a2a2a]"}`}
                    >
                        Completed
                    </button>
                    <button
                        onClick={() => setStatus("manage")}
                        className={`cursor-pointer text-[#ababab] text-lg rounded-lg px-5 py-2 font-semibold transition-colors duration-200 ${status === "manage" ? "bg-[#383838] text-white" : "hover:bg-[#2a2a2a]"}`}
                    >
                        Manage Orders
                    </button>
                </div>
            </div>

            {isLoading ? (
                <p className="text-white text-center">Loading orders...</p>
            ) : (
                status === "manage" ? (
                    <div className="px-16 py-4 h-[calc(100vh-5rem-5rem)] overflow-y-scroll scrollbar-hide pb-20">
                        <ManageOrders orders={ordersData?.data?.data} />
                    </div>
                ) : (
                    <div className="flex flex-wrap items-start content-start gap-6 px-16 py-4 overflow-y-scroll scrollbar-hide h-[calc(100vh-5rem-5rem)] pb-20">
                        {filteredOrders.map(order => (
                            <OrderCard key={order._id} order={order} />
                        ))}
                    </div>
                )
            )}

            <BottomNav />
        </section>
    );
};

export default Orders;