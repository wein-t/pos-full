import React from 'react';
import restaurant from "../assets/metanoia.jpg";
import logo from "../assets/logo.jpg";
import Login from "../components/auth/Login";

const Auth = () => {
    return (
        <div className="flex min-h-screen w-full">
            {/* Left Section*/}
            <div className="w-1/2 relative flex items-center justify-center bg-cover">
                <img
                    className="w-full h-full object-cover"
                    src={restaurant}
                    alt="Metanoia Restaurant"
                />
                <div className="absolute inset-0 bg-black" style={{ opacity: 0.8 }}></div>
                <blockquote className="absolute bottom-10 px-8 mb-10 text-2xl italic text-white">
                    "Every customer is a guest in our home—and we are the hosts.
                    It's our job to make every moment feel warm, welcoming, and worth coming back for."
                    <br />
                    <span className="block mt-4 text-yellow-400">- Metanoia Snack House</span>
                </blockquote>
            </div>


            {/* Right Section */}
            <div className="w-1/2 min-h-screen bg-[#1a1a1a] p-10 flex flex-col pt-24">
                <div className="flex flex-col items-center gap-2 mb-10">
                    <img src={logo} alt="Metanoia Logo" className="h-14 w-14 border-2 rounded-full p-1" />
                    <h1 className="text-lg font-semibold text-[#f5f5f5] tracking-wide">Metanoia Snack House</h1>
                </div>

                <h2 className="text-4xl text-center font-semibold text-yellow-400 mb-10">
                    Employee Login
                </h2>

               
                <Login />

            </div>
            
        </div>
    );
};

export default Auth;