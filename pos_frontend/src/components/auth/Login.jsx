import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import { enqueueSnackbar } from 'notistack';

import { login } from '../../https/index';
import { setUser } from '../../redux/slices/userSlice';

const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({ email: "", password: "" });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const loginMutation = useMutation({
        mutationFn: (reqData) => login(reqData),
        onSuccess: (res) => {
            console.log("%c--- LOGIN SUCCESS ---", "color: #22c55e; font-size: 16px;");
            const { data } = res;
            console.log("1. Raw Response from Backend:", data);

            if (data && data.token) {
                localStorage.setItem('userInfo', JSON.stringify(data));
                console.log("2. SUCCESS: Token found and saved to localStorage.");
                console.log("   Current localStorage value:", localStorage.getItem('userInfo'));
                dispatch(setUser(data.data));
                console.log("3. Dispatched user data to Redux:", data.data);
                enqueueSnackbar(data.message || "Login successful!", { variant: "success" });
                navigate('/');
            } else {
                console.error("2. FAILURE: 'token' field is missing in the backend response!", data);
                enqueueSnackbar("Login succeeded but no token was received.", { variant: "error" });
            }
        },
        onError: (error) => {
            console.error("%c--- LOGIN FAILED ---", "color: #ef4444; font-size: 16px;");
            const { response } = error;
            enqueueSnackbar(response?.data?.message || "Login failed.", { variant: "error" });
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        loginMutation.mutate(formData);
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                
                <div className="mb-4">
                    <label className="block text-[#ababab] mb-2 text-sm font-medium">Employee Email</label>
                    <div className="flex items-center rounded-lg p-4 bg-[#1f1f1f]">
                        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" className='bg-transparent flex-1 text-white focus:outline-none' required />
                    </div>
                </div>
                <div>
                    <label className="block text-[#ababab] mb-2 text-sm font-medium">Password</label>
                    <div className="flex items-center rounded-lg p-4 bg-[#1f1f1f]">
                        <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Enter your password" className='bg-transparent flex-1 text-white focus:outline-none' required />
                    </div>
                </div>
                <button type="submit" className="cursor-pointer w-full mt-6 py-3 text-lg bg-yellow-400 text-gray-900 font-bold rounded-lg hover:bg-yellow-500 disabled:opacity-50" disabled={loginMutation.isLoading}>
                    {loginMutation.isLoading ? 'Signing in...' : 'Sign in'}
                </button>
            </form>
        </div>
    );
};

export default Login;