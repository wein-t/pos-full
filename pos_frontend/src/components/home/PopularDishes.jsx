import React, { useState } from 'react';

const PopularDishes = ({ dishes, isLoading, availableCategories = [] }) => {
    const [selectedCategory, setSelectedCategory] = useState('All');
    

    const categories = ['All', ...availableCategories];
    
    // Filter Logic
    const filteredDishes = selectedCategory === 'All' 
        ? dishes 
        : dishes.filter(dish => dish.category === selectedCategory);

    return (
        <>
            <style jsx>{`
                /* Always give the scrollbar a width to prevent layout shift */
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                    background: transparent;
                }
                /* The thumb is transparent by default */
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: transparent;
                    border-radius: 4px;
                }
                /* Only show the thumb on hover */
                .custom-scrollbar:hover::-webkit-scrollbar-thumb {
                    background: rgba(128, 128, 128, 0.6);
                }
                /* Modern way to reserve space for the scrollbar */
                .scrollbar-stable {
                    scrollbar-gutter: stable;
                }
            `}</style>

            <div className='mt-6 pr-6 h-full pb-20'>
                <div className='bg-[#1a1a1a] w-full rounded-lg h-full flex flex-col'>
                     <div className='flex justify-between items-center px-6 py-4 border-b border-[#333]'>
                        <h1 className='text-[#f5f5f5] text-lg font-semibold tracking-wide'>Top Picks</h1>
                        
                        {/* Dynamic Dropdown from Database Categories */}
                        <div className='relative'>
                            <select 
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className='bg-[#2a2a2a] text-[#f5f5f5] text-sm font-semibold px-3 py-2 rounded-lg border border-[#3a3a3a] hover:border-[#f6b100] focus:border-[#f6b100] focus:outline-none transition-colors cursor-pointer'
                            >
                                {categories.map(category => (
                                    <option key={category} value={category} className='bg-[#2a2a2a] text-[#f5f5f5]'>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>


                    <div className='overflow-y-auto custom-scrollbar scrollbar-stable px-6 pb-4 flex-1'>
                        {isLoading ? (
                            <p className="text-center text-gray-400 mt-10">Calculating stats...</p>
                        ) : filteredDishes.length === 0 ? (
                            <div className="flex flex-col items-center justify-center mt-10 text-gray-500">
                                <p>No popular dishes found.</p>
                                {selectedCategory !== 'All' && <p className="text-sm mt-2">Try a different category.</p>}
                            </div>
                        ) : (
                            filteredDishes.map((dish, index) => (
                                <div key={dish.id} className='flex items-center gap-4 bg-[#1f1f1f] rounded-[15px] px-6 py-4 mt-4 hover:bg-[#252525] transition-colors'>
                                    <h1 className='text-[#f5f5f5] font-bold text-xl w-8 text-center flex-shrink-0 opacity-50'>
                                        {index + 1 < 10 ? `0${index + 1}` : index + 1}
                                    </h1>
                                    
                                    <div className="w-[50px] h-[50px] rounded-full bg-[#2a2a2a] flex items-center justify-center text-2xl shadow-inner">
                                        {dish.icon}
                                    </div>

                                    <div className='flex-1 min-w-0'>
                                        <h1 className='text-[#f5f5f5] font-semibold tracking-wide truncate' title={dish.name}>
                                            {dish.name}
                                        </h1>
                                        <div className='flex items-center justify-between mt-1'>
                                            <p className='text-[#ababab] text-xs font-medium'>
                                                <span className='text-[#f5f5f5] font-bold'>{dish.numberOfOrders}</span> Orders
                                            </p>
                                            {dish.category && (
                                                <span className='text-[10px] text-[#f6b100] bg-[#f6b100]/10 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold'>
                                                    {dish.category}
                                                </span>
                                            )}
                                        </div>
                                    </div> 
                                </div>
                            ))
                        )}           
                    </div>
                </div>
            </div>
        </>
    );
};

export default PopularDishes;