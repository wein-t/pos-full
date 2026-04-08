import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllOrders, getAllMenus } from '../https'; 
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import BottomNav from '../components/shared/BottomNav';

// ====================================================================
// 🛠️ RESTORE DELETED CATEGORIES HERE
// List items that you deleted from the menu so they still show up in charts.
// Format: "Item Name": "Old Category Name"
// ====================================================================
const DELETED_ITEMS_RESTORE = {
    "ramyun": "Noodles",
    "pork siomai": "Dimsum",
    "fish roll": "Street Food",
    "burger": "Burgers",
    // Add more here if needed: "item name": "category"
};

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#262626] p-3 rounded-lg border border-gray-600 text-white shadow-lg">
                <p className="font-semibold">{`${payload[0].name}`}</p>
                <p className="text-sm">{`Sales: ₱${payload[0].value.toLocaleString()}`}</p>
            </div>
        );
    }
    return null;
};

const RevenueTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#262626] p-3 rounded-lg border border-gray-600 text-white shadow-lg">
                <p className="font-semibold">{`${label}`}</p>
                <p className="text-sm">{`Revenue: ₱${payload[0].value.toLocaleString()}`}</p>
                {payload[1] && <p className="text-sm">{`Orders: ${payload[1].value}`}</p>}
            </div>
        );
    }
    return null;
};

const Data = () => {
    const [activeTab, setActiveTab] = useState("Sales Overview");
    const tabs = ["Sales Overview", "Menu Performance"];

    const { data: ordersData, isLoading: ordersLoading } = useQuery({
        queryKey: ['orders'],
        queryFn: getAllOrders,
        refetchInterval: 5000, 
    });

    const { data: menusData, isLoading: menusLoading } = useQuery({
        queryKey: ['menus'],
        queryFn: getAllMenus,
        refetchInterval: 5000,
    });

    const allOrders = ordersData?.data?.data || [];
    const allMenus = menusData?.data?.data || [];

    const analyticsData = useMemo(() => {
        const defaultData = {
            totalRevenue: 0,
            totalOrders: 0,
            averageOrderValue: 0,
            weeklySalesData: [],
            dailyOrdersData: [],
            monthlySalesData: [],
            popularItemsData: [],
            salesByCategoryData: [],
            itemRevenueData: [],
            categoryPerformanceData: [],
            lowPerformingItems: []
        };

        if (allOrders.length === 0) return defaultData;

        // --- A. CREATE LIVE MENU MAP ---
        const itemToCategoryMap = {};
        allMenus.forEach(category => {
            const itemsList = category.items || category.products || [];
            itemsList.forEach(item => {
                if (item.name) {
                    itemToCategoryMap[item.name.trim().toLowerCase()] = category.name;
                }
            });
        });

        // --- B. FILTER ORDERS ---
        const validOrders = allOrders.filter(o => o.orderStatus === 'Completed');
        
        // --- C. BASIC METRICS ---
        const totalRevenue = validOrders.reduce((sum, order) => sum + (order.bills?.total || 0), 0);
        const totalOrders = validOrders.length;
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const salesByDay = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
        const ordersByDay = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };

        validOrders.forEach(order => {
            const dateObj = new Date(order.createdAt);
            if (!isNaN(dateObj)) {
                const dayName = dayNames[dateObj.getDay()];
                salesByDay[dayName] += (order.bills?.total || 0);
                ordersByDay[dayName] += 1;
            }
        });

        const weeklySalesData = dayNames.map(day => ({
            name: day,
            sales: salesByDay[day],
            orders: ordersByDay[day]
        }));

        const dailyOrdersData = dayNames.map(day => ({
            name: day,
            orders: ordersByDay[day]
        }));

        // --- C.2 DYNAMIC MONTHLY TREND (4 WEEKS OF CURRENT MONTH) ---
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const weeklySalesMap = {
            'Week 1': 0, // Days 1-7
            'Week 2': 0, // Days 8-14
            'Week 3': 0, // Days 15-21
            'Week 4': 0  // Days 22+
        };

        validOrders.forEach(order => {
            const orderDate = new Date(order.createdAt);
            
            // Only add up orders that happened in the CURRENT month and year
            if (!isNaN(orderDate) && orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
                const dayOfMonth = orderDate.getDate();
                const total = order.bills?.total || 0;

                // Group the real revenue into the correct week
                if (dayOfMonth >= 1 && dayOfMonth <= 7) {
                    weeklySalesMap['Week 1'] += total;
                } else if (dayOfMonth >= 8 && dayOfMonth <= 14) {
                    weeklySalesMap['Week 2'] += total;
                } else if (dayOfMonth >= 15 && dayOfMonth <= 21) {
                    weeklySalesMap['Week 3'] += total;
                } else {
                    weeklySalesMap['Week 4'] += total; // Days 22 to 31
                }
            }
        });

        const monthlySalesData = [
            { name: 'Week 1', sales: weeklySalesMap['Week 1'] },
            { name: 'Week 2', sales: weeklySalesMap['Week 2'] },
            { name: 'Week 3', sales: weeklySalesMap['Week 3'] },
            { name: 'Week 4', sales: weeklySalesMap['Week 4'] }
        ];

        // --- D. CATEGORY ENGINE WITH RESTORE LOGIC ---
        const itemStats = {};     
        const categoryStats = {}; 

        validOrders.forEach(order => {
            if (order.items && Array.isArray(order.items)) {
                const categoriesInThisOrder = new Set();

                order.items.forEach(item => {
                    const itemName = item.name || "Unknown Item";
                    const cleanName = itemName.trim().toLowerCase();

                    // 🚨 1. Check Live Menu
                    // 🚨 2. Check "Restored Items" List
                    let categoryName = itemToCategoryMap[cleanName] || DELETED_ITEMS_RESTORE[cleanName];

                    // 🚨 3. IF NOT FOUND IN LIVE MENU OR RESTORED LIST, SKIP IT COMPLETELY
                    if (!categoryName) {
                        return; 
                    }
                    
                    const qty = item.quantity || 0;
                    const price = item.price || 0; 
                    const revenue = price * qty; 

                    // Stats Logic
                    if (!itemStats[itemName]) {
                        itemStats[itemName] = { name: itemName, quantity: 0, revenue: 0 };
                    }
                    itemStats[itemName].quantity += qty;
                    itemStats[itemName].revenue += revenue;

                    if (!categoryStats[categoryName]) {
                        categoryStats[categoryName] = { name: categoryName, quantity: 0, revenue: 0, orders: 0 };
                    }
                    categoryStats[categoryName].quantity += qty;
                    categoryStats[categoryName].revenue += revenue;
                    
                    categoriesInThisOrder.add(categoryName);
                });

                categoriesInThisOrder.forEach(cat => {
                    if (categoryStats[cat]) categoryStats[cat].orders += 1;
                });
            }
        });

        // --- E. FORMATTING ---
        const popularItemsData = Object.values(itemStats)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 8);

        const itemRevenueData = Object.values(itemStats)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 6);

        const lowPerformingItems = Object.values(itemStats)
            .sort((a, b) => a.quantity - b.quantity)
            .slice(0, 5);

        const categoryPerformanceData = Object.values(categoryStats)
            .map(cat => ({
                ...cat,
                avgOrderValue: cat.orders > 0 ? cat.revenue / cat.orders : 0
            }))
            .sort((a, b) => b.revenue - a.revenue);

        const salesByCategoryData = categoryPerformanceData
            .map(cat => ({ name: cat.name, value: cat.revenue }))
            .filter(cat => cat.value > 0);

        return {
            totalRevenue, totalOrders, averageOrderValue,
            weeklySalesData, dailyOrdersData, monthlySalesData,
            popularItemsData, salesByCategoryData, itemRevenueData,
            categoryPerformanceData, lowPerformingItems
        };
    }, [allOrders, allMenus]); 

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560', '#775DD0', '#00D2FF'];
    const formatCurrency = (value) => `₱${value.toLocaleString()}`;
    const isInitialLoading = (ordersLoading || menusLoading) && allOrders.length === 0;

    return (
        <div className="bg-[#1f1f1f] h-[calc(100vh-5rem)]">
            <main className="h-full overflow-y-auto p-6 text-white pb-20 custom-scroll">
                <div className='container mx-auto'>
                    <div className='flex items-center justify-between mb-8'>
                        <h1 className="text-3xl font-bold text-[#f5f5f5]">Data Analytics (Live)</h1>
                        <div className='flex items-center gap-3'>
                            {tabs.map((tab) => (
                                <button key={tab} className={`px-6 py-2 rounded-lg font-semibold text-md transition-colors duration-200 ${activeTab === tab ? "bg-[#f6b100] text-[#1a1a1a]" : "bg-[#262626] text-[#f5f5f5] hover:bg-[#333]"}`} onClick={() => setActiveTab(tab)}>
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    {isInitialLoading ? (
                        <div className="text-center text-gray-400 py-20">Loading live data...</div>
                    ) : (
                        <>
                            {activeTab === "Sales Overview" && (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="bg-[#262626] p-6 rounded-lg shadow-lg text-center">
                                            <h3 className="text-lg font-semibold text-gray-400">Total Revenue</h3>
                                            <p className="text-4xl font-bold text-green-500 mt-2">{formatCurrency(analyticsData.totalRevenue)}</p>
                                        </div>
                                        <div className="bg-[#262626] p-6 rounded-lg shadow-lg text-center">
                                            <h3 className="text-lg font-semibold text-gray-400">Total Completed Orders</h3>
                                            <p className="text-4xl font-bold text-blue-500 mt-2">{analyticsData.totalOrders.toLocaleString()}</p>
                                        </div>
                                        <div className="bg-[#262626] p-6 rounded-lg shadow-lg text-center">
                                            <h3 className="text-lg font-semibold text-gray-400">Avg Order Value</h3>
                                            <p className="text-4xl font-bold text-purple-500 mt-2">{formatCurrency(analyticsData.averageOrderValue)}</p>
                                        </div>
                                    </div>
                                    <div className="lg:col-span-2 bg-[#262626] p-6 rounded-lg shadow-lg">
                                        <h2 className="text-xl font-semibold mb-4">Weekly Sales & Orders</h2>
                                        <ResponsiveContainer width="100%" height={350}>
                                            <AreaChart data={analyticsData.weeklySalesData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                                <XAxis dataKey="name" stroke="#888" />
                                                <YAxis yAxisId="left" stroke="#888" tickFormatter={formatCurrency} />
                                                <YAxis yAxisId="right" orientation="right" stroke="#888" />
                                                <Tooltip content={<RevenueTooltip />} />
                                                <Legend />
                                                <Area yAxisId="left" type="monotone" dataKey="sales" name="Sales (₱)" stroke="#f6b100" fill="#f6b100" fillOpacity={0.6} />
                                                <Line yAxisId="right" type="monotone" dataKey="orders" name="Orders" stroke="#8884d8" strokeWidth={2} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="bg-[#262626] p-6 rounded-lg shadow-lg">
                                        <h2 className="text-xl font-semibold mb-4">Daily Orders</h2>
                                        <ResponsiveContainer width="100%" height={350}>
                                            <BarChart data={analyticsData.dailyOrdersData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                                <XAxis dataKey="name" stroke="#888" />
                                                <YAxis stroke="#888" />
                                                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: 'none' }} formatter={(value) => [`${value} orders`, 'Orders']} />
                                                <Bar dataKey="orders" name="Orders" fill="#00C49F" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="lg:col-span-3 bg-[#262626] p-6 rounded-lg shadow-lg">
                                        <h2 className="text-xl font-semibold mb-4">Monthly Sales Trend</h2>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <LineChart data={analyticsData.monthlySalesData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                                <XAxis dataKey="name" stroke="#888" />
                                                <YAxis stroke="#888" tickFormatter={formatCurrency} />
                                                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: 'none' }} formatter={(value) => [formatCurrency(value), 'Sales']} />
                                                <Legend />
                                                <Line type="monotone" dataKey="sales" name="Sales" stroke="#FF8042" strokeWidth={3} dot={{ r: 6 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            )}

                            {activeTab === "Menu Performance" && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                    <div className="xl:col-span-2 bg-[#262626] p-6 rounded-lg shadow-lg">
                                        <h2 className="text-xl font-semibold mb-4">Most Popular Foods (by Quantity)</h2>
                                        <ResponsiveContainer width="100%" height={400}>
                                            <BarChart data={analyticsData.popularItemsData} layout="vertical" margin={{ left: 20 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                                <XAxis type="number" stroke="#888" />
                                                <YAxis type="category" dataKey="name" stroke="#888" width={120} tick={{ fontSize: 12 }} />
                                                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: 'none' }} />
                                                <Bar dataKey="quantity" name="Quantity Sold" fill="#8884d8" radius={[0, 4, 4, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="bg-[#262626] p-6 rounded-lg shadow-lg">
                                        <h2 className="text-xl font-semibold mb-4">Sales by Category</h2>
                                        <div className="h-[400px]">
                                            {analyticsData.salesByCategoryData.length > 0 ? (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie data={analyticsData.salesByCategoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" labelLine={false} outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                                            {analyticsData.salesByCategoryData.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip content={<CustomTooltip />} />
                                                        <Legend />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-gray-500">No category data found.</div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="xl:col-span-2 bg-[#262626] p-6 rounded-lg shadow-lg">
                                        <h2 className="text-xl font-semibold mb-4">Top Revenue Generating Foods</h2>
                                        <ResponsiveContainer width="100%" height={420}>
                                            <BarChart data={analyticsData.itemRevenueData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                                <XAxis dataKey="name" stroke="#888" angle={-45} textAnchor="end" height={120} interval={0} tick={{ fontSize: 11 }} />
                                                <YAxis stroke="#888" tickFormatter={formatCurrency} />
                                                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: 'none' }} formatter={(value) => [formatCurrency(value), 'Revenue']} />
                                                <Bar dataKey="revenue" name="Revenue" fill="#00C49F" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="xl:col-span-3 bg-[#262626] p-6 rounded-lg shadow-lg">
                                        <h2 className="text-xl font-semibold mb-2">Detailed Category Performance</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[500px] overflow-y-auto custom-scroll pr-2">
                                            {analyticsData.categoryPerformanceData.map((category, index) => (
                                                <div key={category.name} className="bg-[#1a1a1a] p-4 rounded-lg border border-[#333] hover:border-[#f6b100] transition-colors">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h3 className="font-bold text-[#f5f5f5] truncate" title={category.name}>{category.name}</h3>
                                                        <span className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}}></span>
                                                    </div>
                                                    <div className="space-y-2 text-sm">
                                                        <div className="flex justify-between"><span className="text-gray-400">Revenue:</span><span className="text-green-400 font-mono">{formatCurrency(category.revenue)}</span></div>
                                                        <div className="flex justify-between"><span className="text-gray-400">Sold:</span><span className="text-blue-400 font-mono">{category.quantity}</span></div>
                                                        <div className="flex justify-between"><span className="text-gray-400">Orders:</span><span className="text-purple-400 font-mono">{category.orders}</span></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="xl:col-span-3 bg-[#262626] p-6 rounded-lg shadow-lg">
                                        <h2 className="text-xl font-semibold mb-4">Foods Needing Attention (Low Sales)</h2>
                                        <ResponsiveContainer width="100%" height={250}>
                                            <BarChart data={analyticsData.lowPerformingItems}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                                <XAxis dataKey="name" stroke="#888" />
                                                <YAxis stroke="#888" />
                                                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: 'none' }} />
                                                <Bar dataKey="quantity" name="Quantity Sold" fill="#FF4560" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
            <BottomNav />
        </div>
    );
};

export default Data;