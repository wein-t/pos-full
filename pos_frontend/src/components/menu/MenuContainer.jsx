import React, { useState, useEffect } from "react";
import { GrRadialSelected } from "react-icons/gr";
import { FaShoppingCart, FaSearch } from "react-icons/fa"; 
import { useDispatch } from "react-redux";
import { addItems } from "../../redux/slices/cartSlice";
import { useQuery } from "@tanstack/react-query";
import { getMenus } from "../../https";
import FullScreenLoader from "../shared/FullScreenLoader"; 

const MenuContainer = () => {
    
    // 1. FETCH MENUS FROM DB INSTEAD OF LOCAL CONSTANTS
    const { data: menuData, isLoading } = useQuery({
        queryKey: ['menus'],
        queryFn: getMenus
    });

    const menus = menuData?.data?.data || [];

    const [selected, setSelected] = useState(null);
    const dispatch = useDispatch();
    const [itemCounts, setItemCounts] = useState({});
    const [searchTerm, setSearchTerm] = useState("");

    // 2. Set default selection when data loads
    useEffect(() => {
        if (menus.length > 0 && !selected) {
            setSelected(menus[0]);
        }
    }, [menus, selected]);

    const increment = (id) => {
        setItemCounts(prevCounts => {
            const currentCount = prevCounts[id] || 0;
            if (currentCount >= 100) return prevCounts;
            return { ...prevCounts, [id]: currentCount + 1 };
        });
    };

    const decrement = (id) => {
        setItemCounts(prevCounts => {
            const currentCount = prevCounts[id] || 0;
            if (currentCount <= 0) return prevCounts;
            return { ...prevCounts, [id]: currentCount - 1 };
        });
    };

    const handleAddToCart = (item) => {
        const count = itemCounts[item._id] || 0; // Use _id from MongoDB
        if (count === 0) return;
        const { name, price } = item;
        const newObj = { name, pricePerQuantity: price, quantity: count, price: price * count };
        dispatch(addItems(newObj));
        setItemCounts(prevCounts => ({ ...prevCounts, [item._id]: 0 }));
    };
   
    if (isLoading) return <FullScreenLoader />;
    
    if (menus.length === 0) return (
        <div className="flex items-center justify-center h-full text-white">
            <p>No menu items found. Go to Admin {'>'} Manage Menu to add some!</p>
        </div>
    );
    
    if (!selected) return null;

    const filteredItems = selected?.items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-full flex flex-col">
            
            {/* Category Grid */}
            <div className="grid grid-cols-4 gap-4 px-10 py-4 w-full">
                {menus.map((menu) => (
                    <div
                        key={menu._id}
                        className="flex flex-col items-center justify-between p-4 rounded-lg h-[100px] cursor-pointer"
                        style={{ backgroundColor: menu.bgColor }}
                        onClick={() => {
                            setSelected(menu);
                            setItemCounts({});
                            setSearchTerm(""); 
                        }}
                    >
                        <div className="flex items-center justify-between w-full">
                            <h1 className="text-[#f5f5f5] text-lg font-semibold">{menu.icon} {menu.name}</h1>
                            {selected._id === menu._id && <GrRadialSelected className="text-white" size={20} />}
                        </div>
                        <p className="text-[#ababab] text-sm font-semibold">{menu.items.length} Items</p>
                    </div>
                ))}
            </div>

            <hr className="border-[#2a2a2a] border-t-2 mt-4" />
            
            {/* Search Bar */}
            <div className="px-10 py-4">
                <div className="flex items-center gap-4 bg-[#1f1f1f] rounded-lg px-4 py-2">
                    <FaSearch className='text-gray-400' />
                    <input
                        type="text"
                        placeholder={`Search in ${selected.name}...` || "Search..."}
                        className='bg-transparent outline-none text-white w-full'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            
            {/* Items Grid */}
            <div className="flex-1 overflow-y-auto scrollbar-hide px-10 py-4 pb-24">
                <div className="grid grid-cols-4 gap-4 w-full">
                    {filteredItems.map((item) => (
                        <div key={item._id} className="flex flex-col items-start justify-between p-4 rounded-lg h-[150px] cursor-pointer hover:bg-[#2a2a2a] bg-[#1a1a1a]">
                            <div className="flex items-center justify-between w-full">
                                <h1 className="text-[#f5f5f5] text-lg font-semibold">{item.name}</h1>
                                <button onClick={() => handleAddToCart(item)} className="bg-[#2e4a40]  text-[#02ca3a] p-2 rounded-lg cursor-pointer hover:bg-[#3a5f51] transition-colors">
                                    <FaShoppingCart size={20} />
                                </button>
                            </div>
                            <div className="flex items-center justify-between w-full">
                                <p className="text-[#f5f5f5] text-xl font-bold">₱{item.price}</p>
                                <div className="flex items-center justify-between bg-[#1f1f1f] px-4 py-3 rounded-lg gap-6">
                                    <button onClick={() => decrement(item._id)} className="text-yellow-500 hover:text-yellow-400 transition-colors text-2xl cursor-pointer">−</button>
                                    <span className="text-white">{itemCounts[item._id] || 0}</span>
                                    <button onClick={() => increment(item._id)} className="cursor-pointer text-yellow-500 hover:text-yellow-400 transition-colors text-2xl cursor-pointer">+</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MenuContainer;