import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { IoMdPersonAdd } from "react-icons/io";
import { FaUsers } from "react-icons/fa";

// Import the components for the tabs
import Metrics from '../components/dashboard/Metrics';
import ManageMenu from '../components/dashboard/ManageMenu';
// NEW: Import the combined section instead of separate files
import ImportExportSection from '../components/dashboard/ImportExportSection'; 
import BackButton from '../components/shared/BackButton';

// User management buttons
const buttons = [
    { label: "Create User", icon: <IoMdPersonAdd />, path: "/users/create" },
    { label: "Manage Users", icon: <FaUsers />, path: "/users/manage" },
];

// UPDATED TABS: Combined Import & Export into one tab
const tabs = ["Metrics", "Manage Menu", "Import / Export"];

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState("Metrics");

    return (
        <div className='bg-[#1f1f1f] min-h-screen flex flex-col p-6'>
            {/* Header section */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <BackButton to="/" />
                    <h1 className="text-white text-2xl font-bold tracking-wider">Admin Dashboard</h1>
                </div>
            </div>

            {/* Main content area */}
            <div className='flex-1 flex flex-col'>
                {/* Top action buttons and tabs */}
                <div className='flex flex-wrap items-center justify-between gap-4 py-4'>
                    <div className='flex items-center gap-3'>
                        {buttons.map(({ label, icon, path }) => (
                            <Link to={path} key={label}>
                                <button className='cursor-pointer bg-[#262626] hover:bg-[#383838] px-4 py-2 rounded-lg text-white font-semibold text-sm flex items-center gap-2 transition-colors'>
                                    {icon} {label}
                                </button>
                            </Link>
                        ))}
                    </div>
                    <div className='flex items-center gap-2 bg-[#262626] p-1 rounded-lg'>
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                className={`cursor-pointer px-4 py-1.5 rounded-md text-[#f5f5f5] font-semibold text-sm flex items-center gap-2 transition-colors ${activeTab === tab ? "bg-[#383838]" : "text-[#ababab] hover:text-white"}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
                
                {/* Content Area */}
                <div className='flex-1 bg-[#1f1f1f] rounded-lg p-4'>
                    {activeTab === "Metrics" && (
                        <div className="w-full h-full">
                            <Metrics />
                        </div>
                    )}
                    {activeTab === "Manage Menu" && (
                        <div className="w-full h-full">
                            <ManageMenu />
                        </div>
                    )}
                    
                    {/* NEW: Render the Combined Import/Export Section */}
                    {activeTab === "Import / Export" && (
                        <div className="w-full h-full max-w-5xl mx-auto">
                            <ImportExportSection />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;