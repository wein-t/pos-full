import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from "../../https/index";
import { useMutation } from '@tanstack/react-query';
import { enqueueSnackbar } from 'notistack';
import { IoArrowBackCircleOutline } from "react-icons/io5";

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "user" // Default role
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };


    const handleRoleSelection = (selectedRole) => {
        const roleValue = selectedRole === "Admin" ? "admin" : "user";
        setFormData({ ...formData, role: roleValue });
    };

    const registerMutation = useMutation({
        mutationFn: (reqData) => register(reqData),
        onSuccess: (res) => {
            const { data } = res;
            enqueueSnackbar(data?.message || "User created successfully!", { variant: "success" });
            setTimeout(() => {
                navigate('/dashboard');
            }, 1500);
        },
        onError: (error) => {
            const { response } = error;
            enqueueSnackbar(response?.data?.message || "An error occurred.", { variant: "error" });
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        registerMutation.mutate(formData);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#1f1f1f] p-4">
            <div className="w-full max-w-lg p-8 space-y-4 bg-[#1a1a1a] rounded-xl shadow-lg relative">
                
                <button
                    onClick={() => navigate('/dashboard')}
                    className="cursor-pointer absolute top-4 left-4 text-gray-400 hover:text-white transition-colors"
                    title="Back to Dashboard"
                >
                    <IoArrowBackCircleOutline size={32} />
                </button>

                <h1 className="text-3xl font-bold text-center text-yellow-400 mb-6 pt-8">Create New User Account</h1>
                
                <form onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-[#ababab] mb-2 text-sm font-medium">Employee Name</label>
                        <div className="flex items-center rounded-lg p-4 bg-[#262626]">
                            <input type="text" name='name' value={formData.name} onChange={handleChange} placeholder="Enter employee name" className='bg-transparent flex-1 text-white focus:outline-none' required />
                        </div>
                    </div>
                    <div className="mt-4">
                        <label className="block text-[#ababab] mb-2 text-sm font-medium">Employee Email</label>
                        <div className="flex items-center rounded-lg p-4 bg-[#262626]"><input type="email" name='email' value={formData.email} onChange={handleChange} placeholder="Enter employee email" className='bg-transparent flex-1 text-white focus:outline-none' required /></div>
                    </div>
                    <div className="mt-4">
                        <label className="block text-[#ababab] mb-2 text-sm font-medium">Employee Phone</label>
                        <div className="flex items-center rounded-lg p-4 bg-[#262626]"><input type="number" name='phone' value={formData.phone} onChange={handleChange} placeholder="Enter employee phone number" className='bg-transparent flex-1 text-white focus:outline-none' required /></div>
                    </div>
                    <div className="mt-4">
                        <label className="block text-[#ababab] mb-2 text-sm font-medium">Password</label>
                        <div className="flex items-center rounded-lg p-4 bg-[#262626]"><input type="password" name='password' value={formData.password} onChange={handleChange} placeholder="Enter password" className='bg-transparent flex-1 text-white focus:outline-none' required /></div>
                    </div>
                    
                    {/* Role Selection Updated Here */}
                    <div className="mt-4">
                        <label className="block text-[#ababab] mb-2 mt-3 text-sm font-medium">Choose Role</label>
                        <div className="flex items-center gap-3 mt-2">
                            {["Staff", "Admin"].map((role) => {
                                const roleValue = role === "Admin" ? "admin" : "user";
                                return (
                                    <button 
                                        key={role} 
                                        type="button" 
                                        onClick={() => handleRoleSelection(role)} 
                                        className={`cursor-pointer px-4 py-3 w-full rounded-lg text-white font-semibold transition-colors ${formData.role === roleValue ? "bg-indigo-600" : "bg-[#2a2a2a] hover:bg-[#3c3c3c]"}`}
                                    >
                                        {role}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <button type="submit" className="cursor-pointer w-full mt-8 py-3 text-lg bg-yellow-400 text-gray-900 font-bold rounded-lg hover:bg-yellow-500 disabled:opacity-50" disabled={registerMutation.isLoading}>
                        {registerMutation.isLoading ? 'Creating Account...' : 'Create User'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Register;