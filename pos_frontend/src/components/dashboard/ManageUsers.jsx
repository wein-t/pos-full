import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllUsers, deleteUser, updateUserRole } from '../../https';
import BackButton from '../shared/BackButton';
import { FaTrash, FaUserShield, FaUserTie } from 'react-icons/fa';
import { enqueueSnackbar } from 'notistack';
import { useSelector } from 'react-redux';
import FullScreenLoader from '../shared/FullScreenLoader';

const ManageUsers = () => {
    const queryClient = useQueryClient();
    const currentUser = useSelector(state => state.user);

    // 1. Fetch Users
    const { data: userData, isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: getAllUsers
    });

    const users = userData?.data?.data || [];

    // 2. Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: deleteUser,
        onSuccess: () => {
            queryClient.invalidateQueries(['users']);
            enqueueSnackbar("User deleted successfully", { variant: "success" });
        },
        onError: (err) => {
            enqueueSnackbar(err.response?.data?.message || "Failed to delete user", { variant: "error" });
        }
    });

    // 3. Update Role Mutation
    const updateRoleMutation = useMutation({
        mutationFn: updateUserRole,
        onSuccess: () => {
            queryClient.invalidateQueries(['users']);
            enqueueSnackbar("User role updated!", { variant: "success" });
        },
        onError: (err) => {
            enqueueSnackbar(err.response?.data?.message || "Failed to update role", { variant: "error" });
        }
    });

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
            deleteMutation.mutate(id);
        }
    };

    const handleRoleChange = (userId, newRole) => {
        if(window.confirm(`Are you sure you want to change this user's role to ${newRole === 'admin' ? 'Admin' : 'Staff'}?`)) {
            updateRoleMutation.mutate({ userId, role: newRole });
        }
    };

    if (isLoading) return <FullScreenLoader />;

    return (
        <section className="bg-[#1f1f1f] min-h-screen p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <BackButton />
                    <h1 className="text-[#f5f5f5] text-2xl font-bold tracking-wider">Manage Users</h1>
                </div>
                <div className="bg-[#262626] px-4 py-2 rounded-lg">
                    <span className="text-gray-400 text-sm">Total Employees: </span>
                    <span className="text-[#f6b100] font-bold ml-2">{users.length}</span>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-[#262626] rounded-xl overflow-hidden shadow-lg border border-[#333]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#333] text-gray-400 uppercase text-sm">
                            <tr>
                                <th className="px-6 py-4">Employee Name</th>
                                <th className="px-6 py-4">Contact Info</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Joined Date</th>
                                <th className="px-6 py-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#333]">
                            {users.map((user) => {
                                const isCurrentUser = user._id === currentUser._id;
                                return (
                                    <tr key={user._id} className="hover:bg-[#2a2a2a] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${user.role === 'admin' ? 'bg-[#025cca]' : 'bg-[#f6b100]'}`}>
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-[#f5f5f5] font-semibold">{user.name}</p>
                                                    {isCurrentUser && <span className="text-xs text-green-500 font-bold">(You)</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-gray-300 text-sm">{user.email}</p>
                                            <p className="text-gray-500 text-xs">{user.phone}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            {/* Role Selector Dropdown */}
                                            <div className="relative inline-block w-32">
                                                <div className={`pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2 ${user.role === 'admin' ? 'text-blue-400' : 'text-yellow-400'}`}>
                                                    {user.role === 'admin' ? <FaUserShield /> : <FaUserTie />}
                                                </div>
                                                <select
                                                    disabled={isCurrentUser}
                                                    value={user.role}
                                                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                                    className={`
                                                        block w-full rounded-lg py-2 pl-8 pr-2 text-xs font-semibold shadow-sm focus:outline-none focus:ring-1 
                                                        ${user.role === 'admin' 
                                                            ? 'bg-blue-900/20 text-blue-400 border border-blue-900 focus:ring-blue-500' 
                                                            : 'bg-yellow-900/20 text-yellow-400 border border-yellow-900 focus:ring-yellow-500'
                                                        }
                                                        ${isCurrentUser ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-opacity-30'}
                                                    `}
                                                >
                                                    <option value="user" className="bg-[#262626] text-yellow-400">Staff</option>
                                                    <option value="admin" className="bg-[#262626] text-blue-400">Admin</option>
                                                </select>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400 text-sm">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button 
                                                onClick={() => handleDelete(user._id)}
                                                disabled={isCurrentUser || user.email === 'admin@admin.com'} 
                                                className="text-gray-500 hover:text-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed p-2 cursor-pointer"
                                                title="Delete User"
                                            >
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    
                    {users.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                            No users found.
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default ManageUsers;