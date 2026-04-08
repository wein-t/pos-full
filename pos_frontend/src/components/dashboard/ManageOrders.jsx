import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateOrderStatus } from "../../https";
import { enqueueSnackbar } from "notistack";

const ManageOrders = ({ orders }) => {
    const queryClient = useQueryClient();

    const updateStatusMutation = useMutation({
        mutationFn: updateOrderStatus,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            enqueueSnackbar("Order status updated successfully!", { variant: "success" });
        },
        onError: () => {
            enqueueSnackbar("Failed to update order status.", { variant: "error" });
        }
    });

    const handleStatusChange = (orderId, newStatus) => {
        updateStatusMutation.mutate({ orderId, status: newStatus });
    };

    const sortedOrders = orders
        ? [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        : [];

    return (
        <div className="container mx-auto bg-[#262626] p-4 rounded-lg">
            <h2 className="text-[#f5f5f5] text-xl font-semibold mb-4">
                Manage All Orders
            </h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-[#f5f5f5]">
                    <thead className="bg-[#333] text-[#ababab]">
                        <tr>
                            <th className="p-3">Order ID</th>
                            <th className="p-3">Customer</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Date & Time</th>
                            <th className="p-3">Items</th>
                            <th className="p-3">Total</th>
                            <th className="p-3 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedOrders.map((order) => (
                            <tr
                                key={order._id}
                                className="border-b border-gray-600 hover:bg-[#333]"
                            >
                                <td className="p-4">#{order._id.slice(-6)}</td>
                                <td className="p-4">{order.customerDetails.name}</td>
                                <td className="p-4">{order.orderStatus}</td>
                                <td className="p-4">{new Date(order.createdAt).toLocaleString()}</td>
                                <td className="p-4">{order.items.length} Items</td>
                                <td className="p-4">₱{order.bills.total.toFixed(2)}</td>
                                <td className="p-4 text-center">
                                    
                                    <select
                                        className={`bg-[#1a1a1a] text-[#f5f5f5] border border-gray-500 p-2 rounded-lg focus:outline-none hover:bg-[#333] transition-colors`}
                                        value={order.orderStatus}
                                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageOrders;