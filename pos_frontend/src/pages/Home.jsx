import React, { useState, useMemo } from "react";
import BottomNav from "../components/shared/BottomNav";
import Greetings from "../components/home/Greetings";
import MiniCard from "../components/home/MiniCard";
import { BsCashCoin } from "react-icons/bs";
import { FaClipboardList } from "react-icons/fa";
import RecentOrders from "../components/home/RecentOrders";
import PopularDishes from "../components/home/PopularDishes";
import { useQuery } from "@tanstack/react-query";
import { getAllOrders, getMenus } from "../https"; 
import { dishIcons } from "../constants";

const Home = () => {
    const [searchTerm, setSearchTerm] = useState('');
    
    // 1. Fetch Orders
    const { data: ordersData, isLoading: ordersLoading } = useQuery({
        queryKey: ['orders'],
        queryFn: getAllOrders,
    });

    // 2. Fetch Menus (To get category names & map items)
    const { data: menuData } = useQuery({
        queryKey: ['menus'],
        queryFn: getMenus
    });

    const allOrders = ordersData?.data?.data || [];
    const menus = menuData?.data?.data || [];

    // 3. Extract Category Names for the Filter (Sorted A-Z)
    const categoryNames = useMemo(() => {
        return menus.map(menu => menu.name).sort();
    }, [menus]);

    const dashboardData = useMemo(() => {
        // --- Earnings & Counts Calculation ---
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
        const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
        
        const todayOrders = allOrders.filter(o => new Date(o.createdAt) >= today && new Date(o.createdAt) < tomorrow);
        const yesterdayOrders = allOrders.filter(o => new Date(o.createdAt) >= yesterday && new Date(o.createdAt) < today);
        
        const todayEarnings = todayOrders.reduce((sum, order) => sum + (order.bills?.total ?? 0), 0);
        const yesterdayEarnings = yesterdayOrders.reduce((sum, order) => sum + (order.bills?.total ?? 0), 0);
        
        let earningsPercentage = 0;
        if (yesterdayEarnings > 0) earningsPercentage = ((todayEarnings - yesterdayEarnings) / yesterdayEarnings) * 100;
        else if (todayEarnings > 0) earningsPercentage = 100;
        
        const todaysOrderCount = todayOrders.length;
        const yesterdayOrderCount = yesterdayOrders.length;
        let orderCountPercentage = 0;
        if (yesterdayOrderCount > 0) orderCountPercentage = ((todaysOrderCount - yesterdayOrderCount) / yesterdayOrderCount) * 100;
        else if (todaysOrderCount > 0) orderCountPercentage = 100;

        // --- POPULAR DISHES LOGIC ---

        // 1. Create a Set of valid item names from the current MENU for filtering
        const validMenuItemNames = new Set();
        // 2. Map Item Name -> Category Name
        const itemCategoryMap = {};
        
        menus.forEach(category => {
            category.items.forEach(item => {
                validMenuItemNames.add(item.name); // Add to set
                itemCategoryMap[item.name] = category.name;
            });
        });

        // Map for Icons (Static fallback)
        const dishIconMap = dishIcons.reduce((map, dish) => {
            map[dish.name] = dish.icon;
            return map;
        }, {});

        // 3. Count Products from Orders, BUT ONLY IF they exist in the current menu
        const productCounts = {};
        allOrders.forEach(order => {
            (order.items ?? []).forEach(item => {
                // Check if the item is valid before counting
                if (validMenuItemNames.has(item.name)) {
                    productCounts[item.name] = (productCounts[item.name] || 0) + item.quantity;
                }
            });
        });

        // 4. Build the final array
        const dynamicPopularDishes = Object.entries(productCounts)
            .map(([name, numberOfOrders]) => {
                const baseName = name.split(' (')[0]; 
                return {
                    id: name,
                    name: name,
                    numberOfOrders: numberOfOrders,
                    // Since we filtered by validMenuItemNames, the category should exist.
                    // Fallback to 'Others' just in case of data inconsistency.
                    category: itemCategoryMap[name] || itemCategoryMap[baseName] || 'Others',
                    icon: dishIconMap[baseName] || '🍽️', 
                };
            })
            .sort((a, b) => b.numberOfOrders - a.numberOfOrders)
            .slice(0, 10); // Top 10

        return {
            todayEarnings,
            earningsPercentage: parseFloat(earningsPercentage.toFixed(2)),
            todaysOrderCount,
            orderCountPercentage: parseFloat(orderCountPercentage.toFixed(2)),
            dynamicPopularDishes
        };
    }, [allOrders, menus]);

    const activeOrders = allOrders.filter(order => order.orderStatus !== "Completed");
    const sortedActiveOrders = [...activeOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const searchedAndSortedOrders = sortedActiveOrders.filter(order =>
        (order.customerDetails?.name || 'Walk-in').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <section className="bg-[#1f1f1f] h-[calc(100vh-5rem)] relative">
            {/* ADDED 'scrollbar-hide' and 'pb-20' HERE */}
            <div className="h-full overflow-y-auto scrollbar-hide flex gap-3 pb-20">
                <div className="flex-[3]">
                    <Greetings />
                    <div className="flex items-center w-full gap-3 px-8 mt-8">
                        <MiniCard
                            title="Total Earnings"
                            icon={<BsCashCoin />}
                            number={dashboardData.todayEarnings}
                            footerNum={dashboardData.earningsPercentage}
                        />
                        <MiniCard
                            title="Today's Orders"
                            icon={<FaClipboardList />}
                            number={dashboardData.todaysOrderCount}
                            footerNum={dashboardData.orderCountPercentage}
                        />
                    </div>
                    <RecentOrders
                        orders={searchedAndSortedOrders}
                        isLoading={ordersLoading}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                    />
                </div>
                <div className="flex-[2]">
                    {/* Pass Dynamic Dishes AND Menu Categories */}
                    <PopularDishes 
                        dishes={dashboardData.dynamicPopularDishes} 
                        isLoading={ordersLoading} 
                        availableCategories={categoryNames} 
                    />
                </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full">
                <BottomNav />
            </div>
        </section>
    );
};

export default Home;