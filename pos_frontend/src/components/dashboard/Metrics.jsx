import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "../../https";
import { FaUsers, FaUtensils, FaClipboardList, FaMoneyBillWave, FaClock } from "react-icons/fa";
import { MdFastfood } from "react-icons/md";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const Metrics = () => {
    // Fetch Real-time Data
    const { data: statsData, isLoading } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: getDashboardStats,
        refetchInterval: 30000 // Auto-refresh every 30 seconds
    });

    if (isLoading) return <div className="text-white p-4">Loading Dashboard...</div>;

    const stats = statsData?.data?.data || {
        users: 0,
        menu: { categories: 0, dishes: 0 },
        orders: { today: 0, pending: 0, inProgress: 0 },
        revenue: { today: 0 },
        recentOrders: []
    };

    // Data for the mini chart
    const orderStatusData = [
        { name: 'Pending', count: stats.orders.pending, color: '#f59e0b' }, // Orange
        { name: 'Cooking', count: stats.orders.inProgress, color: '#3b82f6' }, // Blue
        { name: 'Today', count: stats.orders.today, color: '#10b981' }, // Green
    ];

    return (
        <div className="h-full overflow-y-auto pb-20 custom-scroll">
            
            {/* --- TOP ROW: KEY STAT CARDS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                
                {/* Revenue Card */}
                <div className="bg-[#262626] p-5 rounded-xl shadow-lg border border-[#333] flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-sm font-medium">Revenue Today</p>
                        <h2 className="text-[#f6b100] text-3xl font-bold mt-1">
                            ₱{stats.revenue.today.toLocaleString()}
                        </h2>
                    </div>
                    <div className="bg-[#f6b100]/20 p-3 rounded-lg text-[#f6b100]">
                        <FaMoneyBillWave size={24} />
                    </div>
                </div>

                {/* Orders Card */}
                <div className="bg-[#262626] p-5 rounded-xl shadow-lg border border-[#333] flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-sm font-medium">Orders Today</p>
                        <h2 className="text-blue-400 text-3xl font-bold mt-1">
                            {stats.orders.today}
                        </h2>
                    </div>
                    <div className="bg-blue-500/20 p-3 rounded-lg text-blue-400">
                        <FaClipboardList size={24} />
                    </div>
                </div>

                {/* Staff Card */}
                <div className="bg-[#262626] p-5 rounded-xl shadow-lg border border-[#333] flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-sm font-medium">Total Staff</p>
                        <h2 className="text-purple-400 text-3xl font-bold mt-1">
                            {stats.users}
                        </h2>
                    </div>
                    <div className="bg-purple-500/20 p-3 rounded-lg text-purple-400">
                        <FaUsers size={24} />
                    </div>
                </div>

                {/* Menu Items Card */}
                <div className="bg-[#262626] p-5 rounded-xl shadow-lg border border-[#333] flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-sm font-medium">Total Dishes</p>
                        <h2 className="text-green-400 text-3xl font-bold mt-1">
                            {stats.menu.dishes}
                        </h2>
                        <p className="text-xs text-gray-500 mt-1">in {stats.menu.categories} Categories</p>
                    </div>
                    <div className="bg-green-500/20 p-3 rounded-lg text-green-400">
                        <MdFastfood size={24} />
                    </div>
                </div>
            </div>

            {/* --- MIDDLE SECTION: CHART & RECENT ORDERS --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Live Kitchen Status (Chart) */}
                <div className="bg-[#262626] p-6 rounded-xl shadow-lg border border-[#333]">
                    <h3 className="text-[#f5f5f5] text-lg font-bold mb-4 flex items-center gap-2">
                        <FaUtensils className="text-gray-400"/> Live Kitchen Status
                    </h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={orderStatusData} layout="vertical" margin={{ left: 10 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={80} stroke="#9ca3af" fontSize={12} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1f1f1f', border: 'none', borderRadius: '8px' }}
                                    cursor={{fill: 'transparent'}}
                                />
                                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={30}>
                                    {orderStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 flex justify-between text-xs text-gray-400 border-t border-[#444] pt-4">
                        <div className="text-center">
                            <p className="text-orange-400 font-bold text-lg">{stats.orders.pending}</p>
                            <p>Pending</p>
                        </div>
                        <div className="text-center">
                            <p className="text-blue-400 font-bold text-lg">{stats.orders.inProgress}</p>
                            <p>Cooking</p>
                        </div>
                        <div className="text-center">
                            <p className="text-green-400 font-bold text-lg">{stats.orders.today}</p>
                            <p>Total Today</p>
                        </div>
                    </div>
                </div>

                {/* Recent Activity Log */}
                <div className="lg:col-span-2 bg-[#262626] p-6 rounded-xl shadow-lg border border-[#333]">
                    <h3 className="text-[#f5f5f5] text-lg font-bold mb-4 flex items-center gap-2">
                        <FaClock className="text-gray-400"/> Recent Orders
                    </h3>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-gray-500 text-xs border-b border-[#444]">
                                    <th className="py-2">Customer</th>
                                    <th className="py-2">Order ID</th>
                                    <th className="py-2">Amount</th>
                                    <th className="py-2">Status</th>
                                    <th className="py-2 text-right">Time</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {stats.recentOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-8 text-gray-500">No orders yet today.</td>
                                    </tr>
                                ) : (
                                    stats.recentOrders.map((order) => (
                                        <tr key={order._id} className="border-b border-[#333] hover:bg-[#333] transition-colors">
                                            <td className="py-3 text-[#f5f5f5] font-medium">{order.customerDetails?.name || "Walk-in"}</td>
                                            <td className="py-3 text-gray-400 text-xs">#{order._id.slice(-6)}</td>
                                            <td className="py-3 text-[#f6b100] font-bold">₱{order.bills.total.toFixed(2)}</td>
                                            <td className="py-3">
                                                <span className={`px-2 py-1 rounded text-xs font-semibold
                                                    ${order.orderStatus === 'Completed' ? 'bg-green-900/50 text-green-400' : 
                                                      order.orderStatus === 'In Progress' ? 'bg-blue-900/50 text-blue-400' : 
                                                      'bg-orange-900/50 text-orange-400'}`}>
                                                    {order.orderStatus}
                                                </span>
                                            </td>
                                            <td className="py-3 text-right text-gray-500 text-xs">
                                                {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Metrics;